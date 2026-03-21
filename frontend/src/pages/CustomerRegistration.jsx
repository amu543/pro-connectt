import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import cusregImage from "../assets/services/cusreg.jpeg";
import addresData from "../data/addresData.json";
const API_BASE_URL = "http://localhost:5000/api";

// Configure axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const countryCodes = [
  { code: "+977", label: "Nepal" },
  { code: "+91", label: "India" },
  { code: "+880", label: "Bangladesh" },
  { code: "+94", label: "Sri Lanka" },
  { code: "+95", label: "Myanmar" },
  { code: "+86", label: "China" },
  { code: "+81", label: "Japan" },
  { code: "+82", label: "South Korea" },
  { code: "+1", label: "USA / Canada" },
  { code: "+44", label: "UK" },
  { code: "+971", label: "UAE" },
];


const CustomerRegistration = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);

  //Address state variables
  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [wards, setWards] = useState([]);
  const otpInputRefs = useRef([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+977",
    password: "",
    confirmPassword: "",
    profilePhoto: null,
    province: "",
    district: "",
    municipality: "",
    wardNo: ""
  });

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

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Convert image file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- Handlers ---
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    
    // Allow only numbers
    const number = value.replace(/\D/g, "");
    
    // Update form with the cleaned number (max 10 digits)
    setForm((p) => ({ ...p, phone: number }));
    
    // Clear error for phone field
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
  };
  
  // Address handlers
  const handleProvinceChange = (e) => {
    const prov = e.target.value;
    setForm((p) => ({ ...p, province: prov, district: "", municipality: "", wardNo: "" }));
    if (addresData[prov]) {
      setDistricts(Object.keys(addresData[prov]));
    } else {
      setDistricts([]);
    }
    setMunicipalities([]);
    setWards([]);
  };
  
  const handleDistrictChange = (e) => {
    const dist = e.target.value;
    setForm((p) => ({ ...p, district: dist, municipality: "", wardNo: "" }));
    if (addresData[form.province] && addresData[form.province][dist]) {
      setMunicipalities(Object.keys(addresData[form.province][dist]));
    } else {
      setMunicipalities([]);
    }
    setWards([]);
  };
  
  const handleMunicipalityChange = (e) => {
    const mun = e.target.value;
    setForm((p) => ({ ...p, municipality: mun, wardNo: "" }));
    if (
      addresData[form.province] &&
      addresData[form.province][form.district] &&
      addresData[form.province][form.district][mun]
    ) {
      setWards(addresData[form.province][form.district][mun]);
    } else {
      setWards([]);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePhoto: "Please select an image file" }));
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePhoto: "Maximum file size is 5 MB" }));
        return;
      }
    }
    setForm((p) => ({ ...p, profilePhoto: file }));
    if (errors.profilePhoto) {
      setErrors(prev => ({ ...prev, profilePhoto: "" }));
    }
  };

  const validateForm = () => {
    const err = {};
    
    if (!form.fullName.trim()) err.fullName = "Full name is required";
    else if (form.fullName.trim().length < 2) err.fullName = "Name must be at least 2 characters";
    
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Invalid email format";
    
    if (!form.phone) err.phone = "Phone number is required";
    else if (form.phone.length !== 10) err.phone = "Phone must be 10 digits";

    // Address validation
    if (!form.province) err.province = "Province is required";
    if (!form.district) err.district = "District is required";
    if (!form.municipality) err.municipality = "Municipality is required";
    if (!form.wardNo) err.wardNo = "Ward number is required";
    
    if (!form.password) err.password = "Password is required";
    else if (form.password.length < 8) err.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(form.password)) {
      err.password = "Password must include uppercase, lowercase, number, and special character";
    }
    
    if (!form.confirmPassword) err.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) err.confirmPassword = "Passwords do not match";
    
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // OTP Handlers
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(pasteData)) {
      const otpArray = pasteData.split("");
      setOtp(otpArray);
      // Focus the last input
      otpInputRefs.current[5]?.focus();
    }
  };

  // Submit Registration
  const submitRegistration = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");
    
    if (!validateForm()) return;
    
    // Force Nepali phone number for now (backend requirement)
    if (form.countryCode !== "+977") {
      setApiError("Currently, only Nepali phone numbers (+977) are supported for registration.");
      return;
    }
    
    setSubmitting(true);

    try {
      // Prepare form data for backend
      const registrationData = {
        "Full Name": form.fullName.trim(),
        "Email": form.email.trim().toLowerCase(),
        "Phone": form.countryCode + form.phone,
        "Password": form.password,
        "Confirm Password": form.confirmPassword,
        "Province": form.province,
        "District": form.district,
        "Municipality": form.municipality,
        "Ward No": form.wardNo,
        "Profile Photo": ""
      };

      // Convert profile photo to base64 if provided
      if (form.profilePhoto) {
        try {
          const base64Image = await convertToBase64(form.profilePhoto);
          registrationData["Profile Photo"] = base64Image;
        } catch (error) {
          console.error("Error converting image:", error);
          // Continue without profile photo if conversion fails
        }
      }

      // Call registration API
      const response = await api.post("/customer/register", registrationData);
      
      console.log("Registration response:", response.data);
      
      // Show success and open verification section
      setSuccessMessage("Registration successful! OTP has been sent to your email.");
      setShowVerification(true);
      setTimer(300); // 5 minutes timer
      
      // Focus first OTP input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
      
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 400) {
          const errorData = error.response.data;
          
          if (errorData.msg === "Email already registered") {
            setApiError("This email is already registered. Please use a different email or login.");
          } else if (errorData.msg === "Phone must be in Nepal format +977XXXXXXXXXX") {
            setApiError("Phone number must be in Nepal format (+977 followed by 10 digits). Example: +9779800000000");
          } else if (errorData.msg === "All fields are required") {
            setApiError("Please fill all required fields.");
          } else if (errorData.msg === "Passwords do not match") {
            setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
          } else if (errorData.msg === "OTP sent to email") {
            // Registration successful, show verification
            setSuccessMessage("OTP has been sent to your email.");
            setShowVerification(true);
            setTimer(300);
            setTimeout(() => {
              otpInputRefs.current[0]?.focus();
            }, 100);
          } else if (errorData.fields) {
            const backendErrors = {};
            errorData.fields.forEach(field => {
              backendErrors[field.toLowerCase().replace(/ /g, '')] = `Please check ${field}`;
            });
            setErrors(backendErrors);
          } else if (errorData.msg) {
            setApiError(errorData.msg);
          } else {
            setApiError("Registration failed. Please check your information.");
          }
        } else if (error.response.status === 500) {
          // Check if it's an email sending error
          const errorMsg = error.response.data?.msg || "";
          
          if (errorMsg.includes("OTP") || errorMsg.includes("email")) {
            // Email sending failed, but user might be created
            setSuccessMessage("Registration successful! Please use the 'Resend OTP' button to get verification code.");
            setShowVerification(true);
            setTimer(300);
          } else {
            setApiError(`Server error: ${errorMsg || "Internal server error. Please try again later."}`);
          }
        } else {
          setApiError(`Registration failed (${error.response.status}). Please try again.`);
        }
      } else if (error.request) {
        setApiError("Unable to connect to server. Please check your internet connection.");
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setApiError("Please enter all 6 digits of the OTP.");
      return;
    }
    
    setVerifying(true);
    setApiError("");
    
    try {
      const response = await api.post("/customer/verify-otp", {
        Email: form.email.trim().toLowerCase(),
        OTP: otpValue,
      });
      
      setSuccessMessage("Email verified successfully! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error("OTP verification error:", error);
      
      if (error.response) {
        if (error.response.status === 400) {
          setApiError(error.response.data.msg || "Invalid OTP. Please try again.");
        } else {
          setApiError("Verification failed. Please try again.");
        }
      } else {
        setApiError("Unable to verify OTP. Please check your connection.");
      }
      
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setApiError("");
    setSuccessMessage("");
    
    try {
      await api.post("/customer/resend-otp", {
        Email: form.email.trim().toLowerCase(),
      });
      
      setSuccessMessage("New OTP sent to your email.");
      setTimer(300); // Reset timer to 5 minutes
      setOtp(["", "", "", "", "", ""]);
      
      // Focus first input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
      
    } catch (error) {
      console.error("Resend OTP error:", error);
      setApiError("Failed to resend OTP. Please try again.");
    }
  };

  const fileName = (f) => (f ? f.name : "No file chosen");

 return (
  <div 
  className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
  style={{
    background: 'linear-gradient(145deg, #f5efe6 50%, #e8e0d5 30%, #dad1c5 60%)'
  }}
>
  {/* Subtle floating circles */}
  <div className="absolute inset-0 overflow-hidden">
  
  </div>
    <form
      onSubmit={submitRegistration}
      className="w-full max-w-5xl rounded-2xl shadow-xl border border-gray-800 overflow-hidden md:flex"
    >
      {/* Left panel with image - translucent with overlay text */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-0 overflow-hidden">
        {/* Background image with opacity */}
        <img 
          src={cusregImage} 
          alt="Customer Registration" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          style={{ maxHeight: '100%', width: '100%' }}
        />
        
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-amber-100/40  to-rose-300/60 mix-blend-multiply"></div>
        
        {/* Content overlay */}
        <div className="relative z-10 text-white text-center p-8 max-w-xs">
          <h3 className="text-3xl font-bold mb-4">Join as Customer</h3>
          <div className="w-20 h-1 bg-white mx-auto mb-6"></div>
          <p className="text-lg mb-4">Create your account</p>
          <p className="text-sm text-gray-200">
            Get access to verified professionals and quality services tailored to your needs
          </p>
          </div>
        </div>

         {/* Right panel - dark blacky blue purple mixture */}
     <div className="w-full md:w-1/2 p-8 relative" 
  style={{
    background: 'linear-gradient(145deg, #e6f0fa 50%, #d4e6f5 60%, #c2d9f0 100%)'}}
      >
        
        {/* Header with subtle glow */}
        <div className="mb-6 relative">
          <h2 className="text-2xl font-bold text-blue-900">Customer Registration</h2>
          <p className="text-sm text-purple-800">Create your account to get started</p>
          <div className="w-12 h-0.5 bg-linear-to-r from-purple-500 to-blue-500 mt-2"></div>
        </div>
          {/* API Error Message */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{apiError}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Form fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: form fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input 
                  name="fullName" 
                  value={form.fullName} 
                  onChange={handleInput} 
                  placeholder="Your full name" 
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  disabled={submitting || showVerification}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  name="email" 
                  value={form.email} 
                  onChange={handleInput} 
                  placeholder="example@gmail.com" 
                  type="email"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  disabled={submitting || showVerification}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone field moved here - before password */}
              <div>
                <label className="text-sm font-medium text-slate-700">Phone <span className="text-red-500 ml-1">*</span></label>
                <div className="flex gap-3 items-center">
                  <div className="shrink-0">
                    <select
                      name="countryCode"
                      value={form.countryCode}
                      onChange={handleInput}
                      className="p-2 rounded-xl border border-gray-200 bg-white text-sm text-slate-800 min-w-[100px]"
                      disabled={submitting}
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    value={form.phone}
                    onChange={handlePhoneChange}
                    className="flex-1 p-2 rounded-xl border border-gray-200 bg-white text-sm text-slate-800 min-w-[150px]"
                    placeholder="9800000000"
                    disabled={submitting}
                    type="tel"
                    maxLength="10"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                <p className="text-xs text-gray-500 mt-1">Currently only Nepali numbers are supported (10 digits)</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <input 
                  type="password" 
                  name="password" 
                  value={form.password} 
                  onChange={handleInput} 
                  placeholder="Minimum 8 characters with uppercase, lowercase, number, and special character"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  disabled={submitting || showVerification}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={form.confirmPassword} 
                  onChange={handleInput} 
                  placeholder="Re-enter your password"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  disabled={submitting || showVerification}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Right column: profile photo (optional) */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                {form.profilePhoto ? (
                  <img 
                    src={URL.createObjectURL(form.profilePhoto)} 
                    alt="profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-300 text-sm text-center px-2">
                    Profile Photo
                  </span>
                )}
              </div>
              <label className="w-full flex justify-center items-center">
                <input 
                  type="file" 
                  name="profilePhoto" 
                  accept="image/*" 
                  onChange={handleFile} 
                  className="hidden"
                  disabled={submitting || showVerification}
                />
                <span className={`px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm hover:shadow-sm cursor-pointer hover:border-red-500 transition-colors ${(submitting || showVerification) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  Choose Photo
                </span>
              </label>
              <p className="text-xs text-gray-400">{fileName(form.profilePhoto)}</p>
              {errors.profilePhoto && <p className="text-red-500 text-sm text-center">{errors.profilePhoto}</p>}
              <p className="text-xs text-gray-400 text-center"> • Max size 5 MB • JPG, PNG</p>
            </div>
          </div>

          {/* Address Section */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="text-md font-semibold text-slate-800 mb-3">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Province <span className="text-red-500">*</span></label>
                <select
                  name="province"
                  value={form.province}
                  onChange={handleProvinceChange}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  disabled={submitting || showVerification}
                >
                  <option value="">Select Province</option>
                  {Object.keys(addresData).map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700">District <span className="text-red-500">*</span></label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleDistrictChange}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  disabled={!districts.length || submitting || showVerification}
                >
                  <option value="">Select District</option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
                {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700">Municipality <span className="text-red-500">*</span></label>
                <select
                  name="municipality"
                  value={form.municipality}
                  onChange={handleMunicipalityChange}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  disabled={!municipalities.length || submitting || showVerification}
                >
                  <option value="">Select Municipality</option>
                  {municipalities.map((mun) => (
                    <option key={mun} value={mun}>
                      {mun}
                    </option>
                  ))}
                </select>
                {errors.municipality && <p className="text-red-500 text-sm mt-1">{errors.municipality}</p>}
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700">Ward No <span className="text-red-500">*</span></label>
                <select
                  name="wardNo"
                  value={form.wardNo}
                  onChange={handleInput}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  disabled={!wards.length || submitting || showVerification}
                >
                  <option value="">Select Ward</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                {errors.wardNo && <p className="text-red-500 text-sm mt-1">{errors.wardNo}</p>}
              </div>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-600">
              By registering, you agree to our 
              <span className="text-slate-900 font-medium"> Terms of Service </span> 
              and acknowledge our 
              <span className="text-slate-900 font-medium"> Privacy Policy</span>. 
              You'll receive an OTP via email for verification.
            </p>
          </div>

          {/* Verification Section (Shows after registration) */}
          {showVerification && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl animate-fadeIn">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Verify Your Email</h3>
              <p className="text-sm text-slate-600 mb-4">
                Enter the 6-digit OTP sent to <span className="font-medium">{form.email}</span>
              </p>
              
              {/* OTP Input */}
              <div className="flex justify-center gap-3 mb-4">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg font-bold rounded-lg border border-gray-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={verifying}
                  />
                ))}
              </div>
              
              {/* Timer */}
              {timer > 0 ? (
                <p className="text-sm text-gray-600 text-center mb-4">
                  OTP expires in: <span className="font-medium">{formatTime(timer)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600 text-center mb-4">
                  OTP has expired. Please resend.
                </p>
              )}
              
              {/* Verification Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={verifying || otp.join("").length !== 6}
                  className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : "Verify OTP"}
                </button>
                
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={timer > 240} // Can resend after 1 minute
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="mt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={submitting || verifying}
            >
              Cancel
            </button>
            
            {!showVerification ? (
              <button 
                type="submit" 
                disabled={submitting} 
                className="px-8 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  "Register & Verify"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowVerification(false);
                  setApiError("");
                  setSuccessMessage("");
                }}
                className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Edit
              </button>
            )}
          </div>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-slate-900 font-medium hover:underline"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </form>
   </div>
);
};

export default CustomerRegistration;