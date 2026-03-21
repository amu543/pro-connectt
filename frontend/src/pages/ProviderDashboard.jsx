import axios from "axios";
import { motion } from "framer-motion";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Award,
  Briefcase,
  CheckCircle,
  ClipboardList,
  Edit2,
  LogOut,
  MapPin,
  Navigation,
  Plus,
  Save,
  Star,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaPhone } from "react-icons/fa";
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate } from "react-router-dom";

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});



// API Configuration
const API_BASE_URL = "http://localhost:5000/api";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([]);
   const [newSkill, setNewSkill] = useState({ name: "", price: "" });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
 const [reviews, setReviews] = useState([]);
 const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // ----------------------
  // API DATA STATES
  // ----------------------
  const [profile, setProfile] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const token = localStorage.getItem("token"); // Auth token
   

  // Map Component for Modal
const MapModal = () => {
  console.log("MapModal rendering with:", { selectedLocation, selectedCustomer });
 
  if (!selectedLocation) {
    console.log("No location selected, returning null");
    return null;
  }
 
  const position = [selectedLocation.latitude, selectedLocation.longitude];
  console.log("Map position:", position);
 
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowMapModal(false)}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-96 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {selectedCustomer?.name || "Customer"} Location
          </h3>
          <button
            onClick={() => setShowMapModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="relative w-full h-[calc(100%-4rem)]">
          {position && position[0] && position[1] ? (
            <MapContainer
              key={`${position[0]}-${position[1]}`}
              center={position}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>
                  <div className="p-2">
                    <strong className="text-gray-900">{selectedCustomer?.name || "Customer"}</strong><br />
                    📍 Service Location<br />
                    <small>Lat: {selectedLocation.latitude.toFixed(6)}<br />
                    Lng: {selectedLocation.longitude.toFixed(6)}</small>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Invalid coordinates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

  // First, check the provider details to get the ID
fetch('http://localhost:5000/api/sp-service-page/my-details', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('Provider data:', data);
  console.log('Provider ID:', data._id || data.id);
   const providerId = data._id;
  if (providerId) {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      userData._id = providerId;
        userData.fullName = data.fullName;
    userData.email = data.email;
    userData.phone = data.phone;
      localStorage.setItem("userData", JSON.stringify(userData));
      console.log('✅ Saved provider ID to localStorage:', providerId);
    fetch(`http://localhost:5000/api/customer/rating/average/${providerId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(ratingData => {
      console.log('Rating data:', ratingData);
    })
    .catch(err => console.error('Rating fetch error:', err));
  }
})
.catch(err => console.error('Provider fetch error:', err));

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const getImageUrl = (photoPath) => {
  if (!photoPath) return null;
  
  // If it's already a full URL
  if (photoPath.startsWith('http')|| photoPath.startsWith('data:')) return photoPath;
  
  // Clean up the path (remove any double slashes)
   let cleanPath = photoPath.replace(/\\/g, '/').replace(/\/+/g, '/');
  
  // If it's just a filename without path, add /uploads/
  if (!cleanPath.includes('/')) {
    cleanPath = `/uploads/${cleanPath}`;
  }
  
  // If it doesn't start with /uploads but should
  if (!cleanPath.startsWith('/uploads') && cleanPath.includes('uploads')) {
    const uploadsIndex = cleanPath.indexOf('uploads');
    cleanPath = cleanPath.substring(uploadsIndex - 1);
  }
  
  // Ensure it starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  const fullUrl = `${API_BASE_URL.replace('/api', '')}${cleanPath}`;
  console.log("Constructed URL:", fullUrl);
  
  return fullUrl;
};

  // Configure axios with auth header
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={i < Math.floor(rating || 0) ? "text-yellow-500 fill-current" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };
// ----------------------
// FETCH PROFILE & REQUESTS
// ----------------------
useEffect(() => {
  if (!token) {
    navigate("/");
    return;
    
  }

  const fetchData = async () => {
    setLoading(true);
    try {
       const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
       
      const providerId = storedUserData._id;
    console.log("Stored userData:", storedUserData);
      // Fetch profile data from /my-details endpoint
      const profileRes = await api.get("/sp-service-page/my-details");
      const profileData = profileRes.data;
      console.log("Profile data from /my-details:", profileData); 
      // Try multiple sources to get the provider ID

    
    
      // Map //
      const mappedProfile = {
          _id: providerId, // ensure we have the ID for ratings
        name: profileData.fullName || "",
        email: profileData.email || "", 
        phone: profileData.phone || "", 
        service: profileData.service || "",
        experience: profileData.yearsOfExperience || profileData.experience || "0", 
        rating: profileData.rating || 0, 
        totalRatings: profileData.totalRatings || 0,
        bio: profileData.shortBio || "",
        province: profileData.address?.province || "",
        district: profileData.address?.district || "",
        municipality: profileData.address?.municipality || "",
        ward: profileData.address?.ward || "",
        latitude: profileData.currentLocation?.coordinates?.[1] || 0,
        longitude: profileData.currentLocation?.coordinates?.[0] || 0,
        skills: profileData.skills?.map(skill => ({
          name: skill.name || skill,
          price: skill.price || null
        })) || [],
        profilePhoto: profileData.photo || null
      };
      console.log("Mapped profile photo:", mappedProfile.profilePhoto);
      console.log("Initial profile rating from DB:", mappedProfile.rating, "Total reviews:", mappedProfile.totalRatings);
      setProfile(mappedProfile);
      setPhone(mappedProfile.phone);
      setBio(mappedProfile.bio);
      setSkills(mappedProfile.skills);
      setProfilePic(mappedProfile.profilePhoto);
      if (mappedProfile._id) {
  console.log("🧪 Testing rating endpoint with ID:", mappedProfile._id);
  try {
    const testResponse = await api.get(`/customer/rating/average/${mappedProfile._id}`);
    console.log("🧪 Rating endpoint test result:", testResponse.data);
  } catch (error) {
    console.error("🧪 Rating endpoint test failed:", error.response?.status, error.response?.data);
  }
} if (providerId) {
      try {
        console.log("Fetching ratings for provider ID:", providerId);
        const ratingResponse = await api.get(`/customer/rating/average/${providerId}`);
        console.log("Rating API Response:", ratingResponse.data);
        
        if (ratingResponse.data) {
          const avgRating = parseFloat(ratingResponse.data.avgRating);
          const totalRatings = ratingResponse.data.totalRatings;
          
          if (!isNaN(avgRating)) {
            setProfile(prev => ({
              ...prev,
              rating: avgRating,
              totalRatings: totalRatings || 0
            }));
            console.log("Rating updated successfully to:", avgRating);
          } else {
            console.log("No valid rating data found");
          }
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
        }
      }
    } else {
      console.warn("No provider ID available to fetch ratings");
    }
      // If email/phone are missing, you might need another endpoint
      if (!mappedProfile.email || !mappedProfile.phone) {
        try {
          // Try to get basic info from /sp-me if needed
          const basicInfoRes = await api.get("/service-provider/sp-me");
          const basicData = basicInfoRes.data;
          
          setProfile(prev => ({
            ...prev,
            email: basicData.email || prev.email,
            phone: basicData.phone || prev.phone,
            experience: basicData.experience || prev.experience,
            rating: basicData.rating || prev.rating
          }));
        } catch (error) {
          console.log("Could not fetch basic info:", error);
        }
      }

      // Fetch pending requests
      const pendingRes = await api.get("/service-provider/sp-requests/pending");
      setPendingRequests(pendingRes.data || []);

      // Fetch accepted requests
      const acceptedRes = await api.get("/service-provider/sp-requests/accepted");
      setAcceptedRequests(acceptedRes.data || []);

      // Fetch completed jobs
      const completedRes = await api.get("/service-provider/sp-requests/completed");
      console.log("COMPLETED JOBS RAW DATA:", completedRes.data);
      let completedJobsData = completedRes.data || [];
console.log("Completed jobs fetched:", completedJobsData.length);

// Fetch reviews separately
if (providerId) {
  try {
    const reviewsRes = await api.get(`/customer/rating/reviews/${providerId}`);
    const reviewsData = reviewsRes.data;
    console.log("Reviews fetched:", reviewsData);
    setReviews(reviewsData);
    
    // Create a map of review by requestId or customerId
    const reviewMap = new Map();
    reviewsData.forEach(review => {
      // Try to match by requestId if available, otherwise by customer and service
      if (review.requestId) {
        reviewMap.set(review.requestId, review);
      }
      // Also store by customerId as fallback
      if (review.customerId) {
        reviewMap.set(review.customerId, review);
      }
    });
    
    // Merge reviews with completed jobs
    completedJobsData = completedJobsData.map(job => {
      // Try to find matching review
      let matchingReview = null;
      
      // First try by requestId
      if (job._id && reviewMap.has(job._id)) {
        matchingReview = reviewMap.get(job._id);
      }
      // Then try by customer ID
      else if (job.customer?._id && reviewMap.has(job.customer._id)) {
        matchingReview = reviewMap.get(job.customer._id);
      }
      
      if (matchingReview) {
        console.log(`Found review for job ${job._id}:`, matchingReview);
        return {
          ...job,
          review: matchingReview.review,
          rating: matchingReview.rating,
          reviewDate: matchingReview.createdAt
        };
      }
      return job;
    });
    
    console.log("Completed jobs with reviews merged:", completedJobsData);
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
}
      setCompletedJobs(completedJobsData);

    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [token, navigate]);
useEffect(() => {
  if (profile.profilePhoto) {
    console.log("Syncing profilePic with profile.profilePhoto:", profile.profilePhoto);
    setProfilePic(profile.profilePhoto);
  }
}, [profile.profilePhoto]);
// ----------------------
// PROFILE HANDLERS - UPDATED FOR /my-details
// ----------------------
const handleSaveProfile = async () => {
  try {
     setLoading(true);
    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("skillsExpertise", JSON.stringify(skills.map(skill =>
       typeof skill === 'string' ? { name: skill, price: null } : skill
    )));
    formData.append("shortBio", bio);
    if (profilePhotoFile) {
      formData.append("profilePhoto", profilePhotoFile);
    }

    // Update profile using the correct endpoint
    const response = await axios.patch(
      `${API_BASE_URL}/sp-service-page/update-profile`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data.message) {
      alert("Profile updated successfully!");
      setIsEditing(false);
      //clear the file state
        setProfilePhotoFile(null);
      
      // Refresh profile data from /my-details
      const profileRes = await api.get("/sp-service-page/my-details");
      const profileData = profileRes.data;
       console.log("Updated profile data:", profileData);
      
      const updatedProfile = {
        name: profileData.fullName || profile.name,
        email: profileData.email || profile.email,
        phone: profileData.phone || phone,
        service: profileData.service || profile.service,
        experience: profileData.experience || profile.experience,
        rating: profileData.rating || profile.rating,
        bio: profileData.shortBio || bio,
        province: profileData.address?.province || profile.province,
        district: profileData.address?.district || profile.district,
        municipality: profileData.address?.municipality || profile.municipality,
        ward: profileData.address?.ward || profile.ward,
        latitude: profileData.currentLocation?.coordinates?.[1] || profile.latitude,
        longitude: profileData.currentLocation?.coordinates?.[0] || profile.longitude,
        skills: profileData.skills?.map(skill => ({
          name: skill.name || skill,
          price: skill.price || null
        })) || skills,
        profilePhoto: profileData.profilePhoto ||profileData.profilePhotoUrl || profilePic
      };
      
      setProfile(updatedProfile);
      
      setSkills(updatedProfile.skills);
       if (profileData.profilePhoto || profileData.profilePhotoUrl) {
        setProfilePic(profileData.profilePhoto || profileData.profilePhotoUrl);
      }
    }
  } catch (err) {
    console.error("Profile update failed:", err);
    alert("Failed to update profile: " + (err.response?.data?.error || err.message));
  }finally {
    setLoading(false);
  }
};

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skillExists = skills.some(s => s.name.toLowerCase() === newSkill.name.trim().toLowerCase());
      if (!skillExists) {
        setSkills([...skills, { 
          name: newSkill.name.trim(), 
          price: newSkill.price ? parseFloat(newSkill.price) : null 
        }]);
        setNewSkill({ name: "", price: "" });
      } else {
        alert("This skill already exists!");
      }
    }
  };

const removeSkill = (skillToRemove) => {
  // If skillToRemove is an object with name property
  if (typeof skillToRemove === 'object' && skillToRemove.name) {
    setSkills(skills.filter(skill => skill.name !== skillToRemove.name));
  } else {
    // If skillToRemove is a string
    setSkills(skills.filter(skill => 
      typeof skill === 'string' ? skill !== skillToRemove : skill.name !== skillToRemove
    ));
  }
};

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = (e) => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    
      setLoading(true);
    try {
    // Make sure we have a valid token
    const token = localStorage.getItem("token");
    if (!token) {
      // No token, just redirect
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("role");
      navigate("/");
      return;
    }
  
    
    // Call logout API
    const response = await api.post("/service-provider/sp-logout");
    console.log("Logout response:", response.data);
    
    // If we get here, logout was successful
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("role");
    navigate("/");
    
  } catch (error) {
    console.error("Logout API error:", error);
    
    // Even if API fails, we should still clear local storage
    // to prevent the user from staying logged in
    if (error.response?.status === 401) {
      // Token is invalid, just clear storage
      console.log("Token invalid, clearing storage");
    } else {
      // Other error, but still clear storage to be safe
      console.error("Logout failed but clearing local storage anyway");
    }
    
    // Always clear local storage on logout attempt
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("role");
    
    // Redirect to login
    navigate("/");
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  const checkOnlineStatus = async () => {
    try {
      const response = await api.get("/service-provider/sp-online-status");
      console.log("Current online status:", response.data.isOnline);
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };
  
  if (token) {
    checkOnlineStatus();
  }
}, [token]);
  // ----------------------
  // REQUEST HANDLERS
  // ----------------------
  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post(`/service-provider/sp-request-accept/${requestId}`);
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
      alert("Request accepted!");
    } catch (err) {
      console.error("Accept error:", err);
      alert("Failed to accept request: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDenyRequest = async (requestId) => {
    try {
      await api.post(`/service-provider/sp-request-reject/${requestId}`);
      setPendingRequests(prev => prev.filter(r => r.requestId !== requestId));
      alert("Request denied!");
    } catch (err) {
      console.error("Deny error:", err);
      alert("Failed to deny request: " + (err.response?.data?.error || err.message));
    }
  };
  useEffect(() => {
  console.log("📊 PROFILE STATE DEBUG:", {
    _id: profile._id,
    name: profile.name,
    rating: profile.rating,
    totalRatings: profile.totalRatings,
    allKeys: Object.keys(profile),
    fullProfile: profile
  });
}, [profile]);
useEffect(() => {
  console.log("🔄 Rating fetch useEffect triggered");
  console.log("📊 Current profile state:", profile);
  console.log("🔑 profile._id exists?", !!profile._id);
  console.log("🔑 profile._id value:", profile._id);
const fetchProviderRatings = async () => {
  console.log("🔍 Checking profile._id:", profile._id);
   if (profile._id) {
    console.log("✅ profile._id exists, fetching ratings from:", `/customer/rating/average/${profile._id}`);
  try {
    const response = await api.get(`/customer/rating/average/${profile._id}`);
    console.log("Fetched ratings:", response.data);
    if (response.data) {
      const avgRating = parseFloat(response.data.avgRating);
          const totalRatings = response.data.totalRatings;
          
          console.log("Updating profile with:", { avgRating, totalRatings });
      if (!isNaN(avgRating)) {
            setProfile(prev => {
              console.log(`🔄 Updating rating from ${prev.rating} to ${avgRating}`);
              return {
                ...prev,
                rating: avgRating,
                totalRatings: totalRatings || 0
              };
            });
          }
        }
  } catch (error) {
    console.error("Error fetching ratings:", error);
     console.error("Error details:", error.response?.data);
  } 
}else {
      console.log("⚠️ No profile._id available yet");
    }
  };
    fetchProviderRatings();
}, [profile._id]);
  
  const handleCompleteJob = async (requestId) => {
    try {
      await api.post(`/service-provider/sp-request-complete/${requestId}`);
      setAcceptedRequests(prev => prev.filter(r => r.requestId !== requestId));
      alert("Job completed!");
    } catch (err) {
      console.error("Complete error:", err);
      alert("Failed to complete job: " + (err.response?.data?.error || err.message));
    }
  };

  // ----------------------
  // HELPER FUNCTIONS
  // ----------------------
  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleOpenMap = async (latitude, longitude, customerName, requestId) => {
  console.log("Opening map for:", { latitude, longitude, customerName, requestId });
 
  if (latitude && longitude && latitude !== 0 && longitude !== 0) {
    // If coordinates are already available, show modal immediately
    setSelectedLocation({ latitude, longitude });
    setSelectedCustomer({ name: customerName });
    setShowMapModal(true);
    console.log("Showing map with existing coordinates");
  } else if (requestId) {
    // If no coordinates, fetch from backend
    try {
      console.log("Fetching location for request:", requestId);
      const response = await api.get(`/customer/request/accepted/${requestId}/customer-location`);
      console.log("Backend response:", response.data);
     
      // Check different response formats
      let locationData = null;
     
      if (response.data.location) {
        // Format: { location: { latitude, longitude } }
        locationData = response.data.location;
      } else if (response.data.lat && response.data.lng) {
        // Format: { lat, lng } - from your backend logs
        locationData = {
          latitude: response.data.lat,
          longitude: response.data.lng
        };
      } else if (response.data.latitude && response.data.longitude) {
        // Format: { latitude, longitude }
        locationData = {
          latitude: response.data.latitude,
          longitude: response.data.longitude
        };
      }
     
      if (locationData && locationData.latitude && locationData.longitude) {
        console.log("Location found:", locationData);
        setSelectedLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude
        });
        setSelectedCustomer({ name: customerName });
        setShowMapModal(true);
      } else {
        console.error("Invalid location format:", response.data);
        alert("Customer location not available in correct format. Please ask customer to enable location services.");
      }
    } catch (error) {
      console.error("Error fetching customer location:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(`Failed to load customer location: ${error.response.data.message || "Unknown error"}`);
      } else {
        alert("Failed to load customer location. Please check your connection.");
      }
    }
  } else {
    alert("Location coordinates not available");
  }
};


  // ----------------------
  // RENDER LOADING
  // ----------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 text-gray-800">
     {showMapModal && <MapModal />}
      {/* Sidebar */}
      <div className="lg:w-80 bg-white p-6 shadow-lg border-r border-gray-200 flex flex-col">
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            {profile.profilePhoto ? (
              <img
                src={getImageUrl(profile.profilePhoto)}
                alt="Profile"
                className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white"
                onError={(e) => {
                   console.log("Image failed to load:", profile.profilePhoto);
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Provider')}&background=374151&color=fff&size=128`;
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}
              </div>
            )}
            <div className="absolute -bottom-2 right-2 w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center shadow-md border-4 border-white">
              <Briefcase size={18} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{profile.name || "Service Provider"}</h2>
          <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
            <Briefcase size={14} />
            {profile.service || "No service specified"}
          </p>
          <div className="mt-2 flex items-center justify-center gap-1 text-sm text-gray-600">
            <Award size={14} />
            <span>{profile.experience || 0} {profile.experience === "1" ? "year" : "years"} experience</span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1 text-sm text-gray-600">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span>{profile.rating || 0} rating ({profile.totalRatings || 0} reviews)</span>
          </div>
        </div>

        <nav className="mt-4 space-y-2 flex-1">
          <SidebarItem
            icon={<User size={20} />}
            label="My Profile"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
          <SidebarItem
            icon={<ClipboardList size={20} />}
            label="Pending Requests"
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            badge={pendingRequests.length}
          />
          <SidebarItem
            icon={<CheckCircle size={20} />}
            label="Accepted Requests"
            active={activeTab === "accepted"}
            onClick={() => setActiveTab("accepted")}
            badge={acceptedRequests.length}
          />
          <SidebarItem
            icon={<CheckCircle size={20} />}
            label="Completed Jobs"
            active={activeTab === "completed" && (
  <CompletedTab completedJobs={completedJobs} reviews={reviews} />
)}
            onClick={() => setActiveTab("completed")}
            badge={completedJobs.length}
          />
        </nav>

        <button
          onClick={handleLogout}
          className="mt-8 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6 lg:p-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, <span className="text-gray-700">{profile.name ? profile.name.split(" ")[0] : "Provider"}!</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your services and track customer requests
          </p>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "profile" && (
          <ProfileTab
            profile={profile}
            isEditing={isEditing}
            phone={phone}
            bio={bio}
            skills={skills}
            profilePic={profilePic}
            setPhone={setPhone}
            setBio={setBio}
            setSkills={setSkills}
            setProfilePic={setProfilePic}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            addSkill={addSkill}
            removeSkill={removeSkill}
            handleSaveProfile={handleSaveProfile}
            setIsEditing={setIsEditing}
            handleProfilePicChange={handleProfilePicChange}
          />
        )}

        {activeTab === "pending" && (
          <RequestsTab
            requests={pendingRequests}
            onAccept={handleAcceptRequest}
            onDeny={handleDenyRequest}
            onCall={handleCall}
          />
        )}

        {activeTab === "accepted" && (
          <AcceptedTab
            requests={acceptedRequests}
            onComplete={handleCompleteJob}
            onCall={handleCall}
            onOpenMap={handleOpenMap}
          />
        )}

        {activeTab === "completed" && (
          <CompletedTab completedJobs={completedJobs} />
        )}
      </div>
    </div>
  );
}

