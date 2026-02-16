
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/organizations", require("./routes/organizations"));
app.use("/api/volunteers", require("./routes/volunteers"));
app.use("/api/public", require("./routes/public"));

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Voluntarios Backend API");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
