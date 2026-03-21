import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { HiLocationMarker, HiLogout, HiUser, HiX } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";


// API Configuration
const API_BASE_URL = "http://localhost:5000/api";

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [role, setRole] = useState("customer");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [locationData, setLocationData] = useState({ 
    latitude: null, 
    longitude: null,
    displayText: "Select Location"
  });
  const [locationVerified, setLocationVerified] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const locationPath = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  // Get user data from localStorage
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isLoggedIn = !!token;
  const userName = userData.name || userData.FullName || userData.fullName || "User";
  const userRole = userData.role || localStorage.getItem("role");
 const [showForgotPassword, setShowForgotPassword] = useState(false);
const [forgotStep, setForgotStep] = useState("email"); // 'email', 'otp', 'password'
const [forgotEmail, setForgotEmail] = useState("");
const [forgotUserType, setForgotUserType] = useState("customer");
const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [timer, setTimer] = useState(0);
const [forgotLoading, setForgotLoading] = useState(false);
const [forgotMessage, setForgotMessage] = useState("");
const [forgotError, setForgotError] = useState("");
const otpInputRefs = useRef([]);
// Timer effect
useEffect(() => {
  let interval;
  if (timer > 0) {
    interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  }
  return () => clearInterval(interval);
}, [timer]);

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
// Handle OTP input
const handleOtpChange = (index, value) => {
  if (!/^\d?$/.test(value)) return;
  const newOtp = [...forgotOtp];
  newOtp[index] = value;
  setForgotOtp(newOtp);
  if (value && index < 5) {
    otpInputRefs.current[index + 1]?.focus();
  }
};
const handleKeyDown = (index, e) => {
  if (e.key === "Backspace" && !forgotOtp[index] && index > 0) {
    otpInputRefs.current[index - 1]?.focus();
  }
};

// Send OTP
const handleSendOtp = async (e) => {
  e.preventDefault();
  setForgotLoading(true);
  setForgotError("");
  setForgotMessage("");
  
  try {
    const endpoint = forgotUserType === "customer" 
      ? "/customer/forgot-password" 
      : "/service-provider/sp-forgot-password";
    
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
      email: forgotEmail
    });
    
    setForgotMessage(response.data.message);
    setForgotStep("otp");
    setTimer(300); // 5 minutes timer
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  } catch (error) {
    setForgotError(error.response?.data?.error || "Something went wrong");
  } finally {
    setForgotLoading(false);
  }
};

// Verify OTP
const handleVerifyOtp = async (e) => {
  e.preventDefault();
  const otpValue = forgotOtp.join("");
  console.log("=== VERIFY OTP DEBUG ===");
  console.log("OTP Value:", otpValue);
  console.log("Email:", forgotEmail);
  console.log("User Type:", forgotUserType);
 
  
  if (otpValue.length !== 6) {
    setForgotError("Please enter all 6 digits");
    return;
  }
  
  setForgotLoading(true);
  setForgotError("");
  
  try {
    const endpoint = forgotUserType === "customer" 
      ? "/customer/verify-reset-otp" 
      : "/service-provider/sp-verify-reset-otp";
      console.log("Endpoint:", `${API_BASE_URL}${endpoint}`); 
    
    const payload = {
      email: forgotEmail,
      otp: otpValue
    };
    
    console.log("Sending payload:", payload);
    
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
    
    console.log("Response:", response.data);
    
    setForgotMessage("OTP verified! Set your new password.");
    setForgotStep("password");
  } catch (error) {
    console.error("Verify OTP error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    setForgotError(error.response?.data?.error || "Invalid OTP");
    setForgotOtp(["", "", "", "", "", ""]);
    otpInputRefs.current[0]?.focus();
  } finally {
    setForgotLoading(false);
  }
};
  
 
// Reset password
const handleResetPassword = async (e) => {
  e.preventDefault();
  
  if (newPassword !== confirmPassword) {
    setForgotError("Passwords do not match");
    return;
  }
  
  if (newPassword.length < 8) {
    setForgotError("Password must be at least 8 characters");
    return;
  }
  
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!strongPasswordRegex.test(newPassword)) {
    setForgotError("Password must include uppercase, lowercase, number, and special character");
    return;
  }
  
  setForgotLoading(true);
  setForgotError("");
  
  try {
    const endpoint = forgotUserType === "customer" 
      ? "/customer/reset-password" 
      : "/service-provider/sp-reset-password";
    
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
      email: forgotEmail,
      otp: forgotOtp.join(""),
      newPassword,
      confirmPassword
    });
    
    setForgotMessage(response.data.message);
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotStep("email");
      setForgotEmail("");
      setForgotOtp(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      setForgotMessage("");
    }, 3000);
  } catch (error) {
    setForgotError(error.response?.data?.error || "Something went wrong");
  } finally {
    setForgotLoading(false);
  }
};

