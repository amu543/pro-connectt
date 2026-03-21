// routes/customer.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Customer = require("../models/customer");
const ServiceProvider = require("../models/ServiceProvider");
const customerAuth = require("../middleware/customerAuth");
const crypto = require("crypto");
const PasswordReset = require("../models/PasswordReset");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASS
  }
});

// Check if email is configured
const isEmailConfigured = () => {
  return process.env.EMAIL_SERVICE_USER && process.env.EMAIL_SERVICE_PASS;
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send Email OTP function
const sendEmailOTP = async (email, otp) => {
  if (!isEmailConfigured()) {
    console.log("Email not configured. Skipping email send.");
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.EMAIL_SERVICE_USER,
      to: email,
      subject: "Pro-Connect Email Verification",
      html: `<h2>Your OTP is: <b>${otp}</b></h2><p>Valid for 5 minutes</p>`
    });
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
    throw error; // Re-throw to be caught in the register endpoint
  }
};

// Customer Registration 
router.post("/register", async (req, res) => {
  try {
    const {
      ["Full Name"]: fullName,
      Email: email,
      Phone: phone,
      Password: password,
      ["Confirm Password"]: confirmPassword,
      ["Profile Photo"]: profilePhoto,
       ["Province"]: province,
      ["District"]: district,
      ["Municipality"]: municipality,
      ["Ward No"]: wardNo,
    } = req.body;

    if (!fullName || !email || !phone || !password || !confirmPassword || !province || !district || !municipality || !wardNo)
      return res.status(400).json({ msg: "All fields are required" });
    if (password !== confirmPassword)
      return res.status(400).json({ msg: "Passwords do not match" });

    const phoneRegex = /^\+977\d{10}$/;
    if (!phoneRegex.test(phone))
      return res.status(400).json({ msg: "Phone must be in Nepal format +977XXXXXXXXXX" });

    const existingUser = await Customer.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = new Customer({
      fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      profilePhoto,
      role: "customer",
      otp,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
      isVerified: false,
       province: province,
      district: district,
      municipality: municipality,
      wardNo: wardNo
    });

    await newCustomer.save();

    // ALWAYS return the OTP in development for testing
    console.log(`OTP for ${email}: ${otp}`);
    
    // Try to send email
    if (isEmailConfigured()) {
      try {
        await sendEmailOTP(email, otp);
        return res.status(201).json({ 
          msg: "OTP sent to email", 
          email,
          success: true,
          otpSent: true
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError.message);
        // Still return success with OTP in development
        return res.status(201).json({ 
          msg: "Registration successful. Email failed, OTP: " + otp, 
          email,
          success: true,
          otpSent: false,
          debugOtp: otp, // Include OTP in response for debugging
          note: "Please use 'Resend OTP' button"
        });
      }
    } else {
      // Email not configured - just return OTP
      return res.status(201).json({ 
        msg: "Registration successful. OTP: " + otp, 
        email,
        success: true,
        otpSent: false,
        debugOtp: otp
      });
    }
  } catch (err) {
    console.error("Customer register error:", err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});
// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { Email: email, OTP: otp } = req.body;
    if (!email || !otp) return res.status(400).json({ msg: "Email and OTP required" });


    const user = await Customer.findOne({ email, role: "customer" });
    if (!user) return res.status(404).json({ msg: "Customer not found" });
    if (user.isVerified) return res.status(400).json({ msg: "Account already verified" });
    if (user.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });
    if (user.otpExpires && user.otpExpires < new Date()) return res.status(400).json({ msg: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    res.json({ msg: "Email verified successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// Customer Login
router.post("/login", async (req, res) => {
  try {
    const { Email: email, Password: password, latitude, longitude } = req.body;
    if (!email || !password || typeof latitude !== "number" || typeof longitude !== "number")
      return res.status(400).json({ msg: "Email, password and GPS location required" });
    const user = await Customer.findOne({ email, role: "customer" });
    if (!user) return res.status(400).json({ msg: "Customer not found" });
    if (!user.isVerified) return res.status(403).json({ msg: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });

    user.location = { type: "Point", coordinates: [longitude, latitude] };
    user.isOnline = true;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role || "customer" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      msg: "Customer login successful",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role || "customer" }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// Customer Logout
router.post("/logout", customerAuth, async (req, res) => {
  try {
    if (req.user.role !== "customer") return res.status(403).json({ msg: "Unauthorized role" });
    const user = await Customer.findById(req.user.id);
    if (user) {
      user.isOnline = false;
      user.socketId = null;
      await user.save();
    }
    res.json({ success: true, role: "Customer", msg: "Customer logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// Get Customer Profile
router.get("/me", customerAuth, async (req, res) => {
  try {
    const user = await Customer.findById(req.user.id).select("-password -otp -otpExpires");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// Edit Customer Profile
router.put("/edit-profile", customerAuth, async (req, res) => {
  try {
    if (req.user.role !== "customer") return res.status(403).json({ msg: "Access denied" });
    const { phone, profilePhoto,location } = req.body;
    const update = {};
    if (phone) update.phone = phone;
    if (profilePhoto) update.profilePhoto = profilePhoto;
     // ✅ GeoJSON location handling
    if (
      location &&
      typeof location.latitude === "number" &&
      typeof location.longitude === "number"
    ) {
      update.location = {
        type: "Point",
        coordinates: [location.longitude, location.latitude]
      };
    }
    const updatedUser = await Customer.findByIdAndUpdate(req.user.id, update, { new: true }).select("-password -otp");
    res.json({ msg: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Edit profile error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { Email: email } = req.body;
    const user = await Customer.findOne({ email, role: "customer" });
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.isVerified) return res.status(400).json({ msg: "Account already verified" });
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    await sendEmailOTP(email, otp);
    res.json({ msg: "OTP resent successfully" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// Forgot password - Customer
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    
    if (!customer) {
      return res.status(404).json({ error: "Email not found. Please register first." });
    }
    
    if (customer.isVerified === false) {
      return res.status(403).json({ error: "Please verify your email first." });
    }
    
    // Delete existing OTPs for this email
    await PasswordReset.deleteMany({ email: email.toLowerCase(), userType: "customer" });
    
    // Generate OTP (6 digits)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 300000); // 5 minutes
    
    // Save OTP
    await PasswordReset.create({
      email: email.toLowerCase(),
      otp: otp,
      userType: "customer",
      expiresAt
    });
    
    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASS,
      },
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_SERVICE_USER,
      to: email,
      subject: "Pro Connect - Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333;">Password Reset OTP</h2>
          <p>Hello ${customer.fullName || "Customer"},</p>
          <p>Your OTP for password reset is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f5f5f5; padding: 15px; border-radius: 8px; display: inline-block;">
              ${otp}
            </div>
          </div>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Pro Connect - Connecting Professionals</p>
        </div>
      `
    });
    
    console.log(`Password reset OTP sent to ${email}: ${otp}`);
    
    res.json({ 
      message: "OTP sent to your email. Valid for 5 minutes.",
      email: email
    });
    
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// Verify OTP (Customer)
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
    
    const resetRecord = await PasswordReset.findOne({
      email: email.toLowerCase(),
      userType: "customer",
      otp: otp,
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    
    res.json({ valid: true, message: "OTP verified successfully" });
    
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Reset password with OTP (Customer)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters with uppercase, lowercase, number and special character"
      });
    }
    
    const resetRecord = await PasswordReset.findOne({
      email: email.toLowerCase(),
      userType: "customer",
      otp: otp,
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await Customer.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword }
    );
    
    resetRecord.used = true;
    await resetRecord.save();
    
    res.json({ message: "Password reset successfully! You can now login with your new password." });
    
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Resend OTP (Customer)
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    
    if (!customer) {
      return res.status(404).json({ error: "Email not found" });
    }
    
    // Delete existing OTPs
    await PasswordReset.deleteMany({ email: email.toLowerCase(), userType: "customer" });
    
    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 300000);
    
    await PasswordReset.create({
      email: email.toLowerCase(),
      otp: otp,
      userType: "customer",
      expiresAt
    });
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASS,
      },
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_SERVICE_USER,
      to: email,
      subject: "Pro Connect - Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Password Reset OTP</h2>
          <p>Hello ${customer.fullName || "Customer"},</p>
          <p>Your new OTP is: <strong style="font-size: 24px;">${otp}</strong></p>
          <p>Valid for 5 minutes.</p>
        </div>
      `
    });
    
    console.log(`Resent OTP to ${email}: ${otp}`);
    
    res.json({ message: "New OTP sent to your email" });
    
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;