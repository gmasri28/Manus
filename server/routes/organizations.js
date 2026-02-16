
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");

// Helper to log activity
const logActivity = (userId, action, details) => {
  db.prepare("INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)").run(userId, action, details);
};

// @route   POST /api/organizations/opportunities
// @desc    Org Admin creates a new opportunity
// @access  Private (Org Admin)
router.post("/opportunities", auth("org_admin"), async (req, res) => {
  const { title, description, location, start_date, end_date, total_slots } = req.body;
  const orgId = req.user.org_id;

  try {
    const organization = db.prepare("SELECT status FROM organizations WHERE id = ?").get(orgId);
    if (!organization || organization.status !== "approved") {
      return res.status(403).json({ msg: "Organization not approved to create opportunities" });
    }

    const result = db
      .prepare(
        "INSERT INTO opportunities (org_id, title, description, location, start_date, end_date, total_slots, remaining_slots, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(orgId, title, description, location, start_date, end_date, total_slots, total_slots, "draft");

    logActivity(req.user.id, "CREATE_OPPORTUNITY", `Opportunity ${title} (ID: ${result.lastInsertRowid}) created by Org ID ${orgId}`);

    res.status(201).json({ msg: "Opportunity created successfully", opportunityId: result.lastInsertRowid });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT /api/organizations/opportunities/:id
// @desc    Org Admin updates an opportunity
// @access  Private (Org Admin)
router.put("/opportunities/:id", auth("org_admin"), async (req, res) => {
  const { id } = req.params;
  const { title, description, location, start_date, end_date, total_slots, status } = req.body;
  const orgId = req.user.org_id;

  try {
    const opportunity = db.prepare("SELECT * FROM opportunities WHERE id = ? AND org_id = ?").get(id, orgId);
    if (!opportunity) {
      return res.status(404).json({ msg: "Opportunity not found or not authorized" });
    }

    // Ensure remaining_slots is updated if total_slots changes
    let newRemainingSlots = opportunity.remaining_slots;
    if (total_slots && total_slots !== opportunity.total_slots) {
      const signedUpVolunteers = db.prepare("SELECT COUNT(*) as count FROM signups WHERE opportunity_id = ? AND status = 'registered'").get(id).count;
      if (total_slots < signedUpVolunteers) {
        return res.status(400).json({ msg: "Total slots cannot be less than current sign-ups" });
      }
      newRemainingSlots = total_slots - signedUpVolunteers;
    }

    // Update status based on remaining slots if it becomes 0
    let newStatus = status || opportunity.status;
    if (newRemainingSlots === 0 && newStatus === "published") {
      newStatus = "full";
    }

    db.prepare(
      "UPDATE opportunities SET title = ?, description = ?, location = ?, start_date = ?, end_date = ?, total_slots = ?, remaining_slots = ?, status = ? WHERE id = ? AND org_id = ?"
    ).run(title, description, location, start_date, end_date, total_slots, newRemainingSlots, newStatus, id, orgId);

    logActivity(req.user.id, "UPDATE_OPPORTUNITY", `Opportunity ${title} (ID: ${id}) updated by Org ID ${orgId}`);

    res.json({ msg: "Opportunity updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/organizations/opportunities
// @desc    Org Admin views their opportunities
// @access  Private (Org Admin)
router.get("/opportunities", auth("org_admin"), async (req, res) => {
  const orgId = req.user.org_id;
  try {
    const opportunities = db.prepare("SELECT * FROM opportunities WHERE org_id = ?").all(orgId);
    res.json(opportunities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/organizations/opportunities/:id/volunteers
// @desc    Org Admin views volunteers signed up for a specific opportunity
// @access  Private (Org Admin)
router.get("/opportunities/:id/volunteers", auth("org_admin"), async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.org_id;

  try {
    const opportunity = db.prepare("SELECT id FROM opportunities WHERE id = ? AND org_id = ?").get(id, orgId);
    if (!opportunity) {
      return res.status(404).json({ msg: "Opportunity not found or not authorized" });
    }

    const volunteers = db.prepare("SELECT s.id as signup_id, u.id as volunteer_id, u.email, s.status FROM signups s JOIN users u ON s.volunteer_id = u.id WHERE s.opportunity_id = ?").all(id);
    res.json(volunteers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT /api/organizations/signups/:id/status
// @desc    Org Admin marks attendance/status for a volunteer signup
// @access  Private (Org Admin)
router.put("/signups/:id/status", auth("org_admin"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., 'completed', 'cancelled'
  const orgId = req.user.org_id;

  if (!["registered", "completed", "cancelled"].includes(status)) {
    return res.status(400).json({ msg: "Invalid status provided" });
  }

  try {
    const signup = db.prepare("SELECT s.id, s.opportunity_id, o.org_id FROM signups s JOIN opportunities o ON s.opportunity_id = o.id WHERE s.id = ?").get(id);

    if (!signup || signup.org_id !== orgId) {
      return res.status(404).json({ msg: "Signup not found or not authorized" });
    }

    db.prepare("UPDATE signups SET status = ? WHERE id = ?").run(status, id);

    logActivity(req.user.id, "UPDATE_SIGNUP_STATUS", `Signup ID ${id} status updated to ${status} by Org ID ${orgId}`);

    res.json({ msg: `Signup status updated to ${status}` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/organizations/opportunities/:id/export-csv
// @desc    Org Admin exports volunteer list for an opportunity as CSV
// @access  Private (Org Admin)
router.get("/opportunities/:id/export-csv", auth("org_admin"), async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.org_id;

  try {
    const opportunity = db.prepare("SELECT id, title FROM opportunities WHERE id = ? AND org_id = ?").get(id, orgId);
    if (!opportunity) {
      return res.status(404).json({ msg: "Opportunity not found or not authorized" });
    }

    const volunteers = db.prepare("SELECT u.email, s.status, s.created_at FROM signups s JOIN users u ON s.volunteer_id = u.id WHERE s.opportunity_id = ?").all(id);

    let csv = "Email,Status,Signed Up At\n";
    volunteers.forEach(v => {
      csv += `${v.email},${v.status},${v.created_at}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment(`${opportunity.title.replace(/ /g, "_")}_volunteers.csv`);
    res.send(csv);

    logActivity(req.user.id, "EXPORT_VOLUNTEERS_CSV", `Exported volunteer list for opportunity ${opportunity.title} (ID: ${id}) by Org ID ${orgId}`);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
