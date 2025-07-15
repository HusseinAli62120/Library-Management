const router = require("express").Router();
const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "library",
});

router.get("/borrowings", (req, res) => {
  return res
    .status(200)
    .json({ message: "This is the borrowings backend" });
});

// Get active borrowings
router.get("/getBorrowings", (req, res) => {
  const q =
    "SELECT borrow_date, email as 'email', title as 'title', quantity as 'quantity', faculty.id as 'faculty_id', data.id as 'data_id' FROM transactions JOIN faculty ON faculty_id = faculty.id JOIN data ON document_id = data.id WHERE status = ?;";
  db.query(q, [1], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server Error." });
    }
    return res.status(200).json(result);
  });
});

// Assign
router.post("/assign", async (req, res) => {
  const { id, selectedDoc } = req.body;

  try {
    // Check to see if the person is a faculty member.
    const q1 = "SELECT * FROM faculty WHERE id_number = ?";
    const person = await new Promise((resolve, reject) => {
      db.query(q1, [id], (err, result) => {
        if (err) {
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        if (!result[0]) {
          return reject({
            status: 404,
            message: "User not found in faculty.",
          });
        }
        resolve(result[0]);
      });
    });

    // If the person is a student.
    if (person?.role !== "Professor") {
      // Check if the person has two active borrowings.
      const q2 =
        "SELECT COUNT(*) AS active_borrowings FROM transactions WHERE faculty_id = ? AND status = ?";
      await new Promise((resolve, reject) => {
        db.query(q2, [person.id, 1], (err, result) => {
          if (err) {
            console.log(err);
            return reject({
              status: 500,
              message: "Internal Server Error.",
            });
          }
          if (result[0].active_borrowings >= 2) {
            return reject({
              status: 409,
              message: "User already has two active borrowings.",
            });
          }
          resolve();
        });
      });
    }

    // Person in faculty does not have two active borrowings, or he is a professor. Fetch the document by title or ISBN to assign the borrowing.
    const q3 =
      "SELECT * FROM data WHERE (title = ? OR ISBN = ?) AND quantity >= ?";
    const document = await new Promise((resolve, reject) => {
      db.query(q3, [selectedDoc, selectedDoc, 1], (err, result) => {
        if (err)
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        if (!result[0])
          return reject({
            status: 404,
            message: "Document not found",
          });
        resolve(result[0]);
      });
    });
    console.log(document);

    //Assign the borrowing
    const q4 =
      "INSERT INTO transactions(document_id, faculty_id, status, borrow_date) VALUES(?,?,?,?)";

    const currentDate = new Date(); // Current date
    currentDate.setDate(currentDate.getDate() + 7); // Add 7 days to the current date
    const dueDate = currentDate.toLocaleDateString(); // Format the date as a localized string

    await new Promise((resolve, reject) => {
      db.query(
        q4,
        [document.id, person.id, 1, dueDate],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject({
              status: 500,
              message: "Internal Server Error",
            });
          }
        }
      );
      // Update the quantity
      const q5 = "UPDATE data SET quantity = ? WHERE id = ?";
      const newQuantity = document.quantity - 1;
      db.query(q5, [newQuantity, document.id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        resolve();
      });
    });

    // Return the updated documents
    const q6 = "SELECT * from data WHERE quantity >= ?";
    const updatedDocs = await new Promise((resolve, reject) => {
      db.query(q6, [1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        console.log(result);
        resolve(result);
      });
    });

    // Return the updated borrowings.
    const activeBorrowings = await new Promise((resolve, reject) => {
      const q =
        "SELECT borrow_date, email as 'email', title as 'title', quantity as 'quantity', faculty.id as 'faculty_id', data.id as 'data_id' FROM transactions JOIN faculty ON faculty_id = faculty.id JOIN data ON document_id = data.id WHERE status = ?;";
      db.query(q, [1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        resolve(result);
      });
    });

    // Get user-specific borrowings
    const userBorrowings = await new Promise((resolve, reject) => {
      const q =
        "SELECT renew, borrow_date, title, document_id FROM transactions JOIN data ON transactions.document_id = data.id WHERE faculty_id = ? AND status = ?";
      db.query(q, [person.id, 1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        resolve(result);
      });
    });

    // Send the success response
    return res.status(200).json({
      message: "Borrowing has been assigned.",
      docs: updatedDocs,
      activeBorrowings: activeBorrowings,
      userBorrowings: userBorrowings,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
});

// Button resolve
router.put("/btnResolve", async (req, res) => {
  const { faculty_id, data_id } = req.body;

  try {
    await new Promise((resolve, reject) => {
      // Set status to 0
      const q =
        "UPDATE transactions SET status = ? WHERE faculty_id = ? AND document_id = ? AND status = ?";
      db.query(q, [0, faculty_id, data_id, 1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
      });

      // Update the quantity
      const q2 =
        "UPDATE data SET quantity = quantity + 1 WHERE id = ?";
      db.query(q2, [data_id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        resolve();
      });
    });

    const activeBorrowings = await new Promise((resolve, reject) => {
      const q =
        "SELECT borrow_date, email as 'email', title as 'title', quantity as 'quantity', faculty.id as 'faculty_id', data.id as 'data_id' FROM transactions JOIN faculty ON faculty_id = faculty.id JOIN data ON document_id = data.id WHERE status = ?;";
      db.query(q, [1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        resolve(result);
      });
    });

    // Return the updated documents
    const q6 = "SELECT * from data WHERE quantity >= ?";
    const updatedDocs = await new Promise((resolve, reject) => {
      db.query(q6, [1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        console.log(result);
        resolve(result);
      });
    });

    const userBorrowings = await new Promise((resolve, reject) => {
      const q =
        "SELECT renew, borrow_date, title, document_id FROM transactions JOIN data ON transactions.document_id = data.id WHERE faculty_id = ? AND status = ?";
      db.query(q, [faculty_id, 1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        resolve(result);
      });
    });

    // Return the active borrowings
    return res.status(200).json({
      message: "Borrowing has been resolve.",
      docs: updatedDocs,
      borrowings: activeBorrowings,
      userBorrowings: userBorrowings,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
});

// Scan resolve
router.put("/scanResolve", async (req, res) => {
  const { cardId, selectedDoc } = req.body;

  try {
    // Get user data from id_number
    const user = await new Promise((resolve, reject) => {
      const q = "SELECT * from faculty WHERE id_number = ?";
      db.query(q, [cardId], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        if (!result[0]) {
          return reject({
            status: 404,
            message: "User does not exist",
          });
        }
        resolve(result[0]);
      });
    });

    // Get the document selected to be returned. We do this because we need it's ID.
    const document = await new Promise((resolve, reject) => {
      const q = "SELECT * FROM data WHERE (title = ? OR ISBN = ?)";
      db.query(q, [selectedDoc, selectedDoc], (err, result) => {
        if (err)
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        if (!result[0])
          return reject({
            status: 404,
            message: "Document not found",
          });
        resolve(result[0]);
      });
    });

    // Check if the user has a borrowing.
    await new Promise((resolve, reject) => {
      const q =
        "SELECT * from transactions WHERE faculty_id = ? AND document_id = ? AND status = ?";
      db.query(q, [user.id, document?.id, 1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        if (!result[0]) {
          return reject({
            status: 404,
            message: "User does not have a borrowing.",
          });
        }
        resolve();
      });
    });

    // Resolve
    await new Promise((resolve, reject) => {
      // Set status to 0
      const q =
        "UPDATE transactions SET status = ? WHERE faculty_id = ? AND document_id = ? AND status = ?";
      db.query(q, [0, user.id, document?.id, 1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
      });

      const q2 =
        "UPDATE data SET quantity = quantity + 1 WHERE id = ?";
      db.query(q2, [document?.id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        resolve();
      });
    });

    // Get the updated documents
    const q6 = "SELECT * from data WHERE quantity >= ?";
    const updatedDocs = await new Promise((resolve, reject) => {
      db.query(q6, [1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        console.log(result);
        resolve(result);
      });
    });

    // Get active borrowings
    const activeBorrowings = await new Promise((resolve, reject) => {
      const q =
        "SELECT borrow_date, email as 'email', title as 'title', quantity as 'quantity', faculty.id as 'faculty_id', data.id as 'data_id' FROM transactions JOIN faculty ON faculty_id = faculty.id JOIN data ON document_id = data.id WHERE status = ?;";
      db.query(q, [1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        resolve(result);
      });
    });

    // Get user-specific borrowings
    const userBorrowings = await new Promise((resolve, reject) => {
      const q =
        "SELECT renew, borrow_date, title, document_id FROM transactions JOIN data ON transactions.document_id = data.id WHERE faculty_id = ? AND status = ?";
      db.query(q, [user.id, 1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        resolve(result);
      });
    });

    // Return the active borrowings
    return res.status(200).json({
      message: "Borrowing has been resolve.",
      docs: updatedDocs,
      borrowings: activeBorrowings,
      userBorrowings: userBorrowings,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
});

router.get("/userInfo", async (req, res) => {
  const email = req.query.email;

  console.log(email);

  try {
    // Get userInfo if they are in the faculty
    const userInfo = await new Promise((resolve, reject) => {
      const q =
        "SELECT faculty.id,faculty.email,faculty.role,faculty.id_number FROM faculty JOIN members ON members.email = faculty.email WHERE faculty.email = ?";
      db.query(q, [email], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        if (!result.length) {
          return reject({
            status: 404,
            message: "User does not exist",
          });
        }
        resolve(result[0]);
      });
    });

    // Get user-specific borrowings
    const userBorrowings = await new Promise((resolve, reject) => {
      const q =
        "SELECT renew, borrow_date, title, document_id FROM transactions JOIN data ON transactions.document_id = data.id WHERE faculty_id = ? AND status = ?";
      db.query(q, [userInfo.id, 1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        resolve(result);
      });
    });

    return res.status(200).json({
      userInfo: userInfo,
      userBorrowings: userBorrowings, // Return full array instead of just one item
    });
  } catch (error) {
    console.log(error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});

router.put("/extend", async (req, res) => {
  const { date, document_id, renew, userId } = req.body;

  console.log(userId);
  try {
    const stock = await new Promise((resolve, reject) => {
      const q = "SELECT quantity FROM data WHERE id = ?";
      db.query(q, [document_id], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        // console.log(result[0]);
        if (result[0].quantity === 0) {
          console.log("Out of stock");
          return reject({
            status: 409,
            message: "Can't renew, document is out of stock.",
          });
        }
        resolve(result[0]);
      });
    });

    await new Promise((resolve, reject) => {
      const q =
        "UPDATE transactions SET borrow_date = ?, renew = ? WHERE document_id = ? AND faculty_id = ?";

      const updatedRenew = renew + 1;
      const parsedDate = new Date(date);
      parsedDate.setDate(parsedDate.getDate() + 7);
      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth() + 1; // Months are zero-indexed (0-11), so we add 1
      const day = parsedDate.getDate();

      // Construct the full date string
      const fullDate = `${month.toString()}/${day.toString()}/${year.toString()}`;
      db.query(
        q,
        [fullDate, updatedRenew, document_id, userId],
        (err, result) => {
          if (err) {
            console.log(err);
            return reject({
              status: 500,
              message: "Internal Server Error",
            });
          }
          resolve();
        }
      );
    });

    // Get user-specific borrowings
    const userBorrowings = await new Promise((resolve, reject) => {
      const q =
        "SELECT renew, borrow_date, title, document_id FROM transactions JOIN data ON transactions.document_id = data.id WHERE faculty_id = ? AND status = ?";
      db.query(q, [userId, 1], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal Server Error",
          });
        }
        resolve(result);
      });
    });

    return res.status(200).json({
      message: `Borrowing has been extended successfuly.`,
      userBorrowings: userBorrowings,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
});

module.exports = router;