/* --------------------
   REUSABLE COMPONENTS
--------------------- */
function SidebarItem({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
        active ? "bg-gray-900 text-white shadow" : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${active ? "bg-white/20" : "bg-gray-100"}`}>
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      {badge !== null && badge !== undefined && (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${active ? "bg-white/20" : "bg-gray-100 text-gray-700"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function InfoField({ label, value, isEditing, onChange, type = "text", disabled = false }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {isEditing && !disabled ? (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors bg-white"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-800">{value || "Not specified"}</p>
        </div>
      )}
    </div>
  );
}

/* --------------------
   PROFILE TAB
--------------------- */
function ProfileTab({
  profile,
  isEditing,
  phone,
  bio,
  skills,
  profilePic,
  setPhone,
  setBio,
  setSkills,
  setProfilePic,
  newSkill,
  setNewSkill,
  addSkill,
  removeSkill,
  handleSaveProfile,
  setIsEditing,
  handleProfilePicChange
}) {
  const API_BASE_URL = "http://localhost:5000/api";
   console.log("===== PROFILE TAB RENDER =====");
   const getProfileImageSrc = () => {
    if (!profilePic) return null;
    
    console.log("getProfileImageSrc received:", profilePic);
    
    if (profilePic.startsWith('http') || profilePic.startsWith('data:')) {
      return profilePic;
    }
    
    // Clean up the path - remove any double slashes at the beginning
    let cleanPath = profilePic.replace(/\\/g, '/').replace(/\/+/g, '/');
    
    // If it starts with //, replace with /
    if (cleanPath.startsWith('//')) {
      cleanPath = '/' + cleanPath.substring(2);
    }
    
    // If it's just a filename without path, add /uploads/
    if (!cleanPath.includes('/')) {
      cleanPath = `/uploads/${cleanPath}`;
    }
    
    // If it doesn't start with /uploads but should
    if (!cleanPath.startsWith('/uploads') && cleanPath.includes('uploads')) {
      const uploadsIndex = cleanPath.indexOf('uploads');
      cleanPath = cleanPath.substring(uploadsIndex - 1);
    }
    
    // Ensure it starts with a single /
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }
    if (!cleanPath.startsWith('/uploads')) {
      cleanPath = '/uploads' + cleanPath;
    }
    const fullUrl = `${API_BASE_URL.replace('/api', '')}${cleanPath}`;
    console.log("getProfileImageSrc constructed URL:", fullUrl);
    
    return fullUrl;
  };
  console.log("profilePic in ProfileTab:", profilePic);
  console.log("profile.profilePhoto in ProfileTab:", profile.profilePhoto);
  console.log("profile.name:", profile.name);
  console.log("==============================");
  const formatAddress = () => {
  const parts = [];
  
  // Add district if it exists
  if (profile.district && profile.district !== "") {
    parts.push(profile.district);
  }
  console.log("ProfileTab - profilePic:", profilePic);
console.log("ProfileTab - profile.name:", profile.name);
  
  // Add municipality with ward
  if (profile.municipality && profile.municipality !== "") {
    if (profile.ward && profile.ward !== "") {
      parts.push(`${profile.municipality}-${profile.ward}`);
    } else {
      parts.push(profile.municipality);
    }
  } else if (profile.ward && profile.ward !== "") {
    parts.push(`Ward ${profile.ward}`);
  }
  
  // Add province if it exists
  if (profile.province && profile.province !== "") {
    parts.push(profile.province);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Address not specified';
};
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg max-w-5xl mx-auto overflow-hidden border border-gray-200"
    >
      {/* Header */}
      <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Professional Profile</h2>
          <p className="text-gray-300 mt-1">Update your professional details</p>
        </div>
        <button
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          {isEditing ? (
            <>
              <Save size={18} />
              Save Changes
            </>
          ) : (
            <>
              <Edit2 size={18} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="p-8 flex flex-col lg:flex-row gap-8">
        {/* Left */}
        <div className="flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Full Name" value={profile.name} isEditing={false} disabled />
            <InfoField label="Email" value={profile.email} isEditing={false} disabled />
            <InfoField 
              label="Phone" 
              value={phone} 
              isEditing={isEditing} 
              onChange={e => setPhone(e.target.value)} 
              type="tel" 
            />
            <InfoField label="Service" value={profile.service} isEditing={false} disabled />
            <InfoField label="Experience" value={`${profile.experience} years`} isEditing={false} disabled />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500 fill-current" />
                  <span className="text-gray-800 font-medium">{profile.rating || 0}</span>
                  <span className="text-gray-600 text-sm">({profile.totalRatings || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Professional Bio</label>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors bg-white"
                placeholder="Describe your professional experience and expertise..."
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 whitespace-pre-line">{bio || "No bio provided"}</p>
              </div>
            )}
          </div>

          {/* Skills */}
          {/* Skills - FIXED with price input */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Professional Skills & Pricing</label>
  {isEditing ? (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newSkill.name}
          onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
          onKeyPress={e => e.key === 'Enter' && addSkill()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          placeholder="Skill name (e.g., pipe repairing)"
        />
        <input
          type="number"
          value={newSkill.price}
          onChange={e => setNewSkill({ ...newSkill, price: e.target.value })}
          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          placeholder="Price"
        />
        <button 
          onClick={addSkill} 
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
      
      {/* Skills Table */}
      {skills.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">Service</th>
                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">Price (NPR)</th>
                <th className="text-right px-4 py-2 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill, i) => (
                <tr key={i} className="border-t border-gray-200">
                  <td className="px-4 py-2 text-sm text-gray-800">
      {typeof skill === 'string' ? skill : skill.name}
    </td>
    <td className="px-4 py-2 text-sm text-gray-800 font-medium">
      {typeof skill === 'object' && skill.price ? `Rs. ${skill.price}` : '—'}
    </td>
    <td className="px-4 py-2 text-right">
      <button 
        onClick={() => removeSkill(skill)}
        className="text-red-600 hover:text-red-800"
      >
        <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  ) : (
    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
      {skills.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Service</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Price (NPR)</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 text-sm text-gray-800">{skill.name}</td>
                  <td className="py-2 text-sm text-gray-800 font-medium">
                    {skill.price ? `Rs. ${skill.price}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No skills added yet</p>
      )}
    </div>
  )}
