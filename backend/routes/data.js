const router = require("express").Router();
const mysql = require("mysql");
const path = require("path");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

// db
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "library",
});

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Destination folder
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Save file with a unique name
  },
});

// Upload docs
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept PDF files only
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
  // limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Fetch documents, for borrowings.
router.get("/getDocs", (req, res) => {
  const q = "SELECT * from data WHERE quantity >= 1";
  db.query(q, (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal server error" });
    }
    return res.status(200).json(result);
  });
});

//  Fetch data for documents.
router.get("/getData", (req, res) => {
  const q = "SELECT * from data ORDER by title ASC";
  db.query(q, (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal server error" });
    }
    return res.status(200).json(result);
  });
});

// Add documents
router.post("/postDoc", async (req, res) => {
  const {
    title,
    author,
    category,
    language,
    cover,
    quantity,
    date,
    ISBN,
    shelf,
    link,
  } = req.body;

  try {
    // Check the ISBN for duplicates
    const duplicatedISBN = await new Promise((resolve, reject) => {
      const q = "SELECT * FROM data WHERE ISBN = ?";
      db.query(q, [ISBN], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error.",
          });
        }
        resolve(result[0]);
      });
    });

    // Check title and author for duplicates
    const duplicatedTitle = await new Promise((resolve, reject) => {
      const q =
        "SELECT * FROM data WHERE title = ? AND author = ? AND category = ?";
      db.query(q, [title, author, category], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error.",
          });
        }
        resolve(result[0]);
      });
    });

    // If there is a duplicate we increment the quantity.
    if (duplicatedISBN || duplicatedTitle) {
      await new Promise((resolve, reject) => {
        const q =
          "UPDATE data set quantity = quantity + ? WHERE ISBN = ? OR (title = ? AND author = ? AND category = ?)";
        db.query(
          q,
          [quantity, ISBN, title, author, category],
          (err, result) => {
            if (err) {
              console.log(err);
              return reject({
                status: 500,
                message: "Internal Server Error.",
              });
            }
          }
        );
        resolve();
      });
      return res.status(200).json({
        message: "Document already exists; quantity was increased.",
      });
    }

    // There is no duplicate, so we add the document.
    const insertInfo = await new Promise((resolve, reject) => {
      const q =
        "INSERT INTO data(title,author,category,language,cover_url,quantity,release_date,ISBN,shelf,document_url) VALUES(?,?,?,?,?,?,?,?,?,?)";
      console.log(link);
      db.query(
        q,
        [
          title,
          author,
          category,
          language,
          cover ? cover : null,
          quantity,
          date ? date : null,
          ISBN ? ISBN : null,
          shelf,
          link ? link : null,
        ],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject({
              status: 500,
              message: "Internal Server Error.",
            });
          }
          resolve(result);
        }
      );
    });

    // The document has been added
    return res.status(200).json({
      message: "Document has been added sucessfully",
      info: insertInfo,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
});

// Post content
// Show a warning if the file?.mimetype !== application/pdf
router.post("/postContent", upload.single("pdf"), (req, res) => {
  const { insertedId } = req.body;
  console.log(req.file);
  if (req.file) {
    const storagePath = `/uploads/${req.file.filename}`;
    const q = "UPDATE data SET document_url = ? WHERE id = ?";
    db.query(q, [storagePath, insertedId], (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Internal Server Error" });
      }
    });
  }
  // This is the same return message so that the res form the previous request won't be updated.
  return res
    .status(200)
    .json({ message: "Document has been added successfully" });
});

