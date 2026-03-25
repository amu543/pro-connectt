// Review.jsx — rating endpoints corrected to backend mount /customer/rating
import axios from "axios";
import { useEffect, useState } from "react";
import { FaSpinner, FaStar } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// API Base URL
const API_BASE_URL = "http://localhost:5000/api";

// Configure axios
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

// Rating service functions
const ratingService = {
  // Add a rating & review
  addRating: async (serviceProviderId,  rating, review,requestId) => {
    try {
        
      const requestData = {
         serviceProviderId: serviceProviderId,  // This must match exactly
        rating: rating,
        review: review,
        requestId: requestId
      };
      
      console.log("Sending rating data:", requestData);
        console.log("Provider ID type:", typeof serviceProviderId);
      console.log("Provider ID value:", serviceProviderId);
      console.log("Rating type:", typeof rating);
      console.log("Review length:", review.length);
      
      const response = await api.post("/customer/rating/add", requestData);
      return response.data;
    } catch (error) {
       console.error("========== COMPLETE ERROR RESPONSE ==========");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Response Data:", error.response?.data);  // This is what we need!
    console.error("Response Headers:", error.response?.headers);
    console.error("Request Data Sent:", error.config?.data);
    console.error("============================================");
    throw error;
    }
  },


  // Get all reviews for a service provider
  getReviews: async (serviceProviderId) => {
    try {
         console.log("Fetching reviews for provider:", serviceProviderId);
      // backend route: GET /api/customer/rating/reviews/:serviceProviderId
      const response = await api.get(`/customer/rating/reviews/${serviceProviderId}`);
      console.log("getReviews response:", response.data);
      
      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object with a reviews property
        return response.data.reviews || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching reviews:", error.response?.data || error.message);
      return [];
    }
  },

  // Get average rating for a service provider
  getAverageRating: async (serviceProviderId) => {
    try {
      // backend route: GET /api/customer/rating/average/:serviceProviderId
      const response = await api.get(`/customer/rating/average/${serviceProviderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching average rating:", error);
      return { avgRating: 0, totalRatings: 0 };
    }
  }
};

export default function ReviewPage() {
  const { id } = useParams(); // provider/service id
  const location = useLocation();
  const navigate = useNavigate();

  const { provider, service, date, skills, providerName ,requestId} = location.state || {};
   useEffect(() => {
    console.log("========== REVIEW PAGE DEBUG ==========");
    console.log("URL Params - id:", id);
    console.log("Location state:", location.state);
    console.log("Provider ID from params:", id);
    console.log("Is valid MongoDB ID?", /^[0-9a-fA-F]{24}$/.test(id));
    console.log("Token present:", !!localStorage.getItem("token"));
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("Current user from localStorage:", user);
      console.log("User role:", user.role);  // Add this line
    console.log("========================================");
  }, [id, location.state]);

  /* ------------------ STATES ------------------ */
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);

  /* ------------------ FETCH REVIEWS & PROFILE ------------------ */
  useEffect(() => {
    fetchReviewsAndProfile();
  }, [id]);

  const fetchReviewsAndProfile = async () => {
    try {
      setLoading(true);
      
      // Get customer profile
      const customerData = await api.get("/customer/me");
      setCustomer(customerData.data);

      // Fetch reviews for this provider
      if (id) {
        const reviewsData = await ratingService.getReviews(id);
        setReviews(reviewsData);
         if (Array.isArray(reviewsData)) {
        console.log("Reviews array length:", reviewsData.length);
        setReviews(reviewsData);
      } else {
        console.log("Reviews data is not an array:", reviewsData);
        setReviews([]);
      }

        // Fetch average rating
        const averageData = await ratingService.getAverageRating(id);
        setAverageRating(averageData.avgRating || 0);
        setTotalRatings(averageData.totalRatings || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ SUBMIT REVIEW ------------------ */
  const submitReview = async () => {
    if (!rating) {
      alert("Please select a rating.");
      return;
    }

    if (!reviewText.trim()) {
      alert("Please write a review.");
      return;
    }

    if (!id) {
      alert("Provider information is missing.");
      return;
    }
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  if (!isValidObjectId) {
    console.error("Invalid provider ID format:", id);
    alert("Invalid provider ID format. Please contact support.");
    return;
  }
    try {
      setSubmitting(true);

      // Submit review to backend
      const result = await ratingService.addRating(
        id,
        rating,
        reviewText,
        requestId
      );

      // Update local state
      const newReview = {
        _id: result.rating?._id || Date.now().toString(),
        customerId: {
          _id: customer._id,
          name: customer.fullName || customer.name || "You"
        },
        rating,
        review: reviewText,
        createdAt: new Date().toISOString()
      };

      setReviews([newReview, ...reviews]);
      setTotalRatings(prev => prev + 1);
      
      // Recalculate average
      const newAverage = ((averageRating * totalRatings) + rating) / (totalRatings + 1);
      setAverageRating(newAverage.toFixed(1));

      // Reset form
      setRating(0);
      setReviewText("");
      setHover(0);

      alert("Thank you for your review!");
    } catch (error) {
      console.error("Error submitting review:", error);
     console.error("Error response data:", error.response?.data);
  
  // Show the actual error message from backend
  const errorMsg = error.response?.data?.message || 
                  error.response?.data?.error || 
                  "Failed to submit review. Please try again.";
  
  alert(`Error: ${errorMsg}`);  // This will show the real reason
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get user's name from review
  const getUserName = (review) => {
    if (review.customerId?._id === customer?._id) {
      return "You";
    }
    return review.customerId?.name || "Anonymous";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f6f1] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-gray-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f6f1] p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          
          <h2 className="text-2xl font-semibold text-gray-800">
            Review Service Provider
          </h2>
          <p className="text-gray-500">
            {providerName || provider || "Service Provider"} • {service || "Service"}
          </p>
          {date && (
            <p className="text-sm text-gray-500 mt-1">
              Service Date: {formatDate(date)}
            </p>
          )}
          
          {/* Average Rating Display */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-gray-900">{averageRating || "0.0"}</div>
              <div className="flex flex-col">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={16}
                      className={star <= averageRating ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500">{totalRatings} review{totalRatings !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        </div>

        {/* TWO PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: WRITE REVIEW */}
          <div className="lg:col-span-1 bg-gray-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Write Your Review
            </h3>

            {/* Star Rating */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Select Rating:</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none"
                  >
                    <FaStar
                      size={30}
                      className={`cursor-pointer transition ${
                        (hover || rating) >= star
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {rating === 0 ? "No rating selected" : `${rating} star${rating !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">
                Your Review:
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this provider... What did you like? What could be improved?"
                rows={6}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {reviewText.length}/500 characters
              </div>
            </div>

            {/* Tips */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700">
                💡 Tip: Be specific about your experience. Mention timeliness, professionalism, quality of work, and communication.
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={submitReview}
              disabled={submitting || !rating || !reviewText.trim()}
              className={`w-full py-3 rounded-xl font-medium transition-colors ${
                submitting || !rating || !reviewText.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Submitting...
                </div>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>

          {/* RIGHT: PREVIOUS REVIEWS */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Previous Reviews ({totalRatings})
              </h3>
              {reviews.length > 0 && (
                <button
                  onClick={fetchReviewsAndProfile}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H[...]"/>
                  </svg>
                  Refresh
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FaStar className="text-gray-400 text-2xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Yet</h4>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Be the first to review {providerName || "this provider"} and help others make informed decisions.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-800">
                          {getUserName(review)}
                          {review.customerId?._id === customer?._id && (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                              Your Review
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            size={14}
                            className={
                              star <= review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {review.rating}.0
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {review.review}
                    </p>
                    
                    {/* If this is the customer's review, show edit option */}
                    {review.customerId?._id === customer?._id && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          This is your review. Reviews cannot be edited once submitted.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Provider Skills (if available) */}
            {skills && skills.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-3">
                  Provider Skills & Expertise
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 8).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 8 && (
                    <span className="px-3 py-1.5 text-gray-500 text-sm">
                      +{skills.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            ⚠️ Note: Reviews are public and help maintain quality standards. Please ensure your review is honest and respectful.
          </p>
        </div>
      </div>
    </div>
  );
}