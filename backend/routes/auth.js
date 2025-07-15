const router = require("express").Router();
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

// db
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "library",
});

// Generate tokens
const generateTokens = (email) => {
  const accessToken = jwt.sign(
    { email: email },
    // process.env.ACCESS_TOKEN_SECRET,
    "Access",
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { email: email },
    // process.env.REFRESH_TOKEN_SECRET,
    "Refresh",
    { expiresIn: "7d" } // We can change this to say 10s and when refreshing the page, it will go to login.
  );
  return { accessToken, refreshToken };
};

// Send verification code
router.post("/sendCode", async (req, res) => {
  try {
    // Generate a random 6-digit verification code
    const code = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Create a JWT with the code in the payload
    const token = jwt.sign(
      { verificationCode: code }, // Payload with the code
      "jwt", // Use a secret key from your environment
      { expiresIn: "10m" } // Set an expiration time for the code (e.g., 10 minutes)
    );

    // Send the code via email (this is the same as your current implementation)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"College Support" <${process.env.EMAIL}>`,
      to: req.body.email,
      subject: "Verification Code",
      text: `Your verification code is: ${code}`,
    });

    // Send the JWT to the frontend
    res
      .status(200)
      .json({ message: "Verification code sent", token: token });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error sending verification code" });
  }
});

// Sign up route
router.post("/signup", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = {
    email: req.body.email,
    password: hashedPassword,
    code: req.body.vericode,
    token: req.body.token,
  };

  try {
    // Check if the user already exists.
    await new Promise((resolve, reject) => {
      const q = "SELECT * FROM members WHERE email = ?";
      db.query(q, [user.email], (err, result) => {
        if (err) {
          console.log(err);
          return reject({
            status: 500,
            message: "Internal server error",
          });
        }
        if (result[0]) {
          return reject({
            status: 409,
            message: "User already exists, please login",
          });
        }

        // Compare the entered code with the stored one in the JWT
        const decoded = jwt.verify(user.token, "jwt");
        if (user.code !== decoded.verificationCode) {
          return reject({
            status: 409,
            message: "Incorrect verification code",
          });
        }
        resolve();
      });
    });

    // The user does not exist, so we create it.
    const tokens = generateTokens(user.email);

    // Create the user.
    await new Promise((resolve, reject) => {
      const q1 =
        "INSERT INTO members(email,password,token,role) VALUES(?,?,?,?)";
      db.query(
        q1,
        [user.email, user.password, tokens.refreshToken, "user"],
        (err, result) => {
          if (err) {
            return reject({
              status: 500,
              message: "Internal server error",
            });
          }
          res.cookie("jwt", tokens.refreshToken, {
            httpOnly: true, // Prevents client-side access
            maxAge: 7 * 24 * 60 * 60 * 1000, // Set cookie expiration to match refresh token
          });
          resolve();
        }
      );
    });

    // Return the user data to the frontend.
    const userData = await new Promise((resolve, reject) => {
      const q2 =
        "SELECT * FROM members WHERE email = ? AND password = ?";
      db.query(q2, [user?.email, user?.password], (err, result) => {
        if (err) {
          return reject({
            status: 500,
            message: "Internal server error",
          });
        }
        resolve(result[0]);
      });
    });
    return res.status(200).json({
      message: "Signed up successfully",
      email: userData.email,
      role: userData.role,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.log(error);
    if (error.status && error.message) {
      return res
        .status(error.status)
        .json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

// login
router.post("/login", async (req, res) => {
  const q = "SELECT * FROM members WHERE email = ?";

  // Check if the email exists in the db.
  db.query(q, [req.body.email], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Internal server error" });
    }
    if (!result[0]) {
      return res.status(404).json({ message: "Incorrect email" });
    }
    // If we get here, then a user exists, and there is no error, now we check the password before signing him them in
    const hashedpassword = result[0].password;
    bcrypt.compare(
      req.body.password,
      hashedpassword,
      (err, isMatch) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Internal server error" });
        }
        if (!isMatch) {
          return res
            .status(401)
            .json({ message: "Incorrect Password" });
        }

        // The password is correct, now give them a token.
        console.log(result[0]);
        const tokens = generateTokens(result[0].email);
        const user = result[0]; // This is the result of the SELECT query
        const q = "UPDATE members SET token = ? WHERE email = ?";

        db.query(
          q,
          [tokens.refreshToken, result[0].email],
          (err, result) => {
            if (err) {
              return res.json(err);
            }
            res.cookie("jwt", tokens.refreshToken, {
              httpOnly: true, // Prevents client-side access
              maxAge: 7 * 24 * 60 * 60 * 1000, // Set cookie expiration to match refresh token of 7d
            });
            return res.json({
              email: user.email,
              role: user.role,
              accessToken: tokens.accessToken,
            });
          }
        );
      }
    );
  });
});

// Token refresh route
router.get("/refresh", (req, res) => {
  const cookies = req.cookies;

  if (!cookies.jwt) {
    return res.status(401).json({ message: "No cookie was found" });
  }

  console.log(cookies.jwt);
  const refreshToken = cookies.jwt;

  const q = "SELECT * FROM members WHERE token = ?";

  db.query(q, [refreshToken], (err, result) => {
    if (err) {
      return res
        .status(401)
        .json("User with refresh token not found.");
    }
    jwt.verify(refreshToken, "Refresh", (err, decoded) => {
      if (err || result[0].email !== decoded.email) {
        // user_name is the one from the db. While name the label that we signed the jwt with
        return res.status(403).json("Forrbidden");
      }
      console.log(decoded);
      const accessToken = jwt.sign(
        { email: decoded.email },
        "Access",
        {
          expiresIn: "15m",
        }
      );
      const user = result[0];
      return res.json({
        accessToken: accessToken,
        email: user.email,
        role: user.role,
      });
    });
  });
});
// Logout route
router.get("/logout", (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(204).json({ message: "No cookie was found" });
  }

  const refreshToken = cookies.jwt;
  const q = "SELECT * FROM members WHERE token = ?";

  db.query(q, [refreshToken], (err, result) => {
    if (err) {
      return res.json(err);
    }
    if (!result[0]) {
      res.clearCookie("jwt");
      console.log("No user");
      return res
        .status(204)
        .json({ message: "No user with such cookie was found" });
    }
    const q = "UPDATE members SET token = ' ' WHERE email = ?";
    db.query(q, [result[0].email], (err, result) => {
      if (err) {
        return res.json(err);
      }
      res.clearCookie("jwt");
      console.log("db cookie");
      return res
        .status(204)
        .json({ message: "Cookie deleted. No content to send back" });
    });
  });
});


module.exports = router;
