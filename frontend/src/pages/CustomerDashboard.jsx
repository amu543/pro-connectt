import axios from "axios";
import { motion } from "framer-motion";
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet/dist/leaflet.css';
import {
  Award,
  Calendar,
  CheckCircle,
  ClipboardList,
  Compass,
  Edit2,
  LogOut,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Save,
  Star,
  User, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaBriefcase, FaCheckCircle, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useNavigate, useParams } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});


// Services images
import babysitter from "../assets/services/babysitter.jpeg";
import bandbaja from "../assets/services/bandbaja.jpeg";
import carpenter from "../assets/services/carpenter.jpeg";
import chef from "../assets/services/chef.jpeg";
import cleaner from "../assets/services/cleaner.jpeg";
import electrician from "../assets/services/electrician.jpeg";
import decorator from "../assets/services/event-decorators.jpeg";
import laundry from "../assets/services/laundry.jpeg";
import locksmith from "../assets/services/locksmith.jpeg";
import movers from "../assets/services/movers.jpeg";
import painter from "../assets/services/painter.jpeg";
import photographer from "../assets/services/photographer.jpeg";
import plumber from "../assets/services/plumber.jpeg";
import sofacarpet from "../assets/services/sofa-carpet.jpeg";
import tutor from "../assets/services/tutor.jpeg";
import waterproofing from "../assets/services/waterproofing.jpeg";


// Services list
const SERVICES = [
  { id: 1, title: "Plumber", img: plumber },
  { id: 2, title: "Electrician", img: electrician },
  { id: 3, title: "Home Tutors", img: tutor },
  { id: 4, title: "Painter", img: painter },
  { id: 5, title: "House Help", img: cleaner },
  { id: 6, title: "Babysitters", img: babysitter },
  { id: 7, title: "Sofa/Carpet Cleaner", img: sofacarpet },
  { id: 8, title: "Event Decorators", img: decorator },
  { id: 9, title: "Carpenter", img: carpenter },
  { id: 10, title: "Photographer", img: photographer },
  { id: 11, title: "Band Baja", img: bandbaja },
  { id: 12, title: "Private Chef", img: chef },
  { id: 13, title: "Locksmith", img: locksmith },
  { id: 14, title: "Laundry", img: laundry },
  { id: 15, title: "Movers & Packers", img: movers },
  { id: 16, title: "Waterproofing", img: waterproofing },
];

