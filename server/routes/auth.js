
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");

// Nodemailer transporter setup (replace with your actual SMTP settings)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.PASS,
  },
});

// @route   POST /api/auth/register
// @desc    Register a new volunteer user
// @access  Public
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = db
      .prepare(
        "INSERT INTO users (email, password_hash, role, email_verified) VALUES (?, ?, ?, ?)"
      )
      .run(email, password_hash, "volunteer", 0);

    const newUser = {
      id: result.lastInsertRowid,
      email,
      role: "volunteer",
      email_verified: 0,
    };

    // Generate email verification token (simple JWT for now)
    const verificationToken = jwt.sign(
      { user: { id: newUser.id } },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;

    // Send verification email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Verify Your Email for Voluntarios",
      html: `<p>Please click the link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
    });

    res.status(201).json({ msg: "Volunteer registered. Please verify your email." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/auth/verify-email
// @desc    Verify user email
// @access  Public
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ msg: "Verification token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id;

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.email_verified) {
      return res.status(200).json({ msg: "Email already verified" });
    }

    db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(userId);

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: "Invalid or expired verification token" });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    if (!user.email_verified && user.role === "volunteer") {
      return res.status(400).json({ msg: "Please verify your email first" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        org_id: user.org_id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/auth/me
// @desc    Get logged in user details
// @access  Private
router.get("/me", auth(), async (req, res) => {
  try {
    const user = db.prepare("SELECT id, email, role, org_id, email_verified FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