// Resend OTP
const handleResendOtp = async () => {
  setForgotLoading(true);
  setForgotError("");
  
  try {
    const endpoint = forgotUserType === "customer" 
      ? "/customer/resend-otp" 
      : "/service-provider/sp-resend-otp-password";
    
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
      email: forgotEmail
    });
    
    setForgotMessage(response.data.message);
    setTimer(300);
    setForgotOtp(["", "", "", "", "", ""]);
    otpInputRefs.current[0]?.focus();
  } catch (error) {
    setForgotError(error.response?.data?.error || "Failed to resend OTP");
  } finally {
    setForgotLoading(false);
  }
};
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "unset";
  }, [drawerOpen]);

  // Check if user is already logged in and update location
  useEffect(() => {
    if (isLoggedIn) {
      detectLocation();
    }
  }, [isLoggedIn]);

  // Detect location
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationData({
            latitude,
            longitude,
            displayText: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
          });
          setLocationVerified(true);
          
          // Update location on backend if logged in
          if (isLoggedIn && token) {
            updateUserLocation(latitude, longitude);
          }
        },
        (error) => {
          console.error("Location error:", error);
          setLocationData({
            latitude: null,
            longitude: null,
            displayText: "Location access was denied"
          });
          setLocationVerified(false);
        }
      );
    } else {
      setLocationData({
        latitude: null,
        longitude: null,
        displayText: "Geolocation not supported"
      });
      setLocationVerified(false);
    }
  };

  // Update user location on backend
  const updateUserLocation = async (latitude, longitude) => {
    try {
      const userRole = localStorage.getItem("role");
      const endpoint = userRole === "customer" 
        ? "/customer/location" 
        : "/service-provider/sp-location";
      
      await axios.post(`${API_BASE_URL}${endpoint}`, {
        latitude,
        longitude
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Location updated on server");
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  // Validate login form
  const validate = () => {
    let valid = true;
    const errs = { email: "", password: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
      errs.email = "Please enter a valid email";
      valid = false;
    }

    if (loginData.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
      valid = false;
    }

    setErrors(errs);
    return valid;
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!locationVerified) {
      alert("Please enable location services to continue.");
      detectLocation();
      return;
    }

    if (!validate()) return;

    setLoading(true);

    try {
      const { email, password } = loginData;
      const { latitude, longitude } = locationData;

      // Determine API endpoint based on role
      const endpoint = role === "customer" 
        ? "/customer/login" 
        : "/service-provider/sp-login";
       console.log("Login endpoint:", endpoint);
    console.log("Login data:", { email, role });
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        Email: email,
        Password: password,
        latitude,
        longitude
      });

      if (response.data.token) {
        const user = response.data.user || response.data;
        console.log("Login response:", response.data);
      console.log("User data:", user);
      let userId = null;
      
      if (role === "customer") {
        // Customer might have _id, id, or customerId
        userId = user._id || user.id || user.customerId;
        console.log("Customer ID extracted:", userId);
      } else {
        // Provider might have _id, id, or providerId
        userId = user._id || user.id || user.providerId;
        console.log("Provider ID extracted:", userId);
      }
      
      console.log("Extracted User ID:", userId);
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", role);
        
        // Store user data based on response structure
        const userDataToStore = {
           _id: user._id || user.id || userId,
           id: user._id || user.id || userId,
          name: user.FullName || user.fullName || email.split("@")[0],
          email: email,
          role: role,
           phone: user.phone || "",
        service: user.service || ""
        };
        
        localStorage.setItem("userData", JSON.stringify(userDataToStore));
         const stored = JSON.parse(localStorage.getItem("userData") || "{}");
      console.log("Verified stored userData:", stored);
        // Navigate based on role
        const dashboardPath = role === "customer" 
          ? "/customer-dashboard" 
          : "/provider-dashboard";
        
        navigate(dashboardPath, { replace: true });
        setDrawerOpen(false);
        
        // Reset form
        setLoginData({ email: "", password: "" });
      }
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.error || "Invalid email or password";
        } else if (error.response.status === 403) {
          errorMessage = "Email not verified. Please check your email for verification link.";
        } else if (error.response.status === 404) {
          errorMessage = "User not found. Please register first.";
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const userRole = localStorage.getItem("role");
      const endpoint = userRole === "customer" 
        ? "/customer/logout" 
        : "/service-provider/sp-logout";
      
      await axios.post(`${API_BASE_URL}${endpoint}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("role");
      setLocationVerified(false);
      setLocationData({
        latitude: null,
        longitude: null,
        displayText: "Select Location"
      });
      setDropdownOpen(false);
      navigate("/", { replace: true });
    }
  };
 const handleForgotPassword = async (e) => {
  e.preventDefault();
  setForgotLoading(true);
  setForgotError("");
  setForgotMessage("");
  
  try {
    const endpoint = forgotUserType === "customer" 
      ? "/customer/forgot-password" 
      : "/service-provider/sp-forgot-password";
    
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
      email: forgotEmail
    });
    
    setForgotMessage(response.data.message);
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotEmail("");
      setForgotMessage("");
    }, 3000);
  } catch (error) {
    setForgotError(error.response?.data?.error || "Something went wrong");
  } finally {
    setForgotLoading(false);
  }
};
  // Go to profile dashboard
  const goToProfile = () => {
    setDropdownOpen(false);
    const userRole = localStorage.getItem("role");
    const dashboardPath = userRole === "customer" 
      ? "/customer-dashboard" 
      : "/provider-dashboard";
    navigate(dashboardPath);
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-linear-to-r from-slate-50 via-blue-50 to-slate-50 border-b border-slate-200 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <img
                  src={Logo}
                  alt="Pro-Connect Logo"
                  className="w-12 h-12 md:w-14 md:h-14 relative z-10 rounded-full shadow-lg ring-2 ring-blue-300/50 group-hover:ring-blue-400 transition-all duration-300"
                />
              </div>
              <div className="hidden sm:block">
                <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-5xl md:text-6xl font-bold bg-linear-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text text-transparent drop-shadow-sm">
                  Pro-
                </span>
                <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 via-sky-500 to-blue-600 bg-clip-text text-transparent">
                  Connect
                </span>
              </div>
            </Link>

            <div className="relative flex items-center gap-2.5">
              {/* Nav Links */}
              <nav className="flex items-center space-x-8 md:space-x-10">
                <Link
                  to="/about"
                  className="text-slate-700 hover:text-slate-900 font-semibold text-base md:text-lg transition-all duration-300 relative group tracking-wide"
                >
                  <span className="relative z-10">About Us</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-blue-400 to-sky-400 transition-all duration-300 group-hover:w-full shadow-sm shadow-blue-300/50 rounded-full"></span>
                  <span className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/60 rounded-lg transition-all duration-300 -z-10 px-3 py-1"></span>
                </Link>
                <Link
                  to="/faq"
                  className="text-slate-700 hover:text-slate-900 font-semibold text-base md:text-lg transition-all duration-300 relative group tracking-wide"
                >
                  <span className="relative z-10">FAQs</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-blue-400 to-sky-400 transition-all duration-300 group-hover:w-full shadow-sm shadow-blue-300/50 rounded-full"></span>
                  <span className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/60 rounded-lg transition-all duration-300 -z-10 px-3 py-1"></span>
                </Link>

                {!isLoggedIn ? (
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="px-8 py-2.5 bg-linear-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105"
                  >
                    Login
                  </button>
                ) : (
                  <div className="flex items-center space-x-5" ref={dropdownRef}>
                    {/* User Button with Dropdown - Circular Avatar Only */}
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="relative group"
                      >
                        <div className="w-11 h-11 rounded-full bg-linear-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl ring-2 ring-slate-300 hover:ring-blue-400 cursor-pointer">
                          <span className="text-white font-bold text-lg">
                            {userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {/* Subtle glow effect on hover */}
                        <div className="absolute inset-0 rounded-full bg-blue-400 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                      </button>

                      {/* Dropdown Menu */}
                      {dropdownOpen && (
                        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
                          {/* User Info */}
                          <div className="px-5 py-4 border-b border-slate-100 bg-linear-to-br from-slate-50 to-blue-50">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full bg-linear-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-xl">
                                  {userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-lg">{userName}</p>
                                <p className="text-sm text-slate-500 capitalize mt-0.5">
                                  {userData.role || "User"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Profile Button */}
                          <button
                            onClick={goToProfile}
                            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50 text-left transition-colors duration-200 group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                              <HiUser className="text-slate-600 text-lg" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">My Profile</p>
                              <p className="text-xs text-slate-500 mt-0.5">Go to your dashboard</p>
                            </div>
                          </button>

                          {/* Logout Button */}
                          <div className="border-t border-slate-100 pt-2 px-3 mt-2">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 font-semibold transform hover:scale-105 shadow-md"
                            >
                              <HiLogout className="text-lg" />
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Login Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
          drawerOpen ? "visible" : "invisible"
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
            drawerOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Drawer Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-gray-50 to-white">
              <h2 className="text-3xl font-bold text-black">Welcome Back</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <HiX className="text-gray-700 text-2xl group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Location */}
              <div
                className={`mb-8 p-5 rounded-2xl border-2 transition-all duration-300 ${
                  locationVerified
                    ? "bg-linear-to-br from-green-50 to-emerald-50 border-green-200"
                    : "bg-linear-to-br from-gray-50 to-slate-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        locationVerified ? "bg-green-100" : "bg-gray-200"
                      }`}
                    >
                      <HiLocationMarker
                        className={`text-xl ${
                          locationVerified ? "text-green-600" : "text-blue-500"
                        }`}
                      />
                    </div>
                    <span
                      className={`font-bold text-base ${
                        locationVerified ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      {locationVerified ? "Location Verified ✓" : "Location Required"}
                    </span>
                  </div>
                  <button
                    onClick={detectLocation}
                    className="px-5 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Allow Location
                  </button>
                </div>
                <p
                  className={`text-sm font-semibold ml-1 ${
                    locationVerified ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {locationData.displayText}
                </p>
                {!locationVerified && (
                  <p className="text-xs text-red-600 mt-2 ml-1 font-medium">
                    ⚠ Enable location to continue
                  </p>
                )}
              </div>

              {/* Login Form */}
              <form className="flex flex-col gap-6" onSubmit={handleLogin}>
                {/* Role Selector */}
                <div className="flex justify-center gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className={`px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 transform hover:scale-105 ${
                      role === "customer"
                        ? "bg-black text-white border-black shadow-lg"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("provider")}
                    className={`px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 transform hover:scale-105 ${
                      role === "provider"
                        ? "bg-black text-white border-black shadow-lg"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    Provider
                  </button>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold text-sm">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    className="w-full border-2 border-gray-200 rounded-xl px-5 py-3.5 focus:border-black focus:outline-none transition-colors duration-200 text-gray-800 font-medium"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold text-sm">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full border-2 border-gray-200 rounded-xl px-5 py-3.5 focus:border-black focus:outline-none transition-colors duration-200 text-gray-800 font-medium"
                    required
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-2 font-medium">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !locationVerified}
                  className={`w-full px-5 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2 ${
                    loading || !locationVerified
                      ? "bg-gray-400 text-gray-700"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              {/* Registration Links */}
              <div className="mt-10 text-center">
                <p className="text-gray-600 mb-5 font-semibold">Don't have an account?</p>
                <div className="flex justify-center gap-4">
                  <Link
                    to="/register-customer"
                    onClick={() => setDrawerOpen(false)}
                    className="px-7 py-3 rounded-xl border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300 font-semibold transform hover:scale-105"
                  >
                    Register as Customer
                  </Link>
                  <Link
                    to="/register-provider"
                    onClick={() => setDrawerOpen(false)}
                    className="px-7 py-3 rounded-xl border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300 font-semibold transform hover:scale-105"
                  >
                    Register as Provider
                  </Link>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() =>  setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
     {showForgotPassword && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Reset Password</h3>
        <button
          onClick={() => {
            setShowForgotPassword(false);
            setForgotStep("email");
            setForgotMessage("");
            setForgotError("");
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <HiX size={24} />
        </button>
      </div>
      
      {forgotMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">{forgotMessage}</p>
        </div>
      )}
      
      {forgotError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{forgotError}</p>
        </div>
      )}
      
      {/* Step 1: Enter Email */}
      {forgotStep === "email" && (
        <form onSubmit={handleSendOtp}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold text-sm">
              Account Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForgotUserType("customer")}
                className={`flex-1 py-2 rounded-lg font-semibold ${
                  forgotUserType === "customer"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setForgotUserType("provider")}
                className={`flex-1 py-2 rounded-lg font-semibold ${
                  forgotUserType === "provider"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Provider
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-semibold text-sm">
              Email Address
            </label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-black focus:outline-none"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={forgotLoading}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {forgotLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}
      
      {/* Step 2: Enter OTP */}
      {forgotStep === "otp" && (
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold text-sm">
              Enter OTP
            </label>
            <p className="text-sm text-gray-600 mb-4">
              We've sent a 6-digit OTP to <strong>{forgotEmail}</strong>
            </p>
            
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={forgotOtp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold rounded-lg border border-gray-300 focus:border-black focus:outline-none"
                  disabled={forgotLoading}
                />
              ))}
            </div>
            
            {timer > 0 ? (
              <p className="text-sm text-gray-600 text-center mb-4">
                OTP expires in: <span className="font-medium">{formatTime(timer)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600 text-center mb-4">
                OTP expired.{" "}
                <button 
                  type="button" 
                  onClick={handleResendOtp} 
                  className="text-blue-600 hover:underline"
                  disabled={forgotLoading}
                >
                  Resend OTP
                </button>
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={forgotLoading || forgotOtp.join("").length !== 6}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {forgotLoading ? "Verifying..." : "Verify OTP"}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setForgotStep("email");
              setForgotError("");
            }}
            className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to email
          </button>
        </form>
      )}
      
      {/* Step 3: Set New Password */}
      {forgotStep === "password" && (
        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold text-sm">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-black focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-semibold text-sm">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-black focus:outline-none"
              required
            />
          </div>
          
          <p className="text-xs text-gray-500 mb-4">
            Password must be at least 8 characters with uppercase, lowercase, number and special character
          </p>
          
          <button
            type="submit"
            disabled={forgotLoading}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {forgotLoading ? "Resetting..." : "Reset Password"}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setForgotStep("otp");
              setForgotError("");
            }}
            className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to OTP
          </button>
        </form>
      )}
    </div>
  </div>
)}
      {/* Mobile Logout */}
      {isLoggedIn && (
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={handleLogout}
            className="px-5 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-800 flex items-center space-x-2 shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <HiLogout className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Animations + Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap');
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;