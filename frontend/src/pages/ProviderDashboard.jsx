import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LogOut,
  User,
  ClipboardList,
  CheckCircle,
  MapPin,
  Edit2,
  Save,
  Phone,
  Navigation,
  Award,
  Star,
  Briefcase,
  Plus,
  X
} from "lucide-react";
import { FaPhone } from "react-icons/fa";

// API Configuration
const API_BASE_URL = "http://localhost:5000/api";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ----------------------
  // API DATA STATES
  // ----------------------
  const [profile, setProfile] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const token = localStorage.getItem("token"); // Auth token
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  // Configure axios with auth header
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

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
      // Fetch profile data from /my-details endpoint
      const profileRes = await api.get("/sp-service-page/my-details");
      const profileData = profileRes.data;
      console.log("Profile data from /my-details:", profileData); 
      
      // Map //
      const mappedProfile = {
        name: profileData.fullName || "",
        email: profileData.email || "", 
        phone: profileData.phone || "", 
        service: profileData.service || "",
        experience: profileData.experience || "0", 
        rating: profileData.rating || 0, 
        totalRatings: profileData.totalRatings || 0,
        bio: profileData.shortBio || "",
        province: profileData.address?.province || "",
        district: profileData.address?.district || "",
        municipality: profileData.address?.municipality || "",
        ward: profileData.address?.ward || "",
        street: profileData.address?.street || "Not specified",
        latitude: profileData.currentLocation?.coordinates?.[1] || 0,
        longitude: profileData.currentLocation?.coordinates?.[0] || 0,
        skills: profileData.skills?.map(skill => skill.name) || [],
        profilePhoto: profileData.profilePhoto || null
      };
      
      setProfile(mappedProfile);
      setPhone(mappedProfile.phone);
      setBio(mappedProfile.bio);
      setSkills(mappedProfile.skills);
      setProfilePic(mappedProfile.profilePhoto);

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
      setCompletedJobs(completedRes.data || []);

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

// ----------------------
// PROFILE HANDLERS - UPDATED FOR /my-details
// ----------------------
const handleSaveProfile = async () => {
  try {
    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("Skills / Expertise", JSON.stringify(skills));
    formData.append("Short Bio", bio);
    if (profilePicFile) {
      formData.append("Profile Photo", profilePicFile);
    }

    // Update profile using the correct endpoint
    const response = await axios.patch(
      `${API_BASE_URL}/service-provider/update-profile`,
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
      
      // Refresh profile data from /my-details
      const profileRes = await api.get("/service-provider/my-details");
      const profileData = profileRes.data;
      
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
        street: profileData.address?.street || profile.street,
        latitude: profileData.currentLocation?.coordinates?.[1] || profile.latitude,
        longitude: profileData.currentLocation?.coordinates?.[0] || profile.longitude,
        skills: profileData.skills?.map(skill => skill.name) || skills,
        profilePhoto: profileData.profilePhoto || profilePic
      };
      
      setProfile(updatedProfile);
    }
  } catch (err) {
    console.error("Profile update failed:", err);
    alert("Failed to update profile: " + (err.response?.data?.error || err.message));
  }
};

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePic(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/service-provider/sp-logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("role");
      navigate("/");
    }
  };

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

  const handleOpenMap = (latitude, longitude) => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, "_blank");
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
      {/* Sidebar */}
      <div className="lg:w-80 bg-white p-6 shadow-lg border-r border-gray-200 flex flex-col">
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            {profile.profilePhoto ? (
              <img
                src={`${API_BASE_URL.replace('/api', '')}${profile.profilePhoto}`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white"
                onError={(e) => {
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
            active={activeTab === "completed"}
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Professional Skills</label>
            {isEditing ? (
              <div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addSkill()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                    placeholder="Add a new skill..."
                  />
                  <button onClick={addSkill} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium border border-gray-300">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-1 text-gray-600 hover:text-gray-800">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium border border-gray-300">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills added yet</p>
                  )}
                </div>
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
                    src={profilePic.startsWith('http') ? profilePic : `${API_BASE_URL.replace('/api', '')}${profilePic}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = `
                        <div class="text-center p-4">
                          <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-600 flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                          <p class="text-sm font-medium text-gray-700">Click to change photo</p>
                          <p class="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-600 flex items-center justify-center">
                      <Edit2 size={24} className="text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Upload Professional Photo</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                )}
              </label>
            ) : (
              <img
                src={profilePic ? (profilePic.startsWith('http') ? profilePic : `${API_BASE_URL.replace('/api', '')}${profilePic}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Provider')}&background=374151&color=fff&size=192`}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Provider')}&background=374151&color=fff&size=192`;
                }}
              />
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
              onClick={() => onOpenMap(r.latitude, r.longitude)}
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
function CompletedTab({ completedJobs }) {
  if (!completedJobs || completedJobs.length === 0) return (
    <div className="text-center py-16 bg-white rounded-xl shadow border border-gray-200">
      <CheckCircle size={32} className="text-gray-600 mx-auto mb-4" />
      <h4 className="text-xl font-semibold text-gray-700">No Completed Jobs</h4>
      <p className="text-gray-500 mt-2">Completed jobs will appear here</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {completedJobs.map((job, index) => (
        <div key={job._id || index} className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                {job.customer?.fullName || "Customer"}
              </h4>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium mt-1">
                {job.service || "Service"}
              </span>
              <p className="text-gray-600 mt-2">
                <span className="font-medium">Completed on:</span>{" "}
                {new Date(job.updatedAt || job.createdAt).toLocaleDateString()}
              </p>
              {job.review && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 italic">"{job.review}"</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < (job.rating || 0) ? "text-yellow-500 fill-current" : "text-gray-300"} 
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">{job.rating || 0}/5</span>
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