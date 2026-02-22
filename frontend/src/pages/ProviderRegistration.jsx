import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import addresData from "../data/addresData.json";

const API_BASE_URL = "http://localhost:5000/api";

// Configure axios for service provider
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const servicesList = [
  "Plumber", "Electrician", "Home Tutors", "Painter", "House Help", "Babysitters",
  "Beauty & Salon", "Event Decorators", "Carpenter", "Photographer", "Band Baja",
  "Private Chef", "Locksmith", "Boutiques", "Movers & Packers", "Catering Server"
];

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
  { code: "+971", label: "UAE" }
];

const idTypes = ["Citizenship", "National ID", "Passport"];

const ProviderRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const otpInputRefs = useRef([]);

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", countryCode: "+977", sex: "",
    password: "", confirmPassword: "",
    service: "", experience: "", skills: "", skillsInput: "", // Added skillsInput
    province: "", district: "", municipality: "", wardNo: "",
    bio: "",
    profilePhoto: null, idType: "", idFile: null, cvFile: null,
    portfolio: [], extraCert: [{ file: null }]
  });

  // for dynamic location selects
  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [wards, setWards] = useState([]);

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      // Cleanup object URLs if any
      if (form.profilePhoto && typeof form.profilePhoto !== 'string') {
        URL.revokeObjectURL(URL.createObjectURL(form.profilePhoto));
      }
    };
  }, [form.profilePhoto]);

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

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    if (name === "portfolio") {
      setForm((p) => ({ ...p, portfolio: Array.from(files) }));
    } else if (name === "profilePhoto") {
      // Cleanup previous object URL if exists
      if (form.profilePhoto && typeof form.profilePhoto !== 'string') {
        URL.revokeObjectURL(URL.createObjectURL(form.profilePhoto));
      }
      setForm((p) => ({ ...p, [name]: files[0] }));
    } else {
      setForm((p) => ({ ...p, [name]: files[0] }));
    }
  };

  const handleExtraCertChange = (index, file) => {
    const updated = [...form.extraCert];
    updated[index].file = file;
    setForm((p) => ({ ...p, extraCert: updated }));
  };

  const addExtraCert = () => {
    setForm((p) => ({
      ...p,
      extraCert: [...p.extraCert, { file: null }]
    }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const number = value.replace(/\D/g, "");
    setForm((p) => ({ ...p, phone: number }));
  };

  const isTooLarge = (file) => file?.size > 5 * 1024 * 1024;

  const validateStep = () => {
    const err = {};

    if (step === 1) {
      if (!form.fullName) err.fullName = "Full name required";
      if (!form.email) err.email = "Email required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        err.email = "Invalid email format";

      if (!form.phone) err.phone = "Phone required";
      else if (form.phone.length !== 10) err.phone = "Phone must be 10 digits";
      if (!form.sex) err.sex = "Sex required";
      if (!form.password) err.password = "Password required";
      else if (form.password.length < 8) err.password = "Min. 8 characters";
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(form.password)) {
        err.password = "Password must include uppercase, lowercase, number, and special character";
      }

      if (form.password !== form.confirmPassword)
        err.confirmPassword = "Password mismatch";

      if (!form.profilePhoto) err.profilePhoto = "Profile photo required";
      else if (isTooLarge(form.profilePhoto)) err.profilePhoto = "Max size 5 MB";
    }

    if (step === 2) {
      if (!form.service) err.service = "Choose your service";
      if (!form.experience) err.experience = "Experience required";
      if (!form.skills || form.skills.split(',').filter(s => s.trim()).length === 0) 
        err.skills = "Enter at least one skill";
    }

    if (step === 3) {
      if (!form.province) err.province = "Province required";
      if (!form.district) err.district = "District required";
      if (!form.municipality) err.municipality = "Municipality required";
      if (!form.wardNo) err.wardNo = "Ward number required";
    }

    if (step === 4) {
      if (!form.idType) err.idType = "Select your ID type";

      if (!form.idFile) err.idFile = "Upload ID";
      else if (isTooLarge(form.idFile)) err.idFile = "Max size 5 MB";

      if (!form.cvFile) err.cvFile = "Upload CV";
      else if (isTooLarge(form.cvFile)) err.cvFile = "Max size 5 MB";

      if (form.portfolio.some((f) => isTooLarge(f)))
        err.portfolio = "Each image must be under 5 MB";

      if (form.extraCert.some((c) => c.file && isTooLarge(c.file)))
        err.extraCert = "Each certificate must be under 5 MB";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // OTP Handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
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
      otpInputRefs.current[5]?.focus();
    }
  };

  const next = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => s - 1);

  // Prepare form data for API - Match backend field names
  const prepareFormData = async () => {
    const formData = new FormData();
    
    // Basic info - Match backend field names exactly
    formData.append("Full Name", form.fullName.trim());
    formData.append("Email", form.email.trim().toLowerCase());
    formData.append("Phone", form.countryCode + form.phone);
    formData.append("Password", form.password);
    formData.append("Confirm Password", form.confirmPassword);
    formData.append("Sex", form.sex);
    
    // Professional info
    formData.append("Service", form.service);
    formData.append("Year of Experience", form.experience);
    formData.append("Skills / Expertise", form.skills);
    formData.append("Short Bio", form.bio || "");
    
    // Location
    formData.append("Province", form.province);
    formData.append("District", form.district);
    formData.append("Municipality", form.municipality);
    formData.append("Ward No", form.wardNo);
    
    // Files - Match backend field names
    if (form.profilePhoto) {
      formData.append("Profile Photo", form.profilePhoto);
    }
    
    if (form.idFile) {
      formData.append("Upload ID", form.idFile);
    }
    
    if (form.cvFile) {
      formData.append("Upload CV", form.cvFile);
    }
    
    formData.append("ID type", form.idType);
    
    // Portfolio files
    form.portfolio.forEach((file, index) => {
      formData.append("Portfolio", file);
    });
    
    // Extra certificates
    form.extraCert.forEach((cert, index) => {
      if (cert.file) {
        formData.append("Extra Certificate", cert.file);
      }
    });
    
    return formData;
  };

  // Submit Registration
  const submitRegistration = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");
    
    if (step < 4) {
      if (!validateStep()) return;
      next();
      return;
    }
    
    if (!validateStep()) return;
    
    // Force Nepali phone number for backend requirement
    if (form.countryCode !== "+977") {
      setApiError("Currently, only Nepali phone numbers (+977) are supported for registration.");
      return;
    }
    
    setSubmitting(true);

    try {
      const formData = await prepareFormData();
      
      const response = await api.post("/service-provider/sp-register", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Registration response:", response.data);
      
      // Show success and open verification section
      setSuccessMessage("Registration successful! OTP has been sent to your email.");
      setShowVerification(true);
      setTimer(300); // 5 minutes timer
      
      // Only focus OTP input when verification section is shown
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 100);
      
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.response) {
        if (error.response.status === 400) {
          const errorData = error.response.data;
          
          if (errorData.error?.includes("already registered") || errorData.message?.includes("already registered")) {
            setApiError("This email is already registered. Please use a different email or login.");
          } else if (errorData.error?.includes("Phone must be in Nepal format") || errorData.message?.includes("Phone must be in Nepal format")) {
            setApiError("Phone number must be in Nepal format (+977 followed by 10 digits). Example: +9779800000000");
          } else if (errorData.error?.includes("All fields are required") || errorData.message?.includes("All fields are required")) {
            setApiError("Please fill all required fields.");
          } else if (errorData.error?.includes("Passwords do not match") || errorData.message?.includes("Passwords do not match")) {
            setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
          } else if (errorData.message?.includes("ID Verification Failed")) {
            setApiError("ID verification failed. Please ensure your ID document matches your information.");
          } else if (errorData.message?.includes("OTP sent") || errorData.message?.includes("Registered successfully")) {
            // Registration successful, show verification
            setSuccessMessage("OTP has been sent to your email.");
            setShowVerification(true);
            setTimer(300);
            setTimeout(() => {
              if (otpInputRefs.current[0]) {
                otpInputRefs.current[0].focus();
              }
            }, 100);
          } else if (errorData.error) {
            setApiError(errorData.error);
          } else if (errorData.message) {
            setApiError(errorData.message);
          } else {
            setApiError("Registration failed. Please check your information.");
          }
        } else if (error.response.status === 500) {
          const errorMsg = error.response.data?.error || error.response.data?.message || "";
          
          if (errorMsg.includes("OTP") || errorMsg.includes("email")) {
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
      const response = await api.post("/service-provider/sp-verify-otp", {
        Email: form.email.trim().toLowerCase(),
        OTP: otpValue,
      });
      
      setSuccessMessage("Email verified successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error("OTP verification error:", error);
      
      if (error.response) {
        if (error.response.status === 400 || error.response.status === 404) {
          setApiError(error.response.data?.error || error.response.data?.message || "Invalid OTP. Please try again.");
        } else {
          setApiError("Verification failed. Please try again.");
        }
      } else {
        setApiError("Unable to verify OTP. Please check your connection.");
      }
      
      setOtp(["", "", "", "", "", ""]);
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setApiError("");
    setSuccessMessage("");
    
    try {
      await api.post("/service-provider/sp-resend-otp", {
        Email: form.email.trim().toLowerCase(),
      });
      
      setSuccessMessage("New OTP sent to your email.");
      setTimer(300);
      setOtp(["", "", "", "", "", ""]);
      
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 100);
      
    } catch (error) {
      console.error("Resend OTP error:", error);
      setApiError("Failed to resend OTP. Please try again.");
    }
  };

  // --- Handlers for dynamic location selects ---
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

  const fileName = (f) => (f ? f.name : "No file chosen");

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <form
        onSubmit={submitRegistration}
        className="w-full max-w-5xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden md:flex"
        encType="multipart/form-data"
      >
        {/* Left: decorative image panel */}
        <div className="hidden md:flex md:w-1/2 bg-slate-900 text-white items-center justify-center p-8">
          <div className="max-w-xs">
            <div className="w-full h-64 rounded-xl bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
              <div className="text-center px-6">
                <h3 className="text-xl font-bold mb-2">Become a verified professional</h3>
                <p className="text-sm text-slate-300">
                  Build a trusted profile and get matched with customers nearby.
                </p>
              </div>
            </div>
            <div className="mt-6 text-sm text-slate-400">
              Tip: Keep your portfolio and verification documents ready for a faster approval.
            </div>
          </div>
        </div>

        {/* Right: form panel */}
        <div className="w-full md:w-1/2 bg-white p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Create your professional account</h2>
              <p className="text-sm text-slate-600">Build your professional profile</p>
            </div>
            {!showVerification && (
              <div className="text-right">
                <p className="text-sm text-slate-500">Step</p>
                <p className="text-lg font-semibold text-slate-900">{step} / 4</p>
              </div>
            )}
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

          {/* Progress bar */}
          {!showVerification && (
            <div className="w-full h-2 rounded-full bg-gray-200 mb-6">
              <div
                className="h-2 bg-slate-900 rounded-full transition-all"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          )}

          {/* Verification Section */}
          {showVerification ? (
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
                  disabled={timer > 240}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerification(false);
                    setApiError("");
                    setSuccessMessage("");
                  }}
                  className="text-sm text-slate-600 hover:text-slate-800 hover:underline"
                >
                  ← Back to registration form
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* STEP 1 */}
              {step === 1 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-15">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Full Name <span className="text-red-500 ml-1">*</span></label>
                        <input
                          name="fullName"
                          value={form.fullName}
                          onChange={handleInput}
                          placeholder="Your full name"
                          className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-50"
                          disabled={submitting}
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700">Email <span className="text-red-500 ml-1">*</span></label>
                        <input
                          name="email"
                          value={form.email}
                          onChange={handleInput}
                          placeholder="example@gmail.com"
                          className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-50"
                          disabled={submitting}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

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
                        <label className="text-sm font-medium text-slate-700">Password <span className="text-red-500 ml-1">*</span></label>
                        <input
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleInput}
                          placeholder="Create password"
                          className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                          disabled={submitting}
                        />
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700">Confirm Password <span className="text-red-500 ml-1">*</span></label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleInput}
                          placeholder="Re-type password"
                          className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                          disabled={submitting}
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">Sex <span className="text-red-500 ml-1">*</span></label>
                        <div className="flex gap-4">
                          {["Male", "Female", "Other"].map((g) => (
                            <label key={g} className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name="sex"
                                value={g}
                                checked={form.sex === g}
                                onChange={handleInput}
                                className="h-4 w-4 text-slate-900"
                                disabled={submitting}
                              />
                              <span className="text-sm text-slate-700">{g}</span>
                            </label>
                          ))}
                        </div>
                        {errors.sex && (
                          <p className="text-red-500 text-sm mt-1">{errors.sex}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                          {form.profilePhoto ? (
                            <img
                              src={URL.createObjectURL(form.profilePhoto)}
                              alt="profile preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M4 20v-1a4 4 0 014-4h8a4 4 0 014 4v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>

                        <label className="mt-3 w-full flex items-center justify-center">
                          <input
                            type="file"
                            name="profilePhoto"
                            accept="image/*"
                            onChange={handleFile}
                            className="hidden"
                            disabled={submitting}
                          />
                          <span className={`inline-block px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-slate-700 hover:shadow-sm transform hover:scale-[1.02] transition ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            Choose photo
                          </span>
                        </label>

                        <p className="text-xs text-slate-400 mt-2 text-center">{fileName(form.profilePhoto)}</p>
                        {errors.profilePhoto && <p className="text-red-500 text-sm mt-1">{errors.profilePhoto}</p>}
                        <p className="text-xs text-slate-400 mt-2 text-center">JPG/PNG, max 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Professional Info</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Service <span className="text-red-500 ml-1">*</span></label>
                      <select
                        name="service"
                        value={form.service}
                        onChange={handleInput}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                        disabled={submitting}
                      >
                        <option value="">Select service</option>
                        {servicesList.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                      {errors.service && (
                        <p className="text-red-500 text-sm mt-1">{errors.service}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Years of Experience <span className="text-red-500 ml-1">*</span></label>
                      <input
                        type="number"
                        name="experience"
                        value={form.experience}
                        onChange={handleInput}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                        placeholder="e.g. 3"
                        disabled={submitting}
                      />
                      {errors.experience && (
                        <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Skills / Expertise <span className="text-red-500 ml-1">*</span></label>
                      
                      <div className="mb-2">
                        <div className="flex gap-2 flex-wrap mb-2">
                          {form.skills.split(',').filter(skill => skill.trim() !== '').map((skill, index) => (
                            <div key={index} className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm">
                              {skill.trim()}
                              <button
                                type="button"
                                onClick={() => {
                                  if (submitting) return;
                                  const skillsArray = form.skills.split(',').filter(s => s.trim() !== '');
                                  skillsArray.splice(index, 1);
                                  setForm(p => ({ ...p, skills: skillsArray.join(',') }));
                                }}
                                className="text-slate-500 hover:text-slate-700 ml-1"
                                disabled={submitting}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.skillsInput || ''}
                            onChange={(e) => {
                              if (submitting) return;
                              setForm(p => ({ ...p, skillsInput: e.target.value }));
                            }}
                            onKeyDown={(e) => {
                              if (submitting) return;
                              if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                const newSkill = form.skillsInput?.trim();
                                if (newSkill) {
                                  const currentSkills = form.skills ? form.skills.split(',').filter(s => s.trim() !== '') : [];
                                  if (!currentSkills.includes(newSkill)) {
                                    const updatedSkills = [...currentSkills, newSkill].join(',');
                                    setForm(p => ({ 
                                      ...p, 
                                      skills: updatedSkills,
                                      skillsInput: '' 
                                    }));
                                  }
                                }
                              }
                            }}
                            className="flex-1 p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                            placeholder="Type skill and press Enter or comma"
                            disabled={submitting}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (submitting) return;
                              const newSkill = form.skillsInput?.trim();
                              if (newSkill) {
                                const currentSkills = form.skills ? form.skills.split(',').filter(s => s.trim() !== '') : [];
                                if (!currentSkills.includes(newSkill)) {
                                  const updatedSkills = [...currentSkills, newSkill].join(',');
                                  setForm(p => ({ 
                                    ...p, 
                                    skills: updatedSkills,
                                    skillsInput: '' 
                                  }));
                                }
                              }
                            }}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
                            disabled={submitting}
                          >
                            Add
                          </button>
                        </div>
                        
                        <p className="text-xs text-slate-400 mt-1">Press Enter to add a skill, or click Add button</p>
                      </div>
                      
                      {errors.skills && (
                        <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Short Bio</label>
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleInput}
                        rows="4"
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                        placeholder="Introduce yourself briefly..."
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Location Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Province <span className="text-red-500 ml-1">*</span></label>
                      <select
                        name="province"
                        value={form.province}
                        onChange={handleProvinceChange}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                        disabled={submitting}
                      >
                        <option value="">Select Province</option>
                        {Object.keys(addresData).map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                      {errors.province && (
                        <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">District <span className="text-red-500 ml-1">*</span></label>
                      <select
                        name="district"
                        value={form.district}
                        onChange={handleDistrictChange}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                        disabled={!districts.length || submitting}
                      >
                        <option value="">Select District</option>
                        {districts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                      {errors.district && (
                        <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Municipality <span className="text-red-500 ml-1">*</span></label>
                      <select
                        name="municipality"
                        value={form.municipality}
                        onChange={handleMunicipalityChange}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                        disabled={!municipalities.length || submitting}
                      >
                        <option value="">Select Municipality</option>
                        {municipalities.map((mun) => (
                          <option key={mun} value={mun}>
                            {mun}
                          </option>
                        ))}
                      </select>
                      {errors.municipality && (
                        <p className="text-red-500 text-sm mt-1">{errors.municipality}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Ward No <span className="text-red-500 ml-1">*</span></label>
                      <select
                        name="wardNo"
                        value={form.wardNo}
                        onChange={handleInput}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                        disabled={!wards.length || submitting}
                      >
                        <option value="">Select Ward</option>
                        {wards.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                      {errors.wardNo && (
                        <p className="text-red-500 text-sm mt-1">{errors.wardNo}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Documents Upload</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">ID Type <span className="text-red-500 ml-1">*</span></label>
                      <select
                        name="idType"
                        value={form.idType}
                        onChange={handleInput}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                        disabled={submitting}
                      >
                        <option value="">Select ID Type</option>
                        {idTypes.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                      {errors.idType && (
                        <p className="text-red-500 text-sm mt-1">{errors.idType}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Upload ID <span className="text-red-500 ml-1">*</span></label>
                      <p className="text-xs text-slate-400 mb-1">Max size: 5 MB (JPG/PNG)</p>
                      <input
                        type="file"
                        name="idFile"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleFile}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                        disabled={submitting}
                      />
                      {errors.idFile && (
                        <p className="text-red-500 text-sm mt-1">{errors.idFile}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Upload CV <span className="text-red-500 ml-1">*</span></label>
                      <p className="text-xs text-slate-400 mb-1">Max: 5 MB (PDF)</p>
                      <input
                        type="file"
                        name="cvFile"
                        accept=".pdf"
                        onChange={handleFile}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                        disabled={submitting}
                      />
                      {errors.cvFile && (
                        <p className="text-red-500 text-sm mt-1">{errors.cvFile}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Portfolio</label>
                      <p className="text-xs text-slate-400 mb-1">Max: 5 MB each (JPG/PNG/PDF)</p>
                      <input
                        type="file"
                        name="portfolio"
                        accept=".pdf,.jpg,.png"
                        multiple
                        onChange={handleFile}
                        className="w-full p-2 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                        disabled={submitting}
                      />
                      <p className="text-xs text-slate-400 mt-1">{form.portfolio.length} selected</p>
                      {errors.portfolio && (
                        <p className="text-red-500 text-sm mt-1">{errors.portfolio}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-700 block mb-2">Extra Certificates</label>
                      <p className="text-xs text-slate-400 mb-2">Max: 5 MB each (PDF/JPG/PNG)</p>

                      {form.extraCert.map((c, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.png"
                            onChange={(e) => handleExtraCertChange(i, e.target.files[0])}
                            className="flex-1 p-2 rounded-xl border border-gray-200 bg-white text-sm text-slate-800"
                            disabled={submitting}
                          />
                          {i === form.extraCert.length - 1 && (
                            <button
                              type="button"
                              onClick={addExtraCert}
                              className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center disabled:opacity-50"
                              disabled={submitting}
                            >
                              +
                            </button>
                          )}
                        </div>
                      ))}

                      {errors.extraCert && (
                        <p className="text-red-500 text-sm mt-1">{errors.extraCert}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          {!showVerification && (
            <div className="flex justify-between items-center mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prev}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  Previous
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  className="px-8 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  Next
                </button>
              ) : (
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
              )}
            </div>
          )}

          {!showVerification && (
            <p className="text-xs text-slate-500 mt-4">By continuing, you agree to our terms & conditions.</p>
          )}

          {/* Login link */}
          {!showVerification && (
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
          )}
        </div>
      </form>
    </div>
  );
};

export default ProviderRegistration;