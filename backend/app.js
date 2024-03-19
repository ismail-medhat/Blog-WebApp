const express = require("express");
const connectToDb = require("./config/connectToDb");
require("dotenv").config();

// Connection To DB
connectToDb();

// Init App
const app = express();

// Middlewares
app.use(express.json());

//  Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/posts", require("./routes/postsRoute"));

// Running The Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on poert ${PORT}`)
);