</div>
          {/* Location */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Navigation size={18} />
              Service Location
            </h3>
            <p className="text-gray-800 font-medium">
            {profile.street}, {profile.district}, {profile.municipality}-{profile.ward}

            </p>
            <p className="text-gray-800">{profile.province}</p>

            <p className="text-gray-800">
              Coordinates: {profile.latitude ? profile.latitude.toFixed(4) : "N/A"}, {profile.longitude ? profile.longitude.toFixed(4) : "N/A"}
            </p>
          </div>
        </div>

        {/* Right - Profile Picture */}
       <div className="flex flex-col items-center">
  <div className="relative w-48 h-48 rounded-full bg-gray-200 overflow-hidden shadow-lg border-8 border-white">
    {isEditing ? (
      <label className="cursor-pointer w-full h-full flex items-center justify-center">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleProfilePicChange}
        />
        {profilePic ? (
          <img
            src={getProfileImageSrc()}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log("Failed to load profile image:", profilePic);
              e.target.style.display = 'none';
              // Show fallback
              const parent = e.target.parentElement;
              const fallbackDiv = document.createElement('div');
              fallbackDiv.className = "text-center p-4 w-full h-full flex flex-col items-center justify-center";
              fallbackDiv.innerHTML = `
                <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-600 flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <p class="text-sm font-medium text-gray-700">Click to change photo</p>
                <p class="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
              `;
              parent.appendChild(fallbackDiv);
            }}
          />
        ) : (
          <div className="text-center p-4 w-full h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Click to change photo</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
          </div>
        )}
      </label>
    ) : (
      profilePic ? (
        <img
           src={getProfileImageSrc()} 
          alt="Profile"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log("Failed to load profile image in view mode");
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Provider')}&background=374151&color=fff&size=192`;
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <span className="text-white text-5xl font-bold">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}
          </span>
        </div>
      )
    )}
  </div>
