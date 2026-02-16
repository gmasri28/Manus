
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");
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

// Helper to log activity
const logActivity = (userId, action, details) => {
  db.prepare("INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)").run(userId, action, details);
};

// @route   GET /api/volunteers/opportunities
// @desc    Volunteer browses all published opportunities
// @access  Private (Volunteer)
router.get("/opportunities", auth("volunteer"), async (req, res) => {
  try {
    const opportunities = db.prepare("SELECT o.*, org.name as organization_name FROM opportunities o JOIN organizations org ON o.org_id = org.id WHERE o.status = 'published' AND org.status = 'approved'").all();
    res.json(opportunities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST /api/volunteers/opportunities/:id/signup
// @desc    Volunteer signs up for an opportunity
// @access  Private (Volunteer)
router.post("/opportunities/:id/signup", auth("volunteer"), async (req, res) => {
  const { id } = req.params;
  const volunteerId = req.user.id;

  try {
    const opportunity = db.prepare("SELECT * FROM opportunities WHERE id = ? AND status = 'published'").get(id);
    if (!opportunity) {
      return res.status(404).json({ msg: "Opportunity not found or not published" });
    }

    if (opportunity.remaining_slots <= 0) {
      return res.status(400).json({ msg: "Opportunity is full" });
    }

    // Prevent duplicate signups
    const existingSignup = db.prepare("SELECT id FROM signups WHERE volunteer_id = ? AND opportunity_id = ?").get(volunteerId, id);
    if (existingSignup) {
      return res.status(400).json({ msg: "Already signed up for this opportunity" });
    }

    // Start a transaction for atomicity
    db.transaction(() => {
      db.prepare("INSERT INTO signups (volunteer_id, opportunity_id, status) VALUES (?, ?, ?)").run(volunteerId, id, "registered");
      db.prepare("UPDATE opportunities SET remaining_slots = remaining_slots - 1 WHERE id = ?").run(id);

      // Check if opportunity becomes full and update status
      const updatedOpportunity = db.prepare("SELECT remaining_slots FROM opportunities WHERE id = ?").get(id);
      if (updatedOpportunity.remaining_slots === 0) {
        db.prepare("UPDATE opportunities SET status = 'full' WHERE id = ?").run(id);
        logActivity(null, "OPPORTUNITY_STATUS_UPDATE", `Opportunity ${opportunity.title} (ID: ${id}) became full.`);
      }
    })(); // Immediately invoke the transaction

    logActivity(volunteerId, "SIGNUP_OPPORTUNITY", `Volunteer ${req.user.email} signed up for opportunity ${opportunity.title} (ID: ${id})`);

    // Send confirmation email to volunteer
    const volunteer = db.prepare("SELECT email FROM users WHERE id = ?").get(volunteerId);
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: volunteer.email,
      subject: "Voluntarios: Opportunity Signup Confirmation",
      html: `<p>You have successfully signed up for ${opportunity.title} at ${opportunity.location} on ${opportunity.start_date}.</p>`,
    });

    // Send notification email to organization admin
    const orgAdmin = db.prepare("SELECT email FROM users WHERE org_id = ? AND role = 'org_admin'").get(opportunity.org_id);
    if (orgAdmin) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: orgAdmin.email,
        subject: "Voluntarios: New Volunteer Signup",
        html: `<p>A new volunteer (${volunteer.email}) has signed up for your opportunity: ${opportunity.title}.</p>`,
      });
    }

    res.status(201).json({ msg: "Signed up successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT /api/volunteers/signups/:id/cancel
// @desc    Volunteer cancels their signup for an opportunity
// @access  Private (Volunteer)
router.put("/signups/:id/cancel", auth("volunteer"), async (req, res) => {
  const { id } = req.params;
  const volunteerId = req.user.id;

  try {
    const signup = db.prepare("SELECT s.id, s.opportunity_id, o.start_date, o.status FROM signups s JOIN opportunities o ON s.opportunity_id = o.id WHERE s.id = ? AND s.volunteer_id = ? AND s.status = 'registered'").get(id, volunteerId);

    if (!signup) {
      return res.status(404).json({ msg: "Signup not found or not authorized to cancel" });
    }

    // Prevent cancellation if opportunity has already started
    if (new Date(signup.start_date) < new Date()) {
      return res.status(400).json({ msg: "Cannot cancel signup for an opportunity that has already started" });
    }

    // Start a transaction for atomicity
    db.transaction(() => {
      db.prepare("UPDATE signups SET status = 'cancelled' WHERE id = ?").run(id);
      db.prepare("UPDATE opportunities SET remaining_slots = remaining_slots + 1 WHERE id = ?").run(signup.opportunity_id);

      // If opportunity was full, change status back to published if slots become available
      const updatedOpportunity = db.prepare("SELECT remaining_slots FROM opportunities WHERE id = ?").get(signup.opportunity_id);
      if (signup.status === 'full' && updatedOpportunity.remaining_slots > 0) {
        db.prepare("UPDATE opportunities SET status = 'published' WHERE id = ?").run(signup.opportunity_id);
        logActivity(null, "OPPORTUNITY_STATUS_UPDATE", `Opportunity ID ${signup.opportunity_id} changed from full to published.`);
      }
    })(); // Immediately invoke the transaction

    logActivity(volunteerId, "CANCEL_SIGNUP", `Volunteer ${req.user.email} cancelled signup ID ${id} for opportunity ID ${signup.opportunity_id}`);

    res.json({ msg: "Signup cancelled successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/volunteers/my-signups
// @desc    Volunteer views their signup history
// @access  Private (Volunteer)
router.get("/my-signups", auth("volunteer"), async (req, res) => {
  const volunteerId = req.user.id;

  try {
    const signups = db.prepare("SELECT s.id as signup_id, s.status as signup_status, s.created_at as signup_date, o.title, o.description, o.location, o.start_date, o.end_date, org.name as organization_name FROM signups s JOIN opportunities o ON s.opportunity_id = o.id JOIN organizations org ON o.org_id = org.id WHERE s.volunteer_id = ? ORDER BY o.start_date DESC").all(volunteerId);
    res.json(signups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