const API_BASE_URL = "http://localhost:5000/api";
const SERVICE_NAME_MAPPING = {
  'home-tutors': 'Home Tutors',
  'home tutors': 'Home Tutors',
  'hometutors': 'Home Tutors',
  'plumber': 'Plumber',
  'electrician': 'Electrician',
  'painter': 'Painter',
  'house-help': 'House Help',
  'house help': 'House Help',
  'babysitters': 'Babysitters',
  'sofa-carpet-cleaner': 'Sofa/Carpet Cleaner',
  'sofa/carpet cleaner': 'Sofa/Carpet Cleaner',
  'event-decorators': 'Event Decorators',
  'event decorators': 'Event Decorators',
  'carpenter': 'Carpenter',
  'photographer': 'Photographer',
  'band-baja': 'Band Baja',
  'band baja': 'Band Baja',
  'private-chef': 'Private Chef',
  'private chef': 'Private Chef',
  'locksmith': 'Locksmith',
  'laundry': 'Laundry',
  'movers-packers': 'Movers & Packers',
  'movers & packers': 'Movers & Packers',
  'waterproofing': 'Waterproofing'
};
// API Service functions
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const customerService = {
  // customer.js routes
  getProfile: async () => {
    const response = await api.get("/customer/me");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/customer/edit-profile", data);
    return response.data;
  },

  // request routes (mounted under /customer/request)
  getRequests: async (customerId) => {
    const response = await api.get(`/customer/request/my-requests/${customerId}`);
    return response.data;
  },
    getCompletedRequests: async (customerId) => {
    const response = await api.get(`/customer/request/completed-requests/${customerId}`);
     console.log("Completed requests response:", response.data);
    return response.data;
  },
  

  sendRequest: async (providerId, serviceType) => {
    const response = await api.post("/customer/request/send-request", {
      providerId,
      serviceType
    });
    return response.data;
  },

updateLocation: async (latitude, longitude) => {
  const res = await api.post("/customer/location/update", {
    latitude,
    longitude,
  });
  return res.data;
},

  selectService: async (serviceType) => {
    const response = await api.post("/customer/request/select-service", {
      serviceType
    });
    return response.data;
  },

  completeRequest: async (requestId) => {
    const token = localStorage.getItem("token");
  console.log("Token in completeRequest:", token ? "Present" : "MISSING");
  
  if (!token) {
    throw new Error("No authentication token found");
  }
    const response = await api.post(`/customer/request/complete/${requestId}`);
    return response.data;
  },

  getNotifications: async (customerId) => {
    const response = await api.get(`/customer/request/notifications/${customerId}`);
    return response.data;
  },

  // Try the request providers route first, fallback to customerDashboard providers if needed
  getProvidersByService: async (service, customerId) => {
    const exactServiceName = SERVICE_NAME_MAPPING[service.toLowerCase()] || service;
  console.log("Mapped service name for DB query:", exactServiceName);
    try {
       const formattedService = service.toLowerCase().replace(/\s+/g, "-");
    console.log("URL formatted service:", formattedService);
    console.log("Attempting primary route:", `/customer/request/providers/${formattedService}`);
      const response = await api.get(`/customer/request/providers/${formattedService}`, {
        params: { customerId, 
          exactService: exactServiceName, // Send exact service name for better matching
         }
      });
      
    console.log("✅ Primary route response FULL:", response.data);
    console.log("Response type:", typeof response.data);
    console.log("Response keys:", Object.keys(response.data));
    console.log("Providers array:", response.data.providers);
    console.log("Providers count:", response.data.providers?.length);

      return response.data;
    } catch (err) {
      console.log("Primary route failed:", err.response?.status, err.message);
      // fallback to customerDashboard providers route (mounted at /customer/customerDashboard)
      if (err?.response?.status === 404 || err?.response?.status === 400) {
        const fallback = await api.get(`/customer/customerDashboard/providers/${formattedService}`, {
          params: { customerId , exactService: exactServiceName }
        });
        console.log("Fallback route response:", fallback.data);
        return fallback.data;
      }
      throw err;
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/customer/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
      return response.data;
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
      return { success: true };
    }
  }
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { category } = useParams();
  const [activeTab, setActiveTab] = useState("services");
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [wardNo, setWardNo] = useState("");
  const [profile, setProfile] = useState({});
  const [requests, setRequests] = useState([]);
  const [completedServices, setCompletedServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialFetchDone, setInitialFetchDone] = useState(false); 
  const [activeService, setActiveService] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [locationUpdateInterval, setLocationUpdateInterval] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [providerLocation, setProviderLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  // Add this inside CustomerDashboard component (around line 900)
const getFullImageUrl = (photoPath) => {
  if (!photoPath) return null;
  if (photoPath.startsWith('http') || photoPath.startsWith('data:')) return photoPath;
  
  let cleanPath = photoPath.replace(/\\/g, '/').replace(/\/+/g, '/');
  
  if (cleanPath.startsWith('/uploads')) {
    return `http://localhost:5000${cleanPath}`;
  }
  
  if (cleanPath.includes('uploads')) {
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }
    return `http://localhost:5000${cleanPath}`;
  }
  
  return `http://localhost:5000/uploads/${cleanPath}`;
};
  // Routing Control Component
  const RoutingControl = ({ start, end }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !start || !end) return;
    
    // Clear existing routing controls
    const existingControl = document.querySelector('.leaflet-routing-container');
    if (existingControl) {
      existingControl.remove();
    }
    
    // Create routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.latitude, start.longitude),
        L.latLng(end.latitude, end.longitude)
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [
          { color: '#2563eb', weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' },
          { color: '#3b82f6', weight: 8, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      createMarker: function() { return null; },
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      collapsible: false,
      formatter: new L.Routing.Formatter({
        units: 'metric',
        unitNames: { meters: 'm', kilometers: 'km' },
        roundingSensitivity: 1
      })
    }).addTo(map);
    
    // Customize route line
    routingControl.on('routesfound', function(e) {
      const routes = e.routes;
      const route = routes[0];
      
      // Remove default route line and add custom one
      const existingLayers = document.querySelectorAll('.leaflet-routing-line');
      existingLayers.forEach(layer => {
        if (layer.parentElement) layer.parentElement.remove();
      });
      
      // Add custom polylines
      const polyline = L.polyline(route.coordinates, {
        color: '#1e40af', weight: 6, opacity: 0.95, lineCap: 'round', lineJoin: 'round'
      }).addTo(map);
      
      const glowPolyline = L.polyline(route.coordinates, {
        color: '#60a5fa', weight: 10, opacity: 0.2, lineCap: 'round', lineJoin: 'round'
      }).addTo(map);
      
      if (window._customRouteLines) {
        window._customRouteLines.forEach(line => map.removeLayer(line));
      }
      window._customRouteLines = [glowPolyline, polyline];
      
      // Create directions panel
      const distance = (route.summary.totalDistance / 1000).toFixed(1);
      const time = Math.round(route.summary.totalTime / 60);
      createDirectionsPanel(route, distance, time);
    });
    
    // Function to create directions panel
    const createDirectionsPanel = (route, distance, time) => {
      const existingPanel = document.querySelector('.directions-panel');
      if (existingPanel) existingPanel.remove();
      
      const panel = document.createElement('div');
      panel.className = 'directions-panel';
      panel.innerHTML = `
        <div class="directions-header">
          <div class="directions-summary">
            <div class="summary-item"><span class="summary-icon">📏</span><span class="summary-value">${distance} km</span></div>
            <div class="summary-item"><span class="summary-icon">⏱️</span><span class="summary-value">${time} min</span></div>
          </div>
          <button class="directions-close">✕</button>
        </div>
        <div class="directions-list"></div>
      `;
      
      const directionsList = panel.querySelector('.directions-list');
      if (route.instructions && route.instructions.length > 0) {
        route.instructions.forEach((instruction, index) => {
          const instructionDiv = document.createElement('div');
          instructionDiv.className = 'instruction-item';
          let distanceText = '';
          if (instruction.distance) {
            const dist = instruction.distance;
            distanceText = dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(1)} km`;
          }
          instructionDiv.innerHTML = `
            <div class="instruction-marker">${index + 1}</div>
            <div class="instruction-content">
              <div class="instruction-text">${instruction.text || instruction}</div>
              ${distanceText ? `<div class="instruction-distance">${distanceText}</div>` : ''}
            </div>
          `;
          directionsList.appendChild(instructionDiv);
        });
      }
      
      const closeBtn = panel.querySelector('.directions-close');
      closeBtn.addEventListener('click', () => panel.remove());
      document.body.appendChild(panel);
    };
    
    // Add CSS for directions panel
    const style = document.createElement('style');
    style.textContent = `
      .directions-panel {
        position: fixed; top: 88px; right: 20px; width: 320px;
        max-height: calc(100vh - 120px); background: white; border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 1000;
        display: flex; flex-direction: column; overflow: hidden;
      }
      .directions-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #e5e7eb; }
      .directions-summary { display: flex; gap: 16px; }
      .summary-item { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; }
      .summary-value { font-weight: 600; color: #2563eb; }
      .directions-close { background: none; border: none; font-size: 20px; cursor: pointer; padding: 4px 8px; }
      .directions-list { flex: 1; overflow-y: auto; padding: 12px; max-height: calc(100vh - 180px); }
      .instruction-item { display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid #f3f4f6; }
      .instruction-marker { width: 24px; height: 24px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
      .instruction-text { font-size: 13px; color: #374151; }
      @media (max-width: 768px) {
        .directions-panel { top: auto; bottom: 0; left: 0; width: 100%; max-height: 50vh; border-radius: 12px 12px 0 0; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (routingControl) routingControl.remove();
      if (window._customRouteLines) {
        window._customRouteLines.forEach(line => map.removeLayer(line));
        window._customRouteLines = [];
      }
      const panel = document.querySelector('.directions-panel');
      if (panel) panel.remove();
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, [map, start, end]);
  
  return null;
};
  // Map Modal Component
const MapModal = () => {
  if (!activeService) return null;
  
  const provider = activeService.provider || {};
  const customerPos = customerLocation ? [customerLocation.latitude, customerLocation.longitude] : null;
  const providerPos = providerLocation ? [providerLocation.latitude, providerLocation.longitude] : null;
  
  return (
    <div className="fixed inset-0 z-50 bg-white" onClick={() => setShowMapModal(false)}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-md p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {provider.fullName || "Provider"} - Service Tracking
        </h3>
        <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={24} className="text-gray-600" />
        </button>
      </div>
      
      {/* Status Bar */}
      <div className="absolute top-16 left-0 right-0 z-10 px-4 py-2 bg-white/95 backdrop-blur-sm shadow-sm flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isTrackingActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm">
            {isTrackingActive ? "Live tracking active" : "Waiting for location"}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          Last update: {new Date().toLocaleTimeString()}
        </span>
      </div>
      
      {/* Map */}
      <div className="absolute inset-0 top-[88px]">
        {customerPos && (
          <MapContainer
            key={`${customerPos[0]}-${customerPos[1]}`}
            center={customerPos}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Customer Marker */}
            <Marker position={customerPos}>
              <Popup>
                <div className="p-2">
                  <strong>Your Location</strong><br />
                  📍 You are here
                </div>
              </Popup>
            </Marker>
            
            {/* Provider Marker */}
            {providerPos && (
              <Marker 
                position={providerPos}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #3b82f6;"></div>`,
                  iconSize: [16, 16]
                })}
              >
                <Popup>
                  <div className="p-2">
                    <strong>{provider.fullName || "Provider"}</strong><br />
                    🚗 Moving towards you<br />
                    <small>ETA: Calculating...</small>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Routing Control */}
            {providerPos && customerPos && (
              <RoutingControl start={customerPos} end={providerPos} />
            )}
          </MapContainer>
        )}
      </div>
      
      {/* Info Footer */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
        <div className="bg-black/75 text-white text-xs p-2 rounded-lg inline-block">
          {providerPos ? "✅ Route calculated • Provider is on the way" : "📍 Waiting for provider location"}
        </div>
      </div>
    </div>
  );
};

  // Get customer location
const getCustomerLocation = () => {
  if (!navigator.geolocation) {
    setLocationError("Geolocation is not supported");
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setCustomerLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    (error) => {
      console.error("Geolocation error:", error);
      setLocationError("Unable to get your location");
    }
  );
};

// Start tracking provider location
const startTrackingProvider = (requestId) => {
  setIsTrackingActive(true);
  
  // Initial fetch
  fetchProviderLocation(requestId);
  
  // Set interval to fetch every 5 seconds
  const interval = setInterval(() => {
    fetchProviderLocation(requestId);
  }, 5000);
  
  setLocationUpdateInterval(interval);
};

// Fetch provider location from backend
const fetchProviderLocation = async (requestId) => {
  try {
    const response = await api.get(`/customer/request/${requestId}/provider-location`);
    if (response.data && response.data.latitude && response.data.longitude) {
      setProviderLocation({
        latitude: response.data.latitude,
        longitude: response.data.longitude
      });
    }
  } catch (error) {
    console.error("Error fetching provider location:", error);
  }
};

// Stop tracking
const stopTrackingProvider = () => {
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval);
    setLocationUpdateInterval(null);
  }
  setIsTrackingActive(false);
  setProviderLocation(null);
};

// Update the active service when accepted requests change
useEffect(() => {
  // Find accepted requests (status = "accepted")
  const acceptedRequestsList = requests.filter(r => r.status === "accepted");
  
  if (acceptedRequestsList.length > 0) {
    // Get the most recent accepted request
    const latestAccepted = acceptedRequestsList[0];
    setActiveService(latestAccepted);
    
    // Start tracking provider location
    startTrackingProvider(latestAccepted._id);
    
    // Get customer location
    getCustomerLocation();
  } else {
    // No active service, stop tracking
    stopTrackingProvider();
    setActiveService(null);
  }
  
  // Cleanup on unmount
  return () => {
    stopTrackingProvider();
  };
}, [requests]);

  // Updated selectedCategory when URL changes
  useEffect(() => {
    if (category) {
      const decodedCategory = decodeURIComponent(category).replace(/-/g, " ");
      setSelectedCategory(decodedCategory);
    }
  }, [category]);

  // fetchRequests - matches /customer/request/my-requests/:customerId
  const fetchRequests = async () => {
    try {
      if (!profile._id) return;
      // Get active requests (pending & accepted)
    const activeData = await customerService.getRequests(profile._id);
    setRequests(activeData);
    
    // Get completed requests separately
    const completedData = await customerService.getCompletedRequests(profile._id);
     // ADD THIS DETAILED LOGGING
    console.log("===== COMPLETED SERVICES DATA =====");
    console.log("Raw completed data:", completedData);
    completedData.forEach((service, index) => {
      console.log(`Service ${index}:`, {
        id: service._id,
        service: service.service,
        provider: service.provider,
        providerId: service.provider?._id,
        providerName: service.provider?.fullName,
        providerRating: service.provider?.avgRating,
        providerRatingAlt: service.provider?.rating,
        providerTotalRatings: service.provider?.totalRatings,
         providerReviews: service.provider?.reviews?.length,
        providerPhoto: service.provider?.profilePhoto,
        hasProviderPhoto: !!service.provider?.profilePhoto,
        review: service.review
      });
    });
    console.log("===================================");
    setCompletedServices(completedData);
      
      setError("");
    } catch (err) {
      console.error("Error fetching requests:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
      setError("Failed to load requests");
    } 
  };

  // fetchProviders 
  const fetchProviders = async (service) => {
    console.log("fetchProviders called with service:", service);
  console.log("Service type:", typeof service);
  console.log("Service length:", service?.length);
    try {
      if (!service) {
        setProviders([]);
        return;
      }
      
      // Notify backend of selected service (optional)
      try {
        await customerService.selectService(service);
      } catch (e) {
        console.log("Service notification optional:", e.message);
      }
      
      // Get providers for this service
      const data = await customerService.getProvidersByService(service, profile._id);
      // backend may return { providers: [...] } or an array directly
      let list = data.providers || data;
      if (list && Array.isArray(list) && list.length > 0) {
      list = [...list].sort((a, b) => {
        // 1st PRIORITY: Rating (higher rating first)
        const aRating = a.avgRating || a.rating || 0;
        const bRating = b.avgRating || b.rating || 0;
        
        if (aRating !== bRating) {
          return bRating - aRating; // Higher rating comes first
        }
        
        // 2nd PRIORITY: Online status (online providers come first)
        const aOnline = a.isOnline === true;
        const bOnline = b.isOnline === true;
        
        if (aOnline !== bOnline) {
          return aOnline ? -1 : 1; // Online providers come first
        }
        
        // 3rd PRIORITY: Distance (closest first)
        let aDistance = Infinity;
        let bDistance = Infinity;
        
        if (a.distanceInKm !== undefined && a.distanceInKm !== null) {
          aDistance = typeof a.distanceInKm === 'string' ? parseFloat(a.distanceInKm) : a.distanceInKm;
        }
        
        if (b.distanceInKm !== undefined && b.distanceInKm !== null) {
          bDistance = typeof b.distanceInKm === 'string' ? parseFloat(b.distanceInKm) : b.distanceInKm;
        }
        
        // If both distances are valid numbers, sort by distance
        if (!isNaN(aDistance) && !isNaN(bDistance)) {
          return aDistance - bDistance; // Closer distance comes first
        }
        
        // Handle cases where one or both distances are invalid
        if (isNaN(aDistance) && !isNaN(bDistance)) return 1; // Invalid distances go to bottom
        if (!isNaN(aDistance) && isNaN(bDistance)) return -1; // Valid distances go to top
        
        return 0; // Keep original order if all else equal
      });
      
      console.log("Sorted providers - Rating first, then Online, then Distance:", 
        list.map(p => ({ 
          name: p.fullName, 
          rating: p.avgRating || p.rating || 0,
          online: p.isOnline, 
          distance: p.distanceInKm 
        })));
    }
      setProviders(list || []);
      setError("");
      
      if (!list || list.length === 0) {
        setError(`No providers found for ${service}`);
      }
    } catch (err) {
      console.error("Error fetching providers:", err);
      setProviders([]);
      if (err.response?.status === 404) {
        setError(`No providers found for ${service}`);
      } else {
        setError(`Error loading providers: ${err.message}`);
      }
    } 
  };

  // handleSendRequest - matches /customer/request/send-request
  const handleSendRequest = async (providerId, providerName) => {
    try {
      if (!selectedCategory || !providerId) {
        alert("Please select service and provider");
        return;
      }
      setLoading(true);
      const result = await customerService.sendRequest(providerId, selectedCategory);
      alert(`Request sent to ${providerName}!`);
      fetchRequests(); // Refresh requests
    } catch (err) {
      console.error("Send request error:", err);
      const msg = err.response?.data?.msg || "Failed to send request";
      alert(msg);
    } 
  };

  // fetchProfile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await customerService.getProfile();
      setProfile(data);
      setPhone(data.phone || "");
       if (data.profilePhoto) {
      setProfilePic(data.profilePhoto);
      console.log("Setting profile photo:", data.profilePhoto);
    } else {
      setProfilePic("");
      console.log("No profile photo found");
    }
      setProvince(data.province || "");
      setDistrict(data.district || "");
      setMunicipality(data.municipality || "");
      setWardNo(data.wardNo || "");
      // Store userId in localStorage for location updates
      if (data._id) {
        localStorage.setItem("userId", data._id);
    
      // store user object in localstorage
      localStorage.setItem("user", JSON.stringify(data));
      console.log("✅ User stored in localStorage from profile fetch:", data.email);
    }

      
      // Update location AFTER profile loads
      if (navigator.geolocation && data._id) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await customerService.updateLocation(
                position.coords.latitude,
                position.coords.longitude
              );
              // Update local profile state with new location
              setProfile(prev => ({
                ...prev,
                location: {
                  type: "Point",
                  coordinates: [position.coords.longitude, position.coords.latitude]
                }
              }));
            } catch (err) {
              console.warn("Location update failed:", err);
            }
          },
          (error) => console.warn("Geolocation error:", error),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    } catch (err) {
      console.error("Profile error:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
      setInitialFetchDone(true);
    }
  };

  // Mark request as completed
  const handleCompleteRequest = async (requestId, providerName) => {
    try {
       const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token ? `Present (length: ${token.length})` : "MISSING");
    
    if (!token) {
      console.error("No token found in localStorage!");
      alert("You are not logged in. Please login again.");
      navigate("/login");
      return;
    }
    
    // Log user info if available
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("Current user:", user.email || user.fullName || user._id);
      } catch (e) {
        console.log("Could not parse user data");
      }
    }
    

      await customerService.completeRequest(requestId);
      alert(`Marked ${providerName}'s request as completed!`);
      // Refresh requests
      fetchRequests();
    } catch (err) {
      console.error("Error completing request:", err);
      alert("Failed to mark as completed");
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      const updateData = {};
      if (phone) updateData.phone = phone;
      if (profilePic && profilePic.startsWith("data:")) {
        updateData.profilePhoto = profilePic;
      }
      
      await customerService.updateProfile(updateData);
      setIsEditing(false);
      alert("Profile updated successfully");
      const updatedProfile = { ...profile, ...updateData };
    localStorage.setItem("user", JSON.stringify(updatedProfile));
       await fetchProfile(); // Refresh profile
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  // Initialize on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
     // Load cached user data immediately for faster display
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        setProfile(userData);
        setPhone(userData.phone || "");
        if (userData.profilePhoto) {
          setProfilePic(userData.profilePhoto);
        }
        setProvince(userData.province || "");
        setDistrict(userData.district || "");
        setMunicipality(userData.municipality || "");
        setWardNo(userData.wardNo || "");
      } catch (e) {
        console.log("Error parsing cached user data");
      }
    }
    fetchProfile();
  }, []);

  // Fetch requests when profile loads
  useEffect(() => {
    if (profile._id) {
      fetchRequests();
    }
  }, [profile]);

  // Update providers when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchProviders(selectedCategory);
    } else {
      setProviders([]);
    }
  }, [selectedCategory]);

  const handleLogout = async () => {
    try {
      await customerService.logout();
    } catch (err) {
      console.log("Logout cleanup:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/home");
    }
  };

  const handleCategoryClick = (service) => {
    console.log("Category clicked:", service);
  console.log("Service title:", service.title);
    const slug = service.title.toLowerCase().replace(/\s+/g, "-");
    console.log("Generated slug:", slug);
    setSelectedCategory(service.title);
    setActiveTab("services");
    navigate(`/customer-dashboard/${slug}`);
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
       setProfile(prev => ({
          ...prev,
          profilePhoto: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  // Remove profile picture
  const handleRemovePhoto = () => {
    setProfilePic("");
    setProfile(prev => ({ ...prev, profilePhoto: "" }));
    const updatedProfile = { ...profile, profilePhoto: "" };
  localStorage.setItem("user", JSON.stringify(updatedProfile));
  };

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "Not set";
    if (phone.startsWith("+977")) {
      return phone.replace('+977', '').replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };
   // Location tracking functions
const startLocationUpdates = (requestId) => {
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval);
  }
  
  // Send location immediately
  sendLocationUpdate(requestId);
  
  // Then send every 10 seconds
  const interval = setInterval(() => {
    sendLocationUpdate(requestId);
  }, 10000);
  
  setLocationUpdateInterval(interval);
  setIsTrackingActive(true);
};
useEffect(() => {
  console.log("✅ completedServices updated:", completedServices);
  console.log("Number of completed services:", completedServices.length);
  completedServices.forEach((service, idx) => {
    console.log(`Service ${idx}:`, {
      id: service._id,
      service: service.service,
      provider: service.provider?.fullName,
      providerId: service.provider?._id
    });
  });
}, [completedServices]);
const sendLocationUpdate = async (requestId) => {
  if (!navigator.geolocation) {
    setLocationError('Geolocation is not supported by your browser');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      setCurrentLocation({ latitude, longitude });
      setLocationError(null);
      
      try {
        // Call your existing updateLocation function from customerService
        await customerService.updateLocation(latitude, longitude);
        
        // Also update the active service location if needed
        if (requestId) {
          await api.post(`/customer/location/update`, {
            latitude,
            longitude,
            requestId
          });
        }
      } catch (error) {
        console.error('Failed to update location:', error);
        setLocationError('Failed to update location. Please check your connection.');
      }
    },
    (error) => {
      console.error('Geolocation error:', error);
      setLocationError(`Location error: ${error.message}. Please enable location services.`);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

const stopLocationUpdates = () => {
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval);
    setLocationUpdateInterval(null);
  }
  setIsTrackingActive(false);
  setCurrentLocation(null);
  setProviderLocation(null);
};


  // Process provider data from API - UPDATED for your schema
  const processProvider = (provider, index) => {
  console.log("Processing provider:", provider); // Debug log to see what we're getting
  
  const fullName = provider.fullName || provider.name || "Unknown Provider";
  const profilePhoto = provider.profilePhoto ? getFullImageUrl(provider.profilePhoto) : null;
  const experience = provider.yearsOfExperience || provider.experience || "N/A";
  const skills = provider.skills || provider.topSkills || [];
  const bio = provider.shortBio || provider.bio || "No bio available";
 let distanceDisplay = "N/A";
  if (provider.distanceInKm !== undefined && provider.distanceInKm !== null) {
    distanceDisplay = `${parseFloat(provider.distanceInKm).toFixed(1)} km`;
  }
  return {
    id: provider._id || provider.id,
    name: fullName,
    profilePhoto: profilePhoto,
    rating: provider.avgRating || provider.rating || 0,
    totalRatings: provider.totalRatings || 0,
    totalServices: provider.servicesDone || provider.totalServices || 0,
    experience: experience,
    distance: distanceDisplay, 
    address: provider.address || "",
    bio: bio,
    phone: provider.phone || "",
    skills: skills,
    online: provider.isOnline || false,
    service: selectedCategory,
     reviews: provider.reviews || [] 
  };
};
const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? "text-yellow-500 fill-current" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };
  const ServiceMapComponent = () => {
  const position = currentLocation ? [currentLocation.latitude, currentLocation.longitude] : null;
  const providerPos = providerLocation ? [providerLocation.latitude, providerLocation.longitude] : null;
  
  const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, 15);
      }
    }, [center, map]);
    return null;
  };
  
  if (!position) {
    return (
      <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Waiting for location...</p>
          <p className="text-gray-400 text-sm mt-2">Please enable location services</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <ChangeView center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Customer Marker */}
        <Marker position={position}>
          <Popup>
            <div className="p-2">
              <strong className="text-gray-900">Your Location</strong><br />
              📍 Service in progress<br />
              <small className="text-gray-600">
                You are here
              </small>
            </div>
          </Popup>
        </Marker>
        
        {/* Provider Marker - if location available */}
        {providerPos && (
          <Marker 
            position={providerPos}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: '<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>',
              iconSize: [12, 12],
              popupAnchor: [0, -6]
            })}
          >
            <Popup>
              <div className="p-2">
                <strong className="text-gray-900">Provider Location</strong><br />
                🚗 {activeService?.provider?.fullName || 'Provider'} is here<br />
                <small className="text-gray-600">
                  Moving towards you
                </small>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div className="lg:w-80 bg-white p-6 shadow-lg border-r border-gray-200 flex flex-col">
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
             {/* Profile Photo - Show loading spinner while fetching */}
      {loading  ? (
        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
            {profilePic ?(
              <img
              key={profilePic}
               src={profilePic}
                alt={profile.fullName || "Profile"}
                className="w-full h-full rounded-full object-cover shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
            const initials = getInitials(profile.fullName || profile.name);
            const div = document.createElement('div');
            div.className = "w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg";
            div.textContent = initials;
            parent.appendChild(div);
              }}
            />
             ) : (
              <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {getInitials(profile.fullName || profile.name)}
                    </div>
                  )}
                  </>
      )}
              <div className="absolute -bottom-2 right-2 w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center shadow-md border-4 border-white">
              <User size={18} className="text-white" />
            </div>
            </div>
          <h2 className="text-2xl font-bold text-gray-800">{profile.fullName || profile.name || "Customer"}</h2>
          <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
            <Mail size={14} />
            {profile.email || "No email"}
          </p>
          <div className="mt-3 flex items-center justify-center gap-1 text-sm text-gray-600">
            <MapPin size={14} />
            <span>
              {profile.location ? 
                `${profile.location.coordinates?.[1]?.toFixed(4) || "N/A"}, ${profile.location.coordinates?.[0]?.toFixed(4) || "N/A"}` : 
                "Location not set"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Phone size={14} className="text-gray-600" />
            <span className="font-medium">{formatPhone(profile.phone)}</span>
          </div>
        </div>

        <nav className="mt-4 space-y-2 flex-1">
          <SidebarItem 
            icon={<User size={20} />} 
            label="Personal Details" 
            active={activeTab === "details"} 
            onClick={() => setActiveTab("details")} 
          />
          <SidebarItem 
            icon={<ClipboardList size={20} />} 
            label="My Requests" 
            active={activeTab === "requests"} 
            onClick={() => setActiveTab("requests")} 
            badge={requests.filter(r => r.status === "pending" || r.status === "accepted").length}
          />
          <SidebarItem 
            icon={<CheckCircle size={20} />} 
            label="Services Taken" 
            active={activeTab === "servicesTaken"} 
            onClick={() => setActiveTab("servicesTaken")} 
            badge={completedServices.length}
          />
          <SidebarItem 
            icon={<ClipboardList size={20} />} 
            label="Browse Services"
            active={activeTab === "services"} 
            onClick={() => setActiveTab("services")} 
            badge={SERVICES.length}
          />
           <SidebarItem 
            icon={<Navigation size={20} />} 
            label="Active Map" 
            active={activeTab === "map"} 
            onClick={() => setActiveTab("map")} 
            badge={activeService ? 1 : 0}
          />

        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4">Welcome back, {profile.fullName?.split(" ")[0] || "Customer"}!</h1>

            {/* PERSONAL DETAILS */}
            {activeTab === "details" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg max-w-5xl mx-auto overflow-hidden border border-gray-200"
              >
                <div className="bg-gray-900 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Personal Information</h2>
                      <p className="text-gray-300 mt-1">Update your profile details</p>
                    </div>
                    <button
                      onClick={isEditing ? handleSaveProfile : () => setIsEditing(!isEditing)}
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
                </div>

                <div className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Details */}
                    <div className="flex-1 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField
                          label="Full Name"
                          value={profile.fullName || profile.name || ""}
                          isEditing={isEditing}
                          type="text"
                          disabled={true}
                        />
                        <InfoField
                          label="Email Address"
                          value={profile.email || ""}
                          isEditing={isEditing}
                          type="email"
                          disabled={true}
                        />
                        <InfoField
                          label="Phone Number"
                          value={phone}
                          isEditing={isEditing}
                          onChange={(e) => setPhone(e.target.value)}
                          type="tel"
                        />
                      </div>

                      {/* Location Section */}
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Navigation size={18} />
                          Location Information
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Address Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Province</p>
                              <p className="text-gray-800 font-medium">{province || "Not specified"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">District</p>
                              <p className="text-gray-800 font-medium">{district || "Not specified"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Municipality</p>
                              <p className="text-gray-800 font-medium">{municipality || "Not specified"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Ward Number</p>
                              <p className="text-gray-800 font-medium">{wardNo || "Not specified"}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">GPS Coordinates</p>
                            <p className="text-gray-800 font-medium">
                              {profile.location?.coordinates ? 
                                `${profile.location.coordinates[1]?.toFixed(6)}, ${profile.location.coordinates[0]?.toFixed(6)}` : 
                                "Not available"}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-4 flex items-center gap-1">
                          <MapPin size={14} />
                          Location automatically fetched from your device
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          This information cannot be edited and is maintained by the system
                        </p>
                      </div>
                    </div>

                    {/* Right: Profile Picture */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-48 h-48 rounded-full bg-gray-100 overflow-hidden shadow-lg border-8 border-white">
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
                            src={profilePic}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                            <div className="text-center p-4">
                              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-600 flex items-center justify-center">
                                <Edit2 size={24} className="text-white" />
                              </div>
                              <p className="text-sm font-medium text-gray-700">Click to upload</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG Max-5MB</p>
                            </div>
                        )}
                          </label>
                        ) : (
                          <>
                          {profilePic ? (
                          <img
                            key={profilePic}
                            src={profilePic}
                            alt={profile.fullName || "Profile"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://via.placeholder.com/192x192/4b5563/ffffff?text=${getInitials(profile.fullName)}`;
                            }}
                          />
                          ) : (
                          <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                          <span className="text-white text-5xl font-bold">
                          {getInitials(profile.fullName || profile.name)}
                          </span>
                          </div>
                            )}
                          </>
                          
                        )}
                      </div>
                      {!isEditing && (
                        <p className="mt-4 text-sm text-gray-500 text-center">
                          Click "Edit Profile" to update your photo
                        </p>
                      )}
                      {isEditing && profilePic && (
                      <button
                        onClick={handleRemovePhoto}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                        Remove Photo
                        </button>
                        )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* MY REQUESTS */}
            {activeTab === "requests" && (
              <div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">My Active Requests</h3>
                  <p className="text-gray-600 mt-2">Track and manage your pending service requests</p>
                </div>
                
                <div className="space-y-4 max-w-5xl mx-auto">
                  {requests.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow border border-gray-200">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <ClipboardList size={32} className="text-gray-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-700">No Active Requests</h4>
                      <p className="text-gray-500 mt-2">You don't have any pending service requests</p>
                    </div>
                  ) : (
                    requests
                      .filter(r => r.status === "pending" || r.status === "accepted")
                      .map((request) => {
                        const open = expandedIds.includes(request._id);
                        const provider = request.provider || {};
                         const providerRating = provider.avgRating || provider.rating || 0;
            const reviewCount = provider.totalRatings || provider.reviews?.length || 0;
                        return (
                          <motion.div
                            key={request._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                          >
                            {/* Compact Header */}
                            <div className="p-5">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                   <div className="relative shrink-0">
                        {/* Provider Profile Photo - Now showing actual photo */}
                        {provider.profilePhoto ? (
                          <img
                            src={getFullImageUrl(provider.profilePhoto)}
                            alt={provider.fullName || provider.name}
                            className="w-16 h-16 rounded-full object-cover shadow-md"
                            onError={(e) => {
                              console.log("Failed to load provider image:", provider.profilePhoto);
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              const fallbackDiv = document.createElement('div');
                              fallbackDiv.className = "w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-lg font-bold";
                              fallbackDiv.textContent = getInitials(provider.fullName || provider.name);
                              parent.appendChild(fallbackDiv);
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-lg font-bold">
                            {getInitials(provider.fullName || provider.name)}
                          </div>
                        )}
                        <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${provider.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h2 className="text-lg font-bold text-gray-900">
                            {provider.fullName || provider.name || "Unknown"}
                          </h2>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            request.status === "accepted" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                          </span>
                          </div>
                        
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {provider.distance ? provider.distance : 
                             provider.distanceInKm ? `${parseFloat(provider.distanceInKm).toFixed(1)} km` : 
                             provider.currentLocation ? "Location available" : "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award size={12} />
                            {provider.yearsOfExperience || "N/A"} years
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle size={12} />
                            {provider.servicesDone || provider.totalServices || 0} services
                          </span>
                        </div>
                        
                                    
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{provider.shortBio || "No bio available"}</p>
                                    
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                      {provider.skillsExpertise?.slice(0, 3).map((skill, i) => (
                                        <span
                                          key={i}
                                          className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs border border-gray-200"
                                        >
                                         {typeof skill === 'object' ? skill.name || JSON.stringify(skill) : skill}
                                        </span>
                                      ))}
                                      {provider.skillsExpertise?.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs border border-gray-200">
                                          +{provider.skillsExpertise.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 shrink-0 ml-4">
                                  {provider.phone && (
                                    <a
                                      href={`tel:${provider.phone}`}
                                      className="gap-1.5 px-4 py-2 bg-linear-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-colors"
                                    >
                                      <FaPhone size={14} className="text-white text-base rotate-90" />
                                      <span>Call</span>
                                    </a>
                                  )}
                                  {request.status === "accepted" && (
                                    <button
                                      onClick={() => handleCompleteRequest(request._id, provider.fullName)}
                                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium border border-gray-300"
                                    >
                                      <FaCheckCircle size={12} />
                                      <span>Complete</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Expand Button */}
                              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                <button
                                  onClick={() => toggleExpand(request._id)}
                                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                  {open ? 'Show Less Details' : 'Show More Details'}
                                  <span className="text-xs">{open ? '▲' : '▼'}</span>
                                </button>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {open && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="border-t border-gray-100 bg-gray-50"
                              >
                                <div className="p-5">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Contact Info */}
                                    <div className="space-y-3">
                                      <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm">
                                        <Phone size={14} />
                                        Contact Information
                                      </h4>
                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-xs text-gray-500">Phone</p>
                                          <p className="font-medium text-gray-900">{provider.phone || "Not available"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Service</p>
                                          <p className="text-gray-700">{request.service || "N/A"}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Service Stats */}
                                    <div className="space-y-3">
                                      <h4 className="font-medium text-gray-700 flex items-center gap-2 text-sm">
                                        <Award size={14} />
                                        Service Details
                                      </h4>
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600 text-sm">Request Date:</span>
                                          <span className="font-medium">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Full Skills List */}
                                  {provider["Skills / Expertise"]?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <h4 className="font-medium text-gray-700 mb-2 text-sm">All Skills</h4>
                                      <div className="flex flex-wrap gap-2">
                                      {provider.skillsExpertise.map((skill, i) => (
                                          <span
                                            key={i}
                                            className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-xs font-medium border border-gray-300"
                                          >
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            {/* SERVICES TAKEN */}
            {activeTab === "servicesTaken" && (
              <div className="max-w-5xl mx-auto">
                <div className="bg-gray-900 text-white p-8 rounded-xl shadow-lg mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Service History</h2>
                      <p className="text-gray-300 mt-2">Your completed service requests</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{completedServices.length}</div>
                      <div className="text-gray-300">Services Completed</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {completedServices.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle size={24} className="text-gray-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-700">No Completed Services</h4>
                      <p className="text-gray-500 mt-2">You haven't completed any services yet</p>
                    </div>
                  ) : (
                    completedServices.map((service) => (
                      <ServiceReviewCard key={service._id} service={service}  getFullImageUrl={getFullImageUrl}  // Pass the function
            getInitials={getInitials}   />
                    ))
                  )}
                </div>
              </div>
            )}
            
              {/* ACTIVE SERVICE MAP */}
                {activeTab === "map" && (
                  <div>
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900">Active Service Tracking</h3>
                      <p className="text-gray-600 mt-2">Track your service provider in real-time</p>
                    </div>
                    
                    {activeService ? (
                      <div className="space-y-6">
                        {/* Service Info Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{activeService.service}</h4>
                              <p className="text-gray-600 mt-1">
                                Provider: {activeService.provider?.fullName || 'Provider Name'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  activeService.status === "accepted" ? "bg-green-100 text-green-800" :
                                  activeService.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {activeService.status?.charAt(0).toUpperCase() + activeService.status?.slice(1)}
                                </span>
                                {activeService.provider?.distance && (
                                  <span className="flex items-center gap-1 text-sm text-gray-500">
                                    <MapPin size={14} />
                                    {activeService.provider.distance} away
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-3">
                              {activeService.provider?.phone && (
                                <a
                                  href={`tel:${activeService.provider.phone}`}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                  <Phone size={16} />
                                  Call Provider
                                </a>
                              )}
                              {activeService.status === "accepted" && (
                                <button
                                  onClick={() => handleCompleteRequest(activeService._id, activeService.provider?.fullName)}
                                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                  <CheckCircle size={16} />
                                  Complete Service
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Location Status */}
                        <div className={`p-4 rounded-lg ${locationError ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isTrackingActive && !locationError ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <p className="text-sm font-medium">
                              {locationError ? locationError : 
                              isTrackingActive ? "📍 Sharing your location with the provider" : 
                              "Location sharing is not active"}
                            </p>
                          </div>
                          {currentLocation && !locationError && (
                            <p className="text-xs text-gray-600 mt-2">
                              Last update: {new Date().toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        
                        {/* Map */}
                        <ServiceMapComponent />
                        
                        {/* Instructions */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Compass size={16} />
                            Service Instructions
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                            <li>Your location is being shared with the service provider for accurate arrival</li>
                            <li>Provider can see your real-time location while the service is active</li>
                            <li>You can call the provider using the button above</li>
                            <li>Click "Complete Service" when the work is finished</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <NoActiveServiceMap />
                    )}
                  </div>
                )}
              {showMapModal && <MapModal />}

            {/* BROWSE SERVICES */}
            {activeTab === "services" && (
                <>
                  {!selectedCategory ? (
                    <div className="mb-8">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Browse Services
                      </h1>
                      <p className="text-gray-600 mb-6">
                        Choose a service to find professionals
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px mt-4">
                        {SERVICES.map(service => (
                          <motion.div 
                            key={service.id} 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }}
                            className="relative aspect-4/3 overflow-hidden cursor-pointer group"
                            onClick={() => handleCategoryClick(service)}
                          >
                            {/* Background Image - Clear by default, blur on hover */}
                            <img 
                              src={service.img} 
                              alt={service.title} 
                              className="w-full h-full object-cover group-hover:blur transition-all duration-300" 
                            />
                            
                            {/* Dark Overlay - Appears on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300"></div>
                            
                            {/* Service Name - Clear text on hover */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <h3 className="text-lg font-bold text-white text-center px-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                {service.title}
                              </h3>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (

                  <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
                    {/* Header with Back Button */}
                    <div className="max-w-6xl mx-auto mb-6">
                      <div className="mb-6">
                        <button 
                          onClick={() => {
                            setSelectedCategory("");
                            navigate("/customer-dashboard");
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mb-4"
                        >
                          ← Back to Services
                        </button>
                        
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                          {selectedCategory} Services Available
                        </h1>
                        {error && (
                          <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-lg">
                            {error}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Providers List */}
                    <div className="max-w-6xl mx-auto">
                      {providers.length === 0 && !error ? (
                        <div className="text-center py-20">
                          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Loading Providers...</h3>
                          <p className="text-gray-600">Finding the best {selectedCategory} near you</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {providers.map((provider, index) => {
                            const open = expandedIds.includes(provider._id || provider.id);
                            const processedProvider = processProvider(provider, index);
                            
                            return (
                              <motion.div
                                key={processedProvider.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
                              >
                                {/* Main Card Content */}
                                <div className="p-6 md:p-8">
                                  <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Left: Provider Info */}
                                    <div className="flex-1">
                                      <div className="flex items-start gap-6">
                                        {/* Avatar with Online Status */}
                                        <div className="relative">
                                           {processedProvider.profilePhoto ? (
                                          <img
                                                src={processedProvider.profilePhoto}
                                                alt={processedProvider.name}
                                                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-xl"
                                                onError={(e) => {
                                                  console.log("Failed to load provider image:", processedProvider.profilePhoto);
                                                  e.target.onerror = null;
                                                  e.target.style.display = 'none';
                                                  // Show fallback avatar
                                                  const parent = e.target.parentElement;
                                                  const fallbackDiv = document.createElement('div');
                                                  fallbackDiv.className = "w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl";
                                                  fallbackDiv.textContent = getInitials(processedProvider.name);
                                                  parent.appendChild(fallbackDiv);
                                                }}
                                              />
                                          ) : (
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-linear-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                                            {getInitials(processedProvider.name)}
                                          </div>
                                          )}
                                          {/* Online Status Badge */}
                                          <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full ${processedProvider.online ? 'bg-green-100' : 'bg-gray-100'} border ${processedProvider.online ? 'border-green-200' : 'border-gray-200'}`}>
                                            <div className={`w-2 h-2 rounded-full ${processedProvider.online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                            <span className={`text-xs font-semibold ${processedProvider.online ? 'text-green-700' : 'text-gray-600'}`}>
                                              {processedProvider.online ? 'Online' : 'Offline'}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Basic Info */}
                                        <div className="flex-1">
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                            <div>
                                              <h2 className="text-2xl font-bold text-gray-900">{processedProvider.name}</h2>
                                              <div className="flex items-center gap-2 mt-1">
                                                <FaMapMarkerAlt className="text-red-500 text-sm" />
                                                <span className="text-gray-600 text-sm">{processedProvider.distance} away • {processedProvider.address}</span>
                                              </div>
                                            </div>
                                          </div>
                                          {/* NEW: Rating stars display */}
                                          <div className="flex flex-wrap items-center gap-4 mb-4">
                                            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl">
                                              {renderStars(processedProvider.rating)}
                                              <div>
                                                <div className="font-bold text-gray-900">{processedProvider.rating}</div>
                                                <div className="text-xs text-gray-500">Rating ({processedProvider.totalRatings} reviews)</div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                                              <FaBriefcase className="text-gray-600" />
                                              <div>
                                                <div className="font-bold text-gray-900">{processedProvider.experience}</div>
                                                <div className="text-xs text-gray-500">Experience</div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                                              <div>
                                                <div className="font-bold text-gray-900">{processedProvider.totalServices}</div>
                                                <div className="text-xs text-gray-500">Services</div>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {/* Bio */}
                                          <p className="text-gray-700 mb-5">{processedProvider.bio}</p>

                                          {/* Skills Preview */}
                                          <div className="flex flex-wrap gap-2">
                                            {processedProvider.skills.slice(0, 4).map((skill, index) => (
                                              <span
                                                key={index}
                                                className="px-4 py-2 rounded-lg font-semibold bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100"
                                              >
                                                {typeof skill === 'string' ? skill : skill.name || skill}
                                              </span>
                                            ))}
                                            {processedProvider.skills.length > 4 && (
                                              <span className="px-4 py-2 font-semibold text-gray-500">
                                                +{processedProvider.skills.length - 4} more
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right: Action Buttons */}
                                    <div className="lg:w-80 flex flex-col gap-4">
                                      {/* Call Button Section */}
                                      {processedProvider.phone && (
                                        <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl p-3 border border-green-100">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <div className="w-10 h-10 rounded-lg bg-linear-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                                                <FaPhone className="text-white text-base rotate-90" />
                                              </div>
                                              <div>
                                                <p className="text-lg font-bold text-gray-900">
                                                  {formatPhone(processedProvider.phone)}
                                                </p>
                                              </div>
                                            </div>
                                            <a
                                              href={`tel:${processedProvider.phone.replace(/\s+/g, '')}`}
                                              className="flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow hover:shadow-md transform hover:-translate-y-0.5 text-sm"
                                            >
                                              <span>CALL NOW</span>
                                              <FaPhone className="text-sm rotate-90" />
                                            </a>
                                          </div>
                                        </div>
                                      )}

                                      {/* Action Buttons */}
                                      <div className="space-y-3">
                                        <button
                                          onClick={() => handleSendRequest(processedProvider.id, processedProvider.name)}
                                          className="w-full px-6 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                                        >
                                          Send Request
                                        </button>
     
                                        <div className="w-full text-center">
                                          <button
                                            onClick={() => toggleExpand(processedProvider.id)}
                                            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 hover:underline transition-colors text-sm font-medium"
                                          >
                                            <span>{open ? 'Hide Details' : 'View Details'}</span>
                                            {open ? <FaChevronUp size={14} /> : <FaChevronDown size={10} />}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expanded Details */}
                                  {open && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="mt-8 pt-8 border-t border-gray-200"
                                    >
                                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Services & Pricing */}
                                        <div className="lg:col-span-2">
                                          <h3 className="text-xl font-bold text-gray-900 mb-6">Services & Pricing</h3>

                                          <div className="overflow-x-auto">
                                            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                                              <thead className="bg-gray-100">
                                                <tr>
                                                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b">
                                                    Service
                                                  </th>
                                                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 border-b">
                                                    Price(NPR)
                                                  </th>
                                                </tr>
                                              </thead>

                                              <tbody>
                                                {processedProvider.skills.map((skill, index) => (
                                                  <tr
                                                    key={index}
                                                    className="hover:bg-gray-50 transition-colors"
                                                  >
                                                    <td className="px-4 py-3 text-sm text-gray-800 border-b">
                                                      {typeof skill === 'string' ? skill : skill.name || skill}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right border-b">
                                                      {typeof skill === 'object' && skill.price ? skill.price : "—"}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                        </div>
                                          {/* NEW: Customer Reviews Section */}
                                          {processedProvider.reviews && processedProvider.reviews.length > 0 && (
                                            <div className="mt-8">
                                              <h3 className="text-xl font-bold text-gray-900 mb-4">
                                                Customer Reviews ({processedProvider.totalRatings})
                                              </h3>
                                              <div className="space-y-4">
                                                {processedProvider.reviews.map((review, idx) => (
                                                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                          <Star key={i} size={14} className={i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"} />
                                                        ))}
                                                      </div>
                                                      <span className="text-sm font-medium text-gray-700">{review.customerName || "Anonymous"}</span>
                                                      <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    {review.text && (
                                                      <p className="text-gray-700 text-sm italic">"{review.text}"</p>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                              {processedProvider.totalRatings > 2 && (
                                                <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">View all {processedProvider.totalRatings} reviews →</button>
                                              )}
                                            </div>
                                          )}

                                          {processedProvider.totalRatings === 0 && (
                                            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
                                              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                                            </div>
                                          )}

                      
                                    </motion.div>
                                  )}
                                      </div>
                                    </motion.div>
                                  )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Helper Components
function SidebarItem({ icon, label, active, onClick, badge }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${active ? "bg-gray-900 text-white shadow" : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-gray-100'}`}>{icon}</div>
        <span className="font-medium">{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-700'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function ServiceReviewCard({ service, getFullImageUrl, getInitials }) {
  const navigate = useNavigate();
  const provider = service.provider || {};
  const review = service.review; 
   console.log("🎯 ServiceReviewCard received:", {
    serviceId: service._id,
    provider: provider,
    service: service.service,
    hasProvider: !!service.provider,
    hasReview:!!review,
    reviewData: review
  });
   const getImageUrl = (photoPath) => {
    console.log("getImageUrl called with:", photoPath);
    if (!photoPath) return null;
     if (photoPath.startsWith('http') || photoPath.startsWith('data:')) {
    return photoPath;
  }
  
  // Clean up the path - remove any double slashes
  let cleanPath = photoPath.replace(/\\/g, '/').replace(/\/+/g, '/');
  
  // If the path already starts with /uploads, just add base URL
  if (cleanPath.startsWith('/uploads')) {
    return `http://localhost:5000${cleanPath}`;
  }
  
  // If the path contains 'uploads' but doesn't start with it
  if (cleanPath.includes('uploads')) {
    // Make sure it starts with a slash
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }
    return `http://localhost:5000${cleanPath}`;
  }
  
  // If it's just a filename, add /uploads/
  return `http://localhost:5000/uploads/${cleanPath}`;
};
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Provider Info with Profile Picture */}
            <div className="shrink-0">
              {provider.profilePhoto ? (
                <img
                  src={getImageUrl(provider.profilePhoto)}
                  alt={provider.fullName || provider.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = "w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-lg font-bold";
                    fallbackDiv.textContent = getInitials(provider.fullName || provider.name);
                    parent.appendChild(fallbackDiv);
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-lg font-bold">

                {getInitials(provider.fullName || provider.name)}
              </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{provider.fullName || provider.name || "Unknown Provider"}</h3>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {service.service || "Service"}
                </span>
                {review && (
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-current" />
                    <span className="font-semibold text-sm">{review.rating}</span>
                    <span className="text-gray-500 text-xs">({review.text ? 1 : 0} services)</span>
                  </div>
                )}

              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Award size={12} />
                  {provider.yearsOfExperience || provider.experience || "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Completed on {new Date(service.completedAt || service.updatedAt || service.createdAt).toLocaleDateString()}
                </span>
              </div>
                            {/* Show review text if exists */}
              {review && review.text && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-sm italic">"{review.text}"</p>
                </div>
              )}

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5">
                  {(provider.skillsExpertise || provider.skills || []).slice(0, 5).map((skill, i) => {
             // Extract the skill name safely - whether it's a string or an object
                  let skillName = '';
                  if (typeof skill === 'string') {
                    skillName = skill;
                  } else if (typeof skill === 'object' && skill !== null) {
                    // If it's an object, try to get name property or stringify safely
                    skillName = skill.name || JSON.stringify(skill);
                    // Truncate if too long
                    if (skillName.length > 30) {
                      skillName = skillName.substring(0, 30) + '...';
                    }
                  } else {
                    skillName = String(skill);
                  }
                  
                  return (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs border border-gray-200"
                    >
                      {skillName}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() =>{  
            console.log('Provider ID (going to URL):', provider._id);
              console.log('Request ID (in state):', service._id); 
            navigate(`/review/${provider._id}`, {
              state: {
                providerId: provider._id,
                provider: provider.fullName || provider.name,
                service: service.service,
                 requestId: service._id || service.requestId || null,
                date: service.completedAt || service.updatedAt || service.createdAt,
                skills: (provider.skillsExpertise || provider.skills || []).map (skill =>{
               if (typeof skill === 'string') return skill;
                  if (typeof skill === 'object' && skill !== null) {
                    return skill.name || JSON.stringify(skill);
                  }
                  return String(skill);
                })
              },
            })
          }}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium shadow-sm hover:shadow self-start"
        >
          Write Review
        </button>
      </div>
    </motion.div>
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
          <p className="text-gray-800">{value || "Not set"}</p>
        </div>
      )}
    </div>
  );
}

const NoActiveServiceMap = () => (
  <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
      <MapPin size={40} className="text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Service</h3>
    <p className="text-gray-600 mb-6">
      You don't have any active service requests right now.
    </p>
    <button
      onClick={() => setActiveTab("services")}
      className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
    >
      Browse Services
    </button>
  </div>
);

// Helper function for initials
function getInitials(name) {
  if (!name) return "CU";
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}