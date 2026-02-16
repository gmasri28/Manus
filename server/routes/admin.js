
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");
const bcrypt = require("bcryptjs");

// Helper to log activity
const logActivity = (userId, action, details) => {
  db.prepare("INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)").run(userId, action, details);
};

// @route   POST /api/admin/organizations
// @desc    Super Admin creates a new organization and assigns an org admin email
// @access  Private (Super Admin)
router.post("/organizations", auth("super_admin"), async (req, res) => {
  const { name, contact_email, description, org_admin_email, org_admin_password } = req.body;

  try {
    // Check if organization already exists
    let organization = db.prepare("SELECT id FROM organizations WHERE name = ?").get(name);
    if (organization) {
      return res.status(400).json({ msg: "Organization with this name already exists" });
    }

    // Check if org admin email already exists as a user
    let orgAdminUser = db.prepare("SELECT id FROM users WHERE email = ?").get(org_admin_email);
    if (orgAdminUser) {
      return res.status(400).json({ msg: "A user with the provided organization admin email already exists" });
    }

    // Create organization
    const orgResult = db
      .prepare(
        "INSERT INTO organizations (name, contact_email, description, status) VALUES (?, ?, ?, ?)"
      )
      .run(name, contact_email, description, "pending");
    const orgId = orgResult.lastInsertRowid;

    // Create org admin user
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(org_admin_password, salt);
    db.prepare(
      "INSERT INTO users (email, password_hash, role, org_id, email_verified) VALUES (?, ?, ?, ?, ?)"
    ).run(org_admin_email, password_hash, "org_admin", orgId, 1); // Org admin emails are considered verified upon creation

    logActivity(req.user.id, "CREATE_ORGANIZATION", `Organization ${name} created with ID ${orgId}. Org Admin: ${org_admin_email}`);

    res.status(201).json({ msg: "Organization and Org Admin created successfully", orgId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT /api/admin/organizations/:id/status
// @desc    Super Admin approves, rejects, or disables an organization
// @access  Private (Super Admin)
router.put("/organizations/:id/status", auth("super_admin"), async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!["approved", "rejected", "disabled"].includes(status)) {
    return res.status(400).json({ msg: "Invalid status provided" });
  }

  try {
    const organization = db.prepare("SELECT id, name FROM organizations WHERE id = ?").get(id);
    if (!organization) {
      return res.status(404).json({ msg: "Organization not found" });
    }

    db.prepare("UPDATE organizations SET status = ? WHERE id = ?").run(status, id);

    logActivity(req.user.id, "UPDATE_ORGANIZATION_STATUS", `Organization ${organization.name} (ID: ${id}) status updated to ${status}`);

    res.json({ msg: `Organization status updated to ${status}` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/admin/organizations
// @desc    Super Admin views all organizations with filters
// @access  Private (Super Admin)
router.get("/organizations", auth("super_admin"), async (req, res) => {
  const { status } = req.query;
  let query = "SELECT * FROM organizations";
  const params = [];

  if (status) {
    query += " WHERE status = ?";
    params.push(status);
  }

  try {
    const organizations = db.prepare(query).all(params);
    res.json(organizations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/admin/opportunities
// @desc    Super Admin views all opportunities
// @access  Private (Super Admin)
router.get("/opportunities", auth("super_admin"), async (req, res) => {
  try {
    const opportunities = db.prepare("SELECT o.*, org.name as organization_name FROM opportunities o JOIN organizations org ON o.org_id = org.id").all();
    res.json(opportunities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/admin/signups
// @desc    Super Admin views all signups
// @access  Private (Super Admin)
router.get("/signups", auth("super_admin"), async (req, res) => {
  try {
    const signups = db.prepare("SELECT s.*, u.email as volunteer_email, o.title as opportunity_title FROM signups s JOIN users u ON s.volunteer_id = u.id JOIN opportunities o ON s.opportunity_id = o.id").all();
    res.json(signups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
