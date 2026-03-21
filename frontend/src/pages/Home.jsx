import { motion } from "framer-motion";
import { useState } from "react";
import {
  FaBriefcase,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaStar,
  FaTools,
  FaUserPlus,
  FaUsers
} from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

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

// Selected images for the main collage (using your imported images)
const MAIN_COLLAGE_IMAGES = [
  plumber,
  electrician,
  tutor,
  cleaner,
  painter,
  carpenter,
  babysitter,
  decorator
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredService, setHoveredService] = useState(null);
  const navigate = useNavigate();

  const handleCustomerRegister = () => {
    navigate("/register-customer");
  };

  const handleProviderRegister = () => {
    navigate("/register-provider");
  };

  const handleServiceClick = (serviceId) => {
    console.log("Service clicked:", serviceId);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/20">
      {/* HERO SECTION */}
      <section className="relative pt-16 pb-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Text Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full mb-6"
              >
                <FaShieldAlt className="w-4 h-4 text-green-700" />
                <span className="text-sm font-medium text-slate-700">Trusted by Professionals</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-slate-900">
                  Find Trusted
                </span>
                <br />
                <span className="text-blue-700">
                  Local Professionals
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect directly with verified local professionals for all your home and personal needs. 
                Quick, reliable, and hassle-free service at your fingertips.
                <p>New here? Register now to get started as a customer or service provider!</p>
              </p>
              

              {/* CTA Buttons - FIXED */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto lg:mx-0"
              >
                <motion.button
                  variants={itemVariants}
                  onClick={handleCustomerRegister}
                  className="group relative px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold shadow-sm hover:shadow transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-3">
                    <FaUserPlus className="w-5 h-5" />
                    <span>Become a Customer</span>
                    <FaChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </motion.button>
                
                <motion.button
                  variants={itemVariants}
                  onClick={handleProviderRegister}
                  className="group relative px-8 py-4 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold hover:border-blue-500 hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                >
                  <FaBriefcase className="w-5 h-5" />
                  <span>Become a Provider</span>
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">500+</div>
                  <div className="text-sm text-slate-600">Verified Pros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">15+</div>
                  <div className="text-sm text-slate-600">Services</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">4.8★</div>
                  <div className="text-sm text-slate-600">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">98%</div>
                  <div className="text-sm text-slate-600">Satisfaction</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Image Collage */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative w-full h-[500px] lg:h-[600px]"
            >
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-3">
                {/* Large main image - Plumber */}
                <motion.div 
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="col-span-7 row-span-7 rounded-2xl overflow-hidden shadow-md"
                >
                  <img 
                    src={MAIN_COLLAGE_IMAGES[0]}
                    alt="Plumber" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
                
                {/* Top-right - event decorator */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="col-start-8 col-span-5 row-span-3 rounded-xl overflow-hidden shadow-sm"
                >
                  <img 
                    src={MAIN_COLLAGE_IMAGES[7]}
                    alt="event decorator" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
                
                {/* Middle-right - Tutor */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="col-start-8 row-start-4 col-span-5 row-span-4 rounded-xl overflow-hidden shadow-sm"
                >
                  <img 
                    src={MAIN_COLLAGE_IMAGES[2]}
                    alt="Home Tutor" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
                
                {/* Bottom-left - House Help */}
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="col-span-5 row-start-8 row-span-5 rounded-xl overflow-hidden shadow-md"
                >
                  <img 
                    src={MAIN_COLLAGE_IMAGES[3]}
                    alt="House Help" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
                
                {/* Bottom-middle - Painter */}
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="col-start-6 row-start-8 col-span-4 row-span-5 rounded-xl overflow-hidden shadow-sm"
                >
                  <img 
                    src={MAIN_COLLAGE_IMAGES[4]}
                    alt="Painter" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>

                {/* Bottom-right - Carpenter */}
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="col-start-10 row-start-8 col-span-3 row-span-5 rounded-xl overflow-hidden shadow-sm"
                >
                  <img 
                    src={MAIN_COLLAGE_IMAGES[5]}
                    alt="Carpenter" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose Pro-Connect?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experience seamless service booking with our trusted platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FaCheckCircle className="w-8 h-8" />,
                title: "Verified Professionals",
                desc: "Every provider undergoes strict verification for your safety and peace of mind.",
                delay: 0.1
              },
              {
                icon: <FaTools className="w-8 h-8" />,
                title: "All Services in One Place",
                desc: "From plumbing to tutoring, find all services you need in one platform.",
                delay: 0.2
              },
              {
                icon: <FaUsers className="w-8 h-8" />,
                title: "Direct Communication",
                desc: "Chat directly with professionals before booking to discuss your needs.",
                delay: 0.3
              },
              {
                icon: <FaClock className="w-8 h-8" />,
                title: "Quick Response",
                desc: "Get quotes and responses within minutes, save time searching.",
                delay: 0.4
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -5 }}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow transition-all duration-300 border border-slate-100"
              >
                <div className="relative w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-50 transition-colors duration-300">
                  <div className="text-slate-600 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">{feature.title}</h3>
                <p className="text-slate-600 text-center text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-16 px-4 md:px-8 lg:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose from 16+ categories of trusted professional services
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.03 }}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
                className="group cursor-pointer"
                onClick={() => handleServiceClick(service.id)}
              >
                <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow transition-all duration-300 mb-3 bg-white">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={service.img}
                      alt={service.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400";
                      }}
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-slate-800 text-center group-hover:text-blue-700 transition-colors duration-300 line-clamp-2 px-1">
                  {service.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 px-4 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get answers to common questions about Pro-Connect
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { 
                q: "Is Pro-Connect free to use?", 
                a: "Yes! Both customers and providers can register and use the platform for free. There are no hidden charges or subscription fees." 
              },
              { 
                q: "How do I register as a customer?", 
                a: "Simply click 'Become a Customer' above, fill in your details, verify your phone number, and you're ready to book services!" 
              },
              { 
                q: "How do I become a service provider?", 
                a: "Click 'Become a Provider', complete your profile with service details, submit verification documents, and start getting bookings." 
              },
              { 
                q: "Do you include service charges?", 
                a: "No, Pro-Connect doesn't charge any commission. All charges are negotiated directly between you and the service provider." 
              },
              { 
                q: "How do I verify service providers?", 
                a: "We verify all providers through document checks, background verification, and customer reviews before they join our platform." 
              },
              { 
                q: "Can I cancel a booking request?", 
                a: "Yes, you can cancel anytime before the provider accepts your request. After acceptance, cancellation policies apply." 
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow transition-all duration-300 border border-slate-100"
              >
                <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-start gap-3">
                  <span className="text-blue-600 mt-1">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-slate-600 leading-relaxed pl-6">
                  <span className="font-medium text-slate-700">A.</span> {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-4 md:px-8 lg:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Real feedback from customers who trusted our professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
    {
      name: "Bikram Thapa",
      location: "Kathmandu",
      review: "Electrician ko khoj garda Pro-Connect ma 5 min ma bhetiyo. Kaam pani ramro ra price pani reasonable.",
      rating: 5,
      service: "Electrician"
    },
    {
      name: "Sita Adhikari",
      location: "Pokhara",
      review: "Chhora ko lagi tutor khojeko, verified ra experienced teacher paayau. Aba padhai ma dherai sudhar aako cha.",
      rating: 5,
      service: "Home Tutor"
    },
    {
      name: "Ram Chandra Bhatta",
      location: "Butwal",
      review: "Plumber ko lagi 2-3 din lagthyo paila. Pro-Connect ma 1 ghanta ma provider aaipugyo. Kaam pani dherai ramro.",
      rating: 5,
      service: "Plumber"
    }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow transition-all duration-300 border border-slate-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, idx) => (
                    <FaStar key={idx} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed italic">"{testimonial.review}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <FaMapMarkerAlt className="w-3 h-3" />
                      {testimonial.location}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-blue-50 rounded-full">
                    <span className="text-sm font-medium text-blue-700">{testimonial.service}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;