</div>
</div>
    </motion.div>
  );
}

/* --------------------
   REQUESTS TAB
--------------------- */
function RequestsTab({ requests, onAccept, onDeny, onCall }) {
  if (!requests || requests.length === 0) return (
    <div className="text-center py-16 bg-white rounded-xl shadow border border-gray-200">
      <ClipboardList size={32} className="text-gray-600 mx-auto mb-4" />
      <h4 className="text-xl font-semibold text-gray-700">No Pending Requests</h4>
      <p className="text-gray-500 mt-2">You'll see new service requests here</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {requests.map(r => (
        <motion.div
          key={r.requestId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 p-6 flex flex-col md:flex-row justify-between gap-4"
        >
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{r.customerName || "Customer"}</h2>
                <div className="mt-2 space-y-1">
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="font-medium">Service:</span> {r.service || "Not specified"}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="font-medium">Date:</span> {r.requestedDate || "Not specified"}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="font-medium">Distance:</span> {r.distanceKm || "0"} km away
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:w-48">
            <button 
              onClick={() => onAccept(r.requestId)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Accept Request
            </button>
            <button 
              onClick={() => onDeny(r.requestId)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              Deny Request
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* --------------------
   ACCEPTED TAB
--------------------- */
function AcceptedTab({ requests, onComplete, onCall, onOpenMap }) {
  if (!requests || requests.length === 0) return (
    <div className="text-center py-16 bg-white rounded-xl shadow border border-gray-200">
      <CheckCircle size={32} className="text-gray-600 mx-auto mb-4" />
      <h4 className="text-xl font-semibold text-gray-700">No Accepted Requests</h4>
      <p className="text-gray-500 mt-2">Accepted requests will appear here</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {requests.map(r => (
        <div key={r.requestId} className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{r.customerName || "Customer"}</h2>
            <div className="mt-2 space-y-1">
              <p className="text-gray-600">
                <span className="font-medium">Service:</span> {r.service || "Not specified"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Phone:</span> {r.customerPhone || "Not provided"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Address:</span> {r.address || "Not specified"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Municipality:</span> {r.municipality || "Not specified"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Ward:</span> {r.ward || "Not specified"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Distance:</span> {r.distanceKm || "0"} km away
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Requested:</span> {r.requestedDate || "Not specified"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:w-48">
            {r.customerPhone && (
              <button 
                onClick={() => onCall(r.customerPhone)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FaPhone /> Call Customer
              </button>
            )}
            <button 
              onClick={() => {
                console.log("Request data:", r);
                onOpenMap(r.latitude, r.longitude, r.customerName, r.requestId);
              }}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <MapPin size={16} /> View on Map
            </button>
            <button 
              onClick={() => onComplete(r.requestId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Mark as Completed
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------
   COMPLETED TAB
--------------------- */
function CompletedTab({ completedJobs ,reviews}) {
  const allItems = [...completedJobs];
  if (reviews && reviews.length > 0) {
    reviews.forEach(review => {
      // Check if this review is already attached to a job
      const isAttached = completedJobs.some(job => 
        job.review === review.review && job.rating === review.rating
      );
      
      if (!isAttached) {
        allItems.push({
          _id: review._id,
          customer: { fullName: review.customerName || "Customer" },
          service: review.service || "Service",
          completedOn: review.createdAt,
          review: review.review,
          rating: review.rating,
          reviewDate: review.createdAt,
          isReviewOnly: true
        });
      }
    });
  }
  
  if (allItems.length === 0) return (
    <div className="text-center py-16 bg-white rounded-xl shadow border border-gray-200">
      <CheckCircle size={32} className="text-gray-600 mx-auto mb-4" />
      <h4 className="text-xl font-semibold text-gray-700">No Completed Jobs</h4>
      <p className="text-gray-500 mt-2">Completed jobs will appear here</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {allItems.map((job, index) => (
        <div key={job._id || index} 
        initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                {job.customer?.fullName || job.customerName ||"Customer"}
              </h4>
               <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Completed
                </span>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium mt-1">
                {job.service || "Service"}
              </span>
              <p className="text-gray-600 mt-2">
                <span className="font-medium">Completed on:</span>{" "}
                {new Date(job.updatedAt || job.createdAt).toLocaleDateString()}
              </p>
              {job.review ? (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={18} className="text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900">Customer Review</span>
                  </div>
                  <p className="text-gray-700 italic">"{job.review}"</p>
                  <div className="flex items-center gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < (job.rating || 0) ? "text-yellow-500 fill-current" : "text-gray-300"} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2 font-medium">
                      {job.rating || 0}/5
                    </span>
                  </div>
                  {job.reviewDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reviewed on: {new Date(job.reviewDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-gray-400" />
                    <p className="text-gray-500 text-sm">No review provided yet</p>
                  </div>
                </div>
                
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}