// routes/customerDashboard.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Customer = require("../models/customer");
const ServiceTaken = require("../models/servicetaken");
const ServiceProvider = require("../models/ServiceProvider");
const Rating = require("../models/rating"); // service provider ratings
const customerAuth = require("../middleware/customerAuth");
// Add this temporary test route at the top of your customerDashboard.js
router.get("/test", (req, res) => {
  console.log("✅ TEST ROUTE HIT!");
  res.json({ message: "Test route working" });
});

// Haversine formula to calculate distance in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


/**
 * GET /api/distance/providers
 * Returns all service providers sorted by distance from logged-in customer
 */
router.get("/providers/all", customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);

    if (!customer) return res.status(404).json({ msg: "Customer not found" });

    if (
      !customer.location ||
      !customer.location.coordinates ||
      customer.location.coordinates.length !== 2
    ) {
      return res.status(400).json({ msg: "Customer location not set" });
    }

    const customerLat = customer.location.coordinates[1]; // latitude
    const customerLng = customer.location.coordinates[0]; // longitude

    const providers = await ServiceProvider.find({ role: "provider" });

    const providersWithDistance = providers
      .map((provider) => {
        if (
          !provider.location ||
          !provider.location.coordinates ||
          provider.location.coordinates.length !== 2
        )
          return null;

        const providerLat = provider.location.coordinates[1];
        const providerLng = provider.location.coordinates[0];

        const distance = getDistanceFromLatLonInKm(
          customerLat,
          customerLng,
          providerLat,
          providerLng
        );

        return {
          id: provider._id,
          fullName: provider.fullName,
          email: provider.email,
          phone: provider.phone,
          role: provider.role,
          location: provider.location,
          distanceInKm: distance.toFixed(2),
        };
      })
      .filter((p) => p !== null); // remove providers without location

    // Sort by nearest distance
    providersWithDistance.sort((a, b) => a.distanceInKm - b.distanceInKm);

    res.json({
      msg: "Providers sorted by distance",
      count: providersWithDistance.length,
      providers: providersWithDistance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

/**
 * GET /api/dashboard/providers/:serviceType
 * Returns all providers of a service with name, ratings, services done, distance, experience, skills
 */
router.get("/providers/:service", customerAuth, async (req, res) => {
  try {
     const urlService = req.params.service;
     const exactService = req.query.exactService;
      console.log("1. URL param:", urlService);
    console.log("2. Query exactService:", exactService);
     const serviceMap = {
      'home-tutors': 'Home Tutors',
      'plumber': 'Plumber',
      'electrician': 'Electrician',
      'painter': 'Painter',
      'house-help': 'House Help',
      'babysitters': 'Babysitters',
      'sofa-carpet-cleaner': 'Sofa/Carpet Cleaner',
      'event-decorators': 'Event Decorators',
      'carpenter': 'Carpenter',
      'photographer': 'Photographer',
      'band-baja': 'Band Baja',
      'private-chef': 'Private Chef',
      'locksmith': 'Locksmith',
      'laundry': 'Laundry',
      'movers-packers': 'Movers & Packers',
      'waterproofing': 'Waterproofing'
    };
    let serviceToFind;
    if (exactService) {
      serviceToFind = exactService; // Use the exact service name from query param
    } else {
      serviceToFind = serviceMap[urlService] || 
        urlService.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    console.log("3. Service to find:", serviceToFind);
    console.log("4. Service length:", serviceToFind.length);
    console.log("5. Service chars:", serviceToFind.split('').map(c => c.charCodeAt(0)));
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      console.log("6. Customer not found");
      return res.status(404).json({ msg: "Customer not found" });
    }
    console.log("6. Customer found:", customer.email);
    
    if (!customer.location || !customer.location.coordinates) {
      console.log("7. Customer location not set");
      return res.status(400).json({ msg: "Customer location not set" });
    }
    console.log("7. Customer location:", customer.location.coordinates);
    const customerCoords = customer.location.coordinates; // [lng, lat]

    // ✅ Only online & verified providers for the service
    const allProvidersWithService = await ServiceProvider.find({
      role: "provider",
      service: serviceToFind, // Make sure this matches your DB field name
      isOnline: true,
      isVerified: true
    }).select("fullName service isOnline isVerified currentLocation");
        console.log(`Found ${allProvidersWithService.length} total providers with service "${serviceToFind}"`);
    allProvidersWithService.forEach((p, i) => {
      console.log(`  Provider ${i+1}: ${p.fullName}`);
      console.log(`    - service: "${p.service}"`);
      console.log(`    - isOnline: ${p.isOnline}`);
      console.log(`    - isVerified: ${p.isVerified}`);
      console.log(`    - hasLocation: ${!!p.currentLocation?.coordinates}`);
    });

// STEP 2: Apply online filter
    console.log("\n--- STEP 2: Applying online filter ---");
    const onlineProviders = allProvidersWithService.filter(p => p.isOnline === true);
    console.log(`Online providers: ${onlineProviders.length}`);

    // STEP 3: Apply verified filter
    console.log("\n--- STEP 3: Applying verified filter ---");
    const verifiedProviders = onlineProviders.filter(p => p.isVerified === true);
    console.log(`Online + Verified providers: ${verifiedProviders.length}`);

    // STEP 4: Check location
    console.log("\n--- STEP 4: Checking location ---");
    const providersWithLocation = verifiedProviders.filter(p => !!p.currentLocation?.coordinates);
    console.log(`Providers with location: ${providersWithLocation.length}`);

    // Use verifiedProviders for the response (they already have location check in the map)
    let providers = verifiedProviders;
    
    if (!providers.length) {
      console.log("\n❌ NO PROVIDERS FOUND - Reasons:");
      if (allProvidersWithService.length === 0) console.log("  - No providers with this service name");
      else if (onlineProviders.length === 0) console.log("  - Providers exist but are offline");
      else if (verifiedProviders.length === 0) console.log("  - Providers exist but are not verified");
      
      // Get all services for debugging
      const allDbProviders = await ServiceProvider.find({ role: "provider" }).select("service fullName isOnline isVerified");
      const availableServices = [...new Set(allDbProviders.map(p => p.service))];
      console.log("\nAll services in DB:", availableServices);
      console.log("All providers in DB:", allDbProviders.map(p => ({
        name: p.fullName,
        service: p.service,
        isOnline: p.isOnline,
        isVerified: p.isVerified
      })));
      
      return res.status(200).json({ 
        msg: `No providers found for ${serviceToFind}`,
        count: 0,
        providers: [],
        debug: {
          requestedService: serviceToFind,
          totalWithService: allProvidersWithService.length,
          onlineCount: onlineProviders.length,
          verifiedCount: verifiedProviders.length,
          availableServices
        }
      });
    }
    
    console.log(`\n✅ FOUND ${providers.length} PROVIDERS - Processing...`);
    
    const io = req.app.get("io");
    
    const providersData = await Promise.all(providers.map(async (provider) => {
      console.log(`\nProcessing provider: ${provider.fullName}`);
      
      if (!provider.currentLocation?.coordinates) {
        console.log(`  ❌ No location for ${provider.fullName}`);
        return null;
      }

      const [lng, lat] = provider.currentLocation.coordinates;
      console.log(`  Location: [${lng}, ${lat}]`);
      
      const distance = getDistanceFromLatLonInKm(customerCoords[1], customerCoords[0], lat, lng);
      console.log(`  Distance: ${distance.toFixed(2)} km`);

      const ratingAgg = await Rating.aggregate([
        { $match: { serviceProviderId: new mongoose.Types.ObjectId(provider._id) } },
        { $group: { _id: "$serviceProviderId", avgRating: { $avg: "$rating" }, totalRatings: { $sum: 1 } } }
      ]);
      
      const avgRating = ratingAgg.length ? ratingAgg[0].avgRating.toFixed(1) : 0;
      const totalRatings = ratingAgg.length ? ratingAgg[0].totalRatings : 0;
      console.log(`  Rating: ${avgRating} (${totalRatings} reviews)`);

      const servicesDone = await ServiceTaken.countDocuments({ provider: provider._id });
      console.log(`  Services done: ${servicesDone}`);
      
      if (provider.socketId) {
        io.to(provider.socketId).emit("service-alert", {
          service: serviceToFind,
          customerId: customer._id
        });
      }
      
      return {
        id: provider._id,
        _id: provider._id,
        fullName: provider.fullName,
        name: provider.fullName,
        profilePhoto: provider.profilePhoto || null,
        avgRating,
        rating: avgRating,
        totalRatings,
        servicesDone,
        distanceInKm: distance.toFixed(2),
        experience: provider.yearsOfExperience || "N/A",
        yearsOfExperience: provider.yearsOfExperience || "N/A",
        topSkills: provider.skillsExpertise || [],
        skills: provider.skillsExpertise || [],
        socketId: provider.socketId,
        phone: provider.phone,
        bio: provider.shortBio || "No bio available",
        shortBio: provider.shortBio || "No bio available",
        isOnline: provider.isOnline,
        online: provider.isOnline,
        address: `${provider.municipality || ''}, ${provider.district || ''}`.trim() || 'Address not available'
      };
    }));
    
    const filteredProviders = providersData.filter(p => p !== null);
    console.log(`\nFinal providers with location: ${filteredProviders.length}`);

    filteredProviders.sort((a, b) => {
      return (b.avgRating - a.avgRating) || (a.distanceInKm - b.distanceInKm);
    });
    
    console.log("========== END DEBUG ==========\n");
    
    res.json({
      msg: `Providers for service: ${serviceToFind}`,
      count: filteredProviders.length,
      providers: filteredProviders
    });
    
  } catch (err) {
    console.error("ERROR in providers route:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;