
const express = require("express");
const router = express.Router();
const db = require("../db");

// @route   GET /api/public/opportunities
// @desc    Get all published and approved opportunities with optional filters
// @access  Public
router.get("/opportunities", async (req, res) => {
  const { location, startDate, endDate } = req.query;
  let query = `
    SELECT
      o.id,
      o.title,
      o.description,
      o.location,
      o.start_date,
      o.end_date,
      o.remaining_slots,
      org.name as organization_name,
      org.logo_path
    FROM opportunities o
    JOIN organizations org ON o.org_id = org.id
    WHERE o.status = 'published' AND org.status = 'approved'
  `;
  const params = [];

  if (location) {
    query += " AND o.location LIKE ?";
    params.push(`%${location}%`);
  }
  if (startDate) {
    query += " AND o.start_date >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND o.end_date <= ?";
    params.push(endDate);
  }

  try {
    const opportunities = db.prepare(query).all(params);
    res.json(opportunities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/public/opportunities/:id
// @desc    Get a single opportunity by ID
// @access  Public
router.get("/opportunities/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const opportunity = db.prepare(`
      SELECT
        o.id,
        o.title,
        o.description,
        o.location,
        o.start_date,
        o.end_date,
        o.total_slots,
        o.remaining_slots,
        o.status,
        org.name as organization_name,
        org.description as organization_description,
        org.contact_email as organization_contact_email,
        org.logo_path
      FROM opportunities o
      JOIN organizations org ON o.org_id = org.id
      WHERE o.id = ? AND o.status = 'published' AND org.status = 'approved'
    `).get(id);

    if (!opportunity) {
      return res.status(404).json({ msg: "Opportunity not found or not available" });
    }

    res.json(opportunity);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
