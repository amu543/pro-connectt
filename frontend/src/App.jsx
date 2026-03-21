import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from "react";
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Loader from "./components/Loader";
import ProtectedRoute from "./routes/ProtectedRoute";
// Pages
import About from "./pages/About";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerRegistration from "./pages/CustomerRegistration";
import Faqs from "./pages/Faqs";
import Home from "./pages/Home";
import Legal from "./pages/Legal";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderRegistration from "./pages/ProviderRegistration";
import ReviewPage from "./pages/Review";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 🔹 Loader FIRST (before Router renders anything)
  if (loading) {
    return <Loader />;
  }
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <Header />

        <main className="grow mt-16">
          <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<Faqs />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/register-customer" element={<CustomerRegistration />} />
      <Route path="/register-provider" element={<ProviderRegistration />} />
      <Route path="/review/:id" element={<ReviewPage />} />
      <Route path="/customer-dashboard" element={<CustomerDashboard />} />
      <Route path="/provider-dashboard" element={<ProviderDashboard />} />

      <Route path="/customer-dashboard/:category?" element={<CustomerDashboard />} />

      {/* Header-only protected route example */}
      <Route
        path="/header-protected"
        element={<ProtectedRoute allowedRole="customer" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