router.delete("/deleteDoc", async (req, res) => {
  const { id, url } = req.body; // Expecting filePath and id of the document to delete
  console.log(id, url);
  try {
    // If the file is in the storage, delete it.
    await new Promise((resolve, reject) => {
      if (url !== "N/A") {
        // Build the absolute path to the file
        const fileToDelete = path.join("public", url);
        console.log(fileToDelete);

        // If the file exists, delete it
        fs.unlink(fileToDelete, (err) => {
          if (err) {
            console.log(err);
            return reject({
              status: 500,
              message: "Internal Server error",
            });
          }
        });
      }
      resolve();
    });

    // Delete from the database also
    const deletedInfo = await new Promise((resolve, reject) => {
      const query = "DELETE FROM data WHERE id = ?";
      db.query(query, [id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Error deleting database entry.",
          });
        }
        resolve(result);
      });
    });

    // Get updated data.
    const updatedDocs = await new Promise((resolve, reject) => {
      if (deletedInfo.affectedRows > 0) {
        // We run this query to get the updated data, so we won't have to run a useEffect on the client side, and make another request.
        const q = "SELECT * from data ORDER BY title ASC";
        db.query(q, (err, result) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ message: "Internal server error" });
          }
          resolve(result);
        });
      }
    });
    return res.status(200).json({
      message: "Document has been deleted.",
      updatedDocs: updatedDocs,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
});

// Add users
router.post("/addUser", (req, res) => {
  const { email, role, userId } = req.body;
  const q = "INSERT INTO faculty(email,role,id_number) VALUES(?,?,?)";
  db.query(q, [email, role, userId], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server Error" });
    }
    return res
      .status(200)
      .json({ message: "User successfully added." });
  });
});

// Update documents.
router.put("/updateDoc", upload.single("pdf"), async (req, res) => {
  const {
    id,
    title,
    author,
    category,
    language,
    cover,
    quantity,
    date,
    ISBN,
    shelf,
    link,
    clear,
  } = req.body;

  try {
    // Get the document
    const document = await new Promise((resolve, reject) => {
      const q = "SELECT * FROM data WHERE id = ?";
      db.query(q, [id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            staus: 500,
            message: "Internal Server Error",
          });
        }
        resolve(result[0]);
      });
    });

    let storagePath = null;
    let fileToDelete = null;

    // If a file was uploaded, we create a link for it.
    if (req.file || link || clear === "true") {
      storagePath = `/uploads/${req?.file?.filename}`;
      const currentUrl = document?.document_url;
      // If the document already has content. It will be replaced, so we delete it.
      if (currentUrl) {
        fileToDelete = path.join("public", currentUrl);
        console.log(fileToDelete);

        // If the file exists, delete it
        fs.unlink(fileToDelete, (err) => {
          if (err) {
            console.log(err);
            return {
              status: 500,
              message: "Internal Server error",
            };
          }
        });
      }
    }

    // If neither was uploaded, we keep the previous link
    if (!link && !req.file) {
      storagePath = document?.document_url;
    }

    // If we uploaded a link, we don't want the link inserted to the db, to be undefined, so we do this.
    if (storagePath === "/uploads/undefined") {
      storagePath = null;
    }
    console.log("clear", clear);
    console.log("path", storagePath);
    console.log("link", link);
    // Update the document
    await new Promise((resolve, reject) => {
      let updatedLink = null;
      if (clear === "false") {
        updatedLink = storagePath
          ? storagePath
          : link
          ? link
          : document?.document_url;
      }

      console.log("result", updatedLink);
      const q =
        "UPDATE data SET title = ?, author = ?, category = ?, language = ?, cover_url = ?, quantity = ?, release_date = ?, ISBN = ?, shelf = ?, document_url = ? WHERE id = ?";
      db.query(
        q,
        [
          title,
          author,
          category,
          language,
          cover,
          quantity,
          date,
          ISBN,
          shelf,
          updatedLink,
          id,
        ],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject({
              staus: 500,
              message: "Internal Server Error",
            });
          }
          resolve();
        }
      );
    });

    // Get the updated docs
    const updatedDocs = await new Promise((resolve, reject) => {
      // We run this query to get the updated data, so we won't have to run a useEffect on the client side, and make another request.
      const q = "SELECT * from data ORDER BY title ASC";
      db.query(q, (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Internal server error" });
        }
        resolve(result);
      });
    });

    return res.status(200).json({
      message: "Document has been updated",
      updatedDocs: updatedDocs,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
});

// // Serve static files from the directory.
router.use("/uploads", express.static(path.join("public/uploads")));

module.exports = router;
