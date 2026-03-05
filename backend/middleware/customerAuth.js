// middleware/customerAuth.js
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");
require("dotenv").config();

const customerAuth = async (req, res, next) => {
  try {
    console.log("\n" + "=".repeat(50));
    console.log("🔐 AUTH MIDDLEWARE CHECK");
    console.log("Time:", new Date().toLocaleString());
    console.log("URL:", req.originalUrl);
    console.log("Method:", req.method);
    
    // 1️⃣ Get token from header
    const authHeader = req.header("Authorization");
    console.log("Auth header:", authHeader ? "Present" : "MISSING");
    
    if (!authHeader) {
      console.log("❌ No Authorization header");
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Token extracted:", token ? "Yes" : "No");
    console.log("Token length:", token.length);
    console.log("Token preview:", token.substring(0, 20) + "...");

    // 2️⃣ Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verified successfully");
      console.log("Decoded ID:", decoded.id);
      console.log("Decoded role:", decoded.role);
      console.log("Token issued:", new Date(decoded.iat * 1000).toLocaleString());
      console.log("Token expires:", new Date(decoded.exp * 1000).toLocaleString());
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        console.log("❌ Token is EXPIRED!");
        return res.status(401).json({ msg: "Token expired" });
      }

      // 3️⃣ Fetch user from DB
      console.log("Looking for customer with ID:", decoded.id);
      const user = await Customer.findById(decoded.id);
      
      if (!user) {
        console.log("❌ Customer not found for ID:", decoded.id);
        return res.status(404).json({ msg: "Customer not found" });
      }

      console.log("✅ Customer found:", {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName
      });

      // 4️⃣ Attach user to request
      req.user = {
        id: user._id,
        role: user.role || 'customer',
        email: user.email,
        fullName: user.fullName,
      };

      console.log(`✅ Auth verified for: ${user.email}`);
      console.log("=".repeat(50) + "\n");

      next();
    } catch (jwtError) {
      console.log("❌ JWT Verification failed:");
      console.log("Error name:", jwtError.name);
      console.log("Error message:", jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        console.log("Token expired at:", new Date(jwtError.expiredAt).toLocaleString());
        return res.status(401).json({ msg: "Token expired", expired: true });
      } else if (jwtError.name === 'JsonWebTokenError') {
        if (jwtError.message.includes('invalid signature')) {
          console.log("❌ Invalid signature - JWT_SECRET mismatch");
          return res.status(401).json({ msg: "Invalid token signature" });
        } else if (jwtError.message.includes('malformed')) {
          console.log("❌ Malformed token");
          return res.status(401).json({ msg: "Malformed token" });
        } else {
          console.log("❌ Invalid token:", jwtError.message);
          return res.status(401).json({ msg: "Invalid token" });
        }
      } else {
        console.log("❌ Unknown JWT error:", jwtError);
        return res.status(401).json({ msg: "Token validation failed" });
      }
    }
  } catch (err) {
    console.error("❌ Customer auth middleware error:", err);
    res.status(401).json({ msg: "Authentication failed" });
  }
};

module.exports = customerAuth;