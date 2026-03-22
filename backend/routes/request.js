const router = require("express").Router();
const Customer = require("../models/customer");
const ServiceRequest = require("../models/spServiceRequest");
const ServiceTaken = require("../models/servicetaken");
const Notification = require("../models/notification");
const ServiceProvider = require("../models/ServiceProvider");
const customerAuth = require("../middleware/customerAuth"); 
const Rating = require("../models/rating");
const rating = require("../models/rating");
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const SPServiceRequest = require("../models/spServiceRequest");
/* ============================
   GET PROVIDERS BY SERVICE
============================ */
router.get(
  "/providers/:service",
  customerAuth,
  async (req, res) => {
    try {
      const rawService = req.params.service;
      const exactService = req.query.exactService;
       const customerId = req.query.customerId;
      
      console.log("🔍 Request.js - Finding providers for:", { rawService, exactService, customerId });
      
      // Get the customer to use their location for distance calculation
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ msg: "Customer not found" });
      }
      
      if (!customer.location || !customer.location.coordinates) {
        return res.status(400).json({ msg: "Customer location not set" });
      }
      
      const customerCoords = customer.location.coordinates; // [lng, lat]
      console.log("Customer coordinates:", customerCoords);
      console.log("🔍 Request.js - Finding providers for:", { rawService, exactService });
       let serviceToFind = exactService;
      
      if (!serviceToFind) {
        // Fallback mapping for common services
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
        
        serviceToFind = serviceMap[rawService] || 
          rawService.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      console.log("🔍 Searching for exact service:", serviceToFind);
      const providers = await ServiceProvider.find({
        role: "provider",
        service: serviceToFind,
        isVerified: true
      }).select(
        "fullName phone service yearsOfExperience profilePhoto currentLocation skillsExpertise shortBio isOnline ratings"
      );
       console.log(`✅ Found ${providers.length} providers for ${serviceToFind}`);
        const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
      const transformedProviders = await Promise.all(providers.map(async (p) => {
        let distanceInKm = null;
        if (p.currentLocation && p.currentLocation.coordinates) {
          const [lng, lat] = p.currentLocation.coordinates;
          distanceInKm = getDistanceFromLatLonInKm(
            customerCoords[1], customerCoords[0], 
            lat, lng
          );
        }
         let profilePhotoUrl = null;
        if (p.profilePhoto) {
          if (p.profilePhoto.startsWith('http')) {
            profilePhotoUrl = p.profilePhoto;
          } else if (p.profilePhoto.startsWith('/uploads')) {
            profilePhotoUrl = `${BASE_URL}${p.profilePhoto}`;
          } else {
            profilePhotoUrl = `${BASE_URL}/uploads/${p.profilePhoto}`;
          }
        }
         const reviews = await Rating.find({ serviceProviderId: p._id })
            .populate('customerId', 'fullName profilePhoto')
            .sort({ createdAt: -1 })
            .limit(2); // Get latest 2 reviews
        return{
        _id: p._id,
        id: p._id,
          fullName: p.fullName,
          name: p.fullName,
          phone: p.phone,
          service: p.service,
          experience: p.yearsOfExperience || "N/A",
          yearsOfExperience: p.yearsOfExperience || "N/A",
          profilePhoto: p.profilePhoto ? `${BASE_URL}${p.profilePhoto.startsWith('/') ? '' : '/'}${p.profilePhoto}`: null,
          currentLocation: p.currentLocation,
          skills: p.skillsExpertise || [],
          topSkills: p.skillsExpertise || [],
          shortBio: p.shortBio || "No bio available",
          bio: p.shortBio || "No bio available",
          isOnline: p.isOnline,
          isVerified: p.isVerified,
          distanceInKm: distanceInKm ? parseFloat(distanceInKm.toFixed(1)) : null,
          rating: p.ratings?.avgRating || 0,
          totalRatings: p.ratings?.totalRatings || 0,
           reviews: reviews.map(r => ({
              rating: r.rating,
              text: r.review,
              customerName: r.customerId?.fullName,
              createdAt: r.createdAt
            }))
        };
      })
      );
      res.json({
        count: transformedProviders.length,
        providers: transformedProviders
      });
    } catch (err) {
      console.error("get providers error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

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
/* ============================
   2. SELECT SERVICE
   → Notify ALL providers of that service
============================ */
router.post("/select-service", async (req, res) => {
  try {
    const { serviceType } = req.body;

    const providers = await ServiceProvider.find({
      role: "provider",
      service: { $regex: new RegExp(`^${serviceType}$`, "i") },
    });

    const io = req.app.get("io");

    providers.forEach((provider) => {
      if (provider.socketId) {
        io.to(provider.socketId).emit("service-alert", {
          message: "A customer is looking for your service",
          serviceType
        });
      }
      // else → offline (store later if needed)
    });

    res.json({
      msg: "Providers notified (online via socket)",
      totalProviders: providers.length
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
/* ============================
   3. SEND REQUEST
   → Create request
   → Notify provider
   → Notify customer
============================ */
router.post("/send-request", customerAuth, async (req, res) => {
  try {
     const customerId = req.user.id; 
    const { providerId, serviceType } = req.body;
    if (!providerId || !serviceType) {
      return res.status(400).json({ msg: "providerId and serviceType required" });
    }

    const customer = await Customer.findById(customerId).select(
      "Full Name phone location"
    );
    const provider = await ServiceProvider.findById(providerId).select("socketId isOnline currentLocation");

    if (!customer )
      return res.status(404).json({ msg: "Customer not found" });
    if (!provider) {
      return res.status(404).json({ msg: "Service provider not found" });
    }
     if (!provider.isOnline) {
      return res.status(400).json({ msg: "Provider is offline" });
    }
    if (
  !customer.location ||
  !Array.isArray(customer.location.coordinates) ||
  customer.location.coordinates.length !== 2
) {
  return res.status(400).json({ msg: "Customer location not set. Enable GPS or update location." });
}
    const request = await ServiceRequest.create({
      customer: customerId,
      provider: providerId,
      service: serviceType,
      location:{
        type: "Point",
        coordinates: customer.location.coordinates
      },
      status: "pending"
    });

    const io = req.app.get("io");

    // 🔔 Notify provider (name + phone)
    if (provider.socketId) {
      io.to(provider.socketId).emit("service-request", {
        requestId: request._id,
        serviceType,
        customer: {
          id: customer._id,
          name: customer["Full Name"],
          phone: customer.phone
        }
      });
    }

    // 🔔 Notify customer (stored)
    await Notification.create({
      user: customerId,
      message: "Request for ${serviceType} sent successfully"
    });

    res.json({ msg: "Request sent", requestId: request._id });
  } catch (err) {
     console.error("send-request error:", err); // <-- log full error
  res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ============================
   4. MY REQUESTS
   → ONLY accepted
============================ */
router.get("/my-requests/:customerId", async (req, res) => {
   try {
    const customerId = req.params.customerId;
    
    // FIRST: Get the customer to use their location for distance calculation
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ msg: "Customer not found" });
    }
  
    const requests = await ServiceRequest.find({
      customer: req.params.customerId,
      status: { $in: ["pending", "accepted"] }
    }).populate("provider", "fullName phone service yearsOfExperience profilePhoto currentLocation skillsExpertise shortBio  distanceInKm isOnline avgRating totalRatings reviews");

 // Calculate distance for each request based on provider's location
    const requestsWithDistance = requests.map(request => {
      const requestObj = request.toObject();
      
      if (customer.location && 
      customer.location.coordinates && 
      customer.location.coordinates.length === 2 &&
      request.provider && 
      request.provider.currentLocation && 
      request.provider.currentLocation.coordinates &&
      request.provider.currentLocation.coordinates.length === 2) {
        
        const [providerLng, providerLat] = request.provider.currentLocation.coordinates;
        const [customerLng, customerLat] = customer.location.coordinates;
        
        const distanceInKm = getDistanceFromLatLonInKm(
          customerLat, customerLng,
          providerLat, providerLng
        );
        
        // Add distance to the provider object
        requestObj.provider = {
          ...requestObj.provider,
          distanceInKm: parseFloat(distanceInKm.toFixed(1)),
            distance: `${parseFloat(distanceInKm.toFixed(1))} km`
        };
        
    console.log(`Distance calculated for provider ${requestObj.provider.fullName}: ${distanceInKm} km`);
  } else {
    console.log("Cannot calculate distance - missing location data:", {
      hasCustomerLocation: !!customer.location,
      hasCustomerCoords: !!(customer.location && customer.location.coordinates),
      hasProvider: !!request.provider,
      hasProviderLocation: !!(request.provider && request.provider.currentLocation),
      hasProviderCoords: !!(request.provider && request.provider.currentLocation && request.provider.currentLocation.coordinates)
    });
      }
      
      return requestObj;
    });

    res.json(requestsWithDistance);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Helper function for distance calculation
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
/* ============================
   5. COMPLETE SERVICE
   → Move to ServiceTaken
============================ */
router.post("/complete/:requestId",customerAuth, async (req, res) => {
  try {
     const requestId = req.params.requestId;
    console.log("Completing request:", requestId);
    if (!req.user || !req.user.id) {
      console.log("❌ No user found in request after auth middleware");
      return res.status(401).json({ msg: "User not authenticated" });
    }
    
    console.log("✅ Authenticated user ID:", req.user.id);
    const request = await ServiceRequest.findById(requestId);

    if (!request)
      return res.status(404).json({ msg: "Request not found" });
     // Check if the request belongs to the authenticated customer
    if (request.customer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: "Unauthorized: This request doesn't belong to you" });
    }

    // Check if request is already completed
    if (request.status === "completed") {
      return res.status(400).json({ msg: "Request already completed" });
    }
     if (request.status !== "accepted") {
      console.log("❌ Request cannot be completed - status is:", request.status);
      return res.status(400).json({ 
        msg: `Request cannot be completed because it is ${request.status}. Only accepted requests can be completed.` 
      });
    }
     let location = request.location;
    
    // If request doesn't have location, try to get from customer
    if (!location || !location.coordinates) {
      const customer = await Customer.findById(request.customer._id);
      if (customer && customer.location && customer.location.coordinates) {
        location = customer.location;
      } else {
        // If still no location, use default or throw error
        return res.status(400).json({ 
          msg: "Location not available for this service. Please update your location." 
        });
      }
    }
    const serviceTakenData = {
      customer: request.customer._id,
      provider: request.provider._id,
      service: request.service,
       location: {
        type: "Point",
        coordinates: location.coordinates
      },
      completedAt: new Date(),
      completedBy: "customer",
    };
    const serviceTaken = await ServiceTaken.create(serviceTakenData);
    console.log("✅ ServiceTaken created with ID:", serviceTaken._id);
      request.status = "completed";
    request.completedAt = new Date();
    await request.save();
    try {
     const io = req.app.get("io");
    const provider = await ServiceProvider.findById(request.provider).select("socketId");
      if (provider && provider.socketId) {
        io.to(provider.socketId).emit("service-completed", {
          requestId: request._id,
          message: "Service has been marked as completed by customer"
        });
      }
    } catch (socketErr) {
      console.log("Socket notification error (non-critical):", socketErr.message);
    }

    res.json({  msg: "Service completed successfully",
      serviceTakenId: serviceTaken._id 
      
     });
  } catch (err) {
    console.error("Error completing service:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ============================
   6. CUSTOMER NOTIFICATIONS
============================ */
router.get("/notifications/:customerId",customerAuth, async (req, res) => {
  const notifications = await Notification.find({
    user: req.user.id
  }).sort({ createdAt: -1 });

  res.json(notifications);
});
//cancel request
router.post("/cancel/:requestId", customerAuth, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { requestId } = req.params;

    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const requestCustomerId = (request.customer?.toString() || request.customerId?.toString());
    const authCustomerId = customerId.toString();

    // ✅ Only ONE ownership check needed
    if (requestCustomerId !== authCustomerId) {
      return res.status(403).json({ success: false, message: "Access denied: Not your request" });
    }

    const cancellableStatuses = ["pending", "accepted"];
    if (!cancellableStatuses.includes(request.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${request.status} request` });
    }

    // ✅ Proceed with cancellation — no second ownership check
    request.status = "customer-cancelled";
    request.cancelledAt = new Date();
    request.cancellationReason = req.body.cancellationReason || "Customer cancelled";
    request.cancelledBy = "customer";
    await request.save();
     console.log("✅ Request cancelled successfully:", requestId);
    // Notify provider via socket if available
    try {
      const provider = await ServiceProvider.findById(request.provider);
      const io = req.app.get("io");
      if (provider && provider.socketId && io) {
        io.to(provider.socketId).emit("request-cancelled", {
          requestId: request._id,
          message: "Customer has cancelled the service request"
        });
      }
    } catch (socketErr) {
      console.log("Socket notification error (non-critical):", socketErr.message);
    }

    console.log("✅ Request cancelled successfully:", requestId);
    res.json({ success: true, message: "Request cancelled successfully", requestId: request._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});
//rejected request move to reject page
router.get("/rejected", customerAuth, async (req, res) => {
  try {
    const customerId = req.user.id;

    // Fetch requests cancelled by customer
    const cancelledRequests = await ServiceRequest.find({
      customer: customerId,
      status: "customer-cancelled",
    })
      .populate("provider", "fullName email phone") // provider info
      .sort({ cancelledAt: -1 });

    res.json({ count: cancelledRequests.length, requests: cancelledRequests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});
/* ============================
   7. GET COMPLETED REQUESTS
   → Get only completed requests for customer
============================ */
router.get("/completed-requests/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    console.log("📋 Fetching completed requests for customer:", customerId);
    
    const requests = await ServiceRequest.find({
      customer: customerId,
      status: "completed"
    }).populate("provider", "fullName phone service yearsOfExperience profilePhoto currentLocation skillsExpertise shortBio isOnline")
      .sort({ completedAt: -1 }); // Most recent first
    
    console.log(`✅ Found ${requests.length} completed requests`);
     requests.forEach((req, index) => {
      console.log(`Provider ${index}: ${req.provider?.fullName} - Photo: ${req.provider?.profilePhoto}`);
    });
    // Add completedAt to the response if not present
     const validRequests = requests.filter(req => req.provider !== null);
    
    if (validRequests.length !== requests.length) {
      console.log(`⚠️ Filtered out ${requests.length - validRequests.length} requests with missing provider`);
    }
    
    validRequests.forEach((req, index) => {
      console.log(`Provider ${index}: ${req.provider?.fullName || 'Deleted Provider'} - Photo: ${req.provider?.profilePhoto || 'N/A'}`);
    });
      const requestsWithReviews = await Promise.all(
      validRequests.map(async (req) => {
        const reqObj = req.toObject();
        
        // Check if provider exists before trying to access _id
        if (req.provider && req.provider._id) {
          // Find review for this provider from this customer
          const review = await Rating.findOne({
            serviceProviderId: req.provider._id,
            customerId: customerId
          });
        // Find review for this provider from this customer
        if (review) {
          reqObj.review = {
            rating: review.rating,
            text: review.review,
            createdAt: review.createdAt
          };
        }
        } else {
          // Add placeholder for deleted provider
          reqObj.provider = {
            fullName: "Provider (deleted)",
            service: "Service no longer available"
          };
        }
        if (!reqObj.completedAt) {
          reqObj.completedAt = reqObj.updatedAt || reqObj.createdAt;
        }
        
        return reqObj;
      })
    );
    
    res.json(requestsWithReviews);
  } catch (err) {
    console.error("❌ Error fetching completed requests:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
/**
 * 8.GET /api/request/accepted/:requestId/customer-location
 * Get customer location for an accepted request (for provider)
 */
router.get("/accepted/:requestId/customer-location", async (req, res) => {
  try {
    const { requestId } = req.params;
    
    console.log("🔍 Fetching customer location for request:", requestId);
    
    // Find the request with populated customer data
    const request = await ServiceRequest.findById(requestId)
      .populate('customer', 'fullName email phone location currentLocation address municipality district ward landmark')
      .populate('provider', 'fullName');
    
    if (!request) {
      console.log("❌ Request not found:", requestId);
      return res.status(404).json({ msg: "Request not found" });
    }
    
    console.log("📋 Request found:", {
      id: request._id,
      status: request.status,
      customerId: request.customer?._id,
      customerName: request.customer?.fullName
    });
    
    // Check if request is accepted or in-progress
    if (request.status !== "accepted" && request.status !== "in-progress") {
      console.log("⚠️ Request status is not accepted:", request.status);
      return res.status(400).json({ 
        msg: `Location only available for accepted or in-progress requests. Current status: ${request.status}` 
      });
    }
    
    // Get customer location from various possible sources
    const customer = request.customer;
    let location = null;
    let locationSource = "";
    
    // Priority 1: currentLocation (most up-to-date)
    if (customer.currentLocation && 
        customer.currentLocation.coordinates && 
        customer.currentLocation.coordinates.length === 2 &&
        !(customer.currentLocation.coordinates[0] === 0 && customer.currentLocation.coordinates[1] === 0)) {
      location = customer.currentLocation;
      locationSource = "currentLocation";
      console.log("📍 Found location in currentLocation");
    }
    // Priority 2: location field
    else if (customer.location && 
             customer.location.coordinates && 
             customer.location.coordinates.length === 2 &&
             !(customer.location.coordinates[0] === 0 && customer.location.coordinates[1] === 0)) {
      location = customer.location;
      locationSource = "location";
      console.log("📍 Found location in location field");
    }
    // Priority 3: request location (from when request was created)
    else if (request.location && 
             request.location.coordinates && 
             request.location.coordinates.length === 2) {
      location = request.location;
      locationSource = "request";
      console.log("📍 Found location in request");
    }
    
    if (!location) {
      console.log("❌ No location found in any source");
      return res.status(404).json({ 
        msg: "Customer location not available. Customer needs to enable location services.",
        debug: {
          hasCurrentLocation: !!customer.currentLocation,
          hasLocation: !!customer.location,
          hasRequestLocation: !!request.location,
          customerId: customer._id
        }
      });
    }
    
    // Build address string
    let addressString = customer.address || "";
    if (!addressString && (customer.municipality || customer.district)) {
      addressString = `${customer.municipality || ''}, ${customer.district || ''}`.trim();
      if (customer.ward) addressString += `, Ward ${customer.ward}`;
      if (customer.landmark) addressString += ` (Near: ${customer.landmark})`;
    }
    
    const response = {
      msg: "Customer location retrieved",
      locationSource: locationSource,
      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: addressString || "Address not specified"
      },
      location: {
        type: location.type,
        coordinates: location.coordinates, // [longitude, latitude]
        latitude: location.coordinates[1],
        longitude: location.coordinates[0],
        formattedAddress: addressString
      },
      request: {
        id: request._id,
        service: request.service,
        status: request.status,
        createdAt: request.createdAt
      }
    };
    
    console.log("✅ Location found:", {
      lat: response.location.latitude,
      lng: response.location.longitude,
      address: response.customer.address
    });
    
    res.json(response);
    
  } catch (err) {
    console.error("❌ Error fetching customer location:", err);
    res.status(500).json({ 
      msg: "Server error", 
      error: err.message 
    });
  }
});
/**
 * 9.  Get all accepted requests for a provider with customer locations
 */
router.get("/provider/accepted-requests", async (req, res) => {
  try {
    const { providerId } = req.query;
    
    if (!providerId) {
      return res.status(400).json({ msg: "Provider ID required" });
    }
    
    console.log("🔍 Fetching accepted requests for provider:", providerId);
    
    const requests = await ServiceRequest.find({
      provider: providerId,
      status: { $in: ["accepted", "in-progress"] }
    })
    .populate('customer', 'fullName email phone location currentLocation address municipality district ward landmark')
    .sort({ updatedAt: -1 });
    
    console.log(`📋 Found ${requests.length} accepted/in-progress requests`);
    
    const requestsWithLocations = requests.map(request => {
      const customer = request.customer;
      let location = null;
      
      // Get location from various sources
      if (customer.currentLocation?.coordinates?.length === 2 && 
          !(customer.currentLocation.coordinates[0] === 0 && customer.currentLocation.coordinates[1] === 0)) {
        location = customer.currentLocation.coordinates;
      } 
      else if (customer.location?.coordinates?.length === 2 &&
               !(customer.location.coordinates[0] === 0 && customer.location.coordinates[1] === 0)) {
        location = customer.location.coordinates;
      }
      else if (request.location?.coordinates?.length === 2) {
        location = request.location.coordinates;
      }
      
      // Build address
      let address = customer.address || "";
      if (!address && (customer.municipality || customer.district)) {
        address = `${customer.municipality || ''}, ${customer.district || ''}`.trim();
      }
      
      return {
        requestId: request._id,
        service: request.service,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        customer: {
          id: customer._id,
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email,
          address: address
        },
        location: location ? {
          coordinates: location,
          latitude: location[1],
          longitude: location[0]
        } : null,
        hasLocation: location !== null
      };
    });
    
    res.json({
      count: requestsWithLocations.length,
      requests: requestsWithLocations
    });
    
  } catch (err) {
    console.error("❌ Error fetching provider requests:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get('/:requestId/provider-location', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Find the request and get the provider
    const request =await SPServiceRequest.findById(requestId)
      .populate('provider', 'fullName email phone currentLocation location lastLocation isOnline');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const provider = request.provider;
     if (!provider) {
      return res.status(404).json({ error: 'Provider not found for this request' });
    }
    
    // Check if request is accepted or in-progress
    if (request.status !== "accepted" && request.status !== "in-progress") {
      console.log("⚠️ Request status is not accepted:", request.status);
      return res.status(400).json({ 
        msg: `Provider location only available for accepted or in-progress requests. Current status: ${request.status}` 
      });
    }
    
    if (!request.provider) {
      console.log("❌ Provider not found for request");
      return res.status(404).json({ error: 'Provider not found for this request' });
    }
    // Check currentLocation field
    if (provider.currentLocation && 
        provider.currentLocation.coordinates && 
        provider.currentLocation.coordinates.length === 2 &&
        !(provider.currentLocation.coordinates[0] === 0 && provider.currentLocation.coordinates[1] === 0)) {
      location = provider.currentLocation;
      locationSource = "currentLocation";
      console.log("📍 Found provider location in currentLocation");
    }
    
    if (!location) {
      console.log("❌ No provider location found");
      return res.status(404).json({ 
        msg: "Provider location not available. Provider needs to enable location services.",
        providerOnline: provider.isOnline || false
      });
    }
    
    const response = {
      msg: "Provider location retrieved",
      locationSource: locationSource,
      provider: {
        id: provider._id,
        fullName: provider.fullName,
        email: provider.email,
        phone: provider.phone,
        isOnline: provider.isOnline
      },
      location: {
        type: location.type,
        coordinates: location.coordinates, // [longitude, latitude]
        latitude: location.coordinates[1],
        longitude: location.coordinates[0],
        lastUpdated: location.lastUpdated || new Date()
      },
      request: {
        id: request._id,
        service: request.service,
        status: request.status,
        createdAt: request.createdAt
      }
    };
    
    console.log("✅ Provider location found:", {
      lat: response.location.latitude,
      lng: response.location.longitude,
      provider: response.provider.fullName
    });
    
    res.json(response);
    
  } catch (err) {
    console.error("❌ Error fetching provider location:", err);
    res.status(500).json({ 
      msg: "Server error", 
      error: err.message 
    });
  }
});

/**
 * 11. POST /api/request/:requestId/update-provider-location
 * Update provider's location for an active request
 */
router.post("/:requestId/update-provider-location", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ msg: "Latitude and longitude required" });
    }
    
    console.log("📍 Updating provider location for request:", requestId);
    
    // Find the request
    const request = await ServiceRequest.findById(requestId)
      .populate('provider', 'fullName');
    
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }
    
    // Check if request is accepted
    if (request.status !== "accepted" && request.status !== "in-progress") {
      return res.status(400).json({ 
        msg: `Cannot update location for ${request.status} request` 
      });
    }
    
    // Update provider's location
    const provider = await ServiceProvider.findById(request.provider._id);
    
    if (!provider) {
      return res.status(404).json({ msg: "Provider not found" });
    }
    
    provider.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
      lastUpdated: new Date()
    };
    
    await provider.save();
    
    // Notify customer via socket if available
    const io = req.app.get("io");
    const customer = await Customer.findById(request.customer);
    
    if (customer && customer.socketId) {
      io.to(customer.socketId).emit("provider-location-update", {
        requestId: request._id,
        location: {
          latitude,
          longitude,
          lastUpdated: new Date()
        }
      });
    }
    
    console.log("✅ Provider location updated successfully");
    
    res.json({ 
      msg: "Location updated successfully",
      location: { latitude, longitude }
    });
    
  } catch (err) {
    console.error("❌ Error updating provider location:", err);
    res.status(500).json({ 
      msg: "Server error", 
      error: err.message 
    });
  }
});

module.exports = router;