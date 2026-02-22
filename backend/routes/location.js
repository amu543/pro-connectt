// routes/location.js
const express = require("express");
const router = express.Router();
const Customer = require("../models/customer");
const auth = require("../middleware/customerAuth");

// -----------------------------
// POST /api/customer/location
// Update customer location
// -----------------------------
const updateLocationHandler = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ msg: "Latitude & longitude required" });
    }

    const updateResult = await Customer.findByIdAndUpdate(req.user.id, {
      location: { type: "Point", coordinates: [longitude, latitude] }
    });

    console.log(
      `Location update result for customer ${req.user.id}:`,
      updateResult ? "Success" : "Failed or not found"
    );

    res.json({ msg: "Location updated successfully" });
  } catch (err) {
    console.error("Update location error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Support both POST /api/customer/location and /api/customer/location/update
router.post("/", auth, updateLocationHandler);
router.post("/update", auth, updateLocationHandler);

// -----------------------------
// GET /api/customer/location/my-location
// Fetch current customer location
// -----------------------------
router.get("/my-location", auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select("location");
    if (!customer || !customer.location) {
      return res.status(404).json({ msg: "Location not found" });
    }

    res.json({
      latitude: customer.location.coordinates[1],
      longitude: customer.location.coordinates[0]
    });
  } catch (err) {
    console.error("Fetch location error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Proper export for safeMount / require
module.exports = router;