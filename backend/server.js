const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // We need this to read from .env files
const authRouter = require("./routes/auth");
const dataRouter = require("./routes/data");
const borrowingsRouter = require("./routes/borrowings");

const app = express();
// We need this to read data from the request's body.
app.use(bodyParser.json());
// For the httpOnly cookie
app.use(cookieParser());
// Cors
app.use(
  cors({
    methods: "GET,POST,DELETE,PUT",
    origin: "http://localhost:5173",
    credentials: true,
  })
);
const PORT = process.env.PORT || 8002;

// This is the backend
app.get("/", (req, res) => {
  return res.json({ message: "This is the backend" });
});

// Authentication
app.use("", authRouter);

// Data entry
app.use("", dataRouter);

// Borrowings
app.use("/borrowings", borrowingsRouter);

// Start the server
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:8002");
});
