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
/**
 * POST /api/customer/location/update
 * Update customer's current location (for real-time tracking)
 */
router.post("/update", auth, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ msg: "Latitude and longitude required" });
    }
    
    const customer = await Customer.findById(req.user.id);
    
    if (!customer) {
      return res.status(404).json({ msg: "Customer not found" });
    }
    
    // Update current location
    customer.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
      updatedAt: new Date()
    };
    
    // Also update main location field for backward compatibility
    customer.location = {
      type: "Point",
      coordinates: [longitude, latitude]
    };
    
    if (address) {
      customer.address = address;
    }
    
    await customer.save();
    
    console.log(`📍 Customer ${customer.fullName} location updated:`, { latitude, longitude });
    
    // If there's an active/accepted request, notify the provider
    const activeRequest = await ServiceRequest.findOne({
      customer: customer._id,
      status: { $in: ["accepted", "in-progress"] }
    }).populate('provider', 'socketId');
    
    if (activeRequest && activeRequest.provider && activeRequest.provider.socketId) {
      const io = req.app.get("io");
      io.to(activeRequest.provider.socketId).emit("customer-location-update", {
        requestId: activeRequest._id,
        customerId: customer._id,
        customerName: customer.fullName,
        location: {
          latitude,
          longitude,
          coordinates: [longitude, latitude]
        },
        address: address || customer.address,
        timestamp: new Date()
      });
      console.log("📡 Sent location update to provider via socket");
    }
    
    res.json({
      msg: "Location updated successfully",
      location: {
        latitude,
        longitude,
        address: address || customer.address
      }
    });
    
  } catch (err) {
    console.error("❌ Location update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// ✅ Proper export for safeMount / require
module.exports = router;