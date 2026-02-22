import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();

  // Helper function to navigate and scroll to top
  const goToPage = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-linear-to-br from-[#4e7090] to-[#85a8d1] text-[#fefffc] overflow-hidden">
      {/* Soft Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.05),transparent_70%)] backdrop-blur-sm"></div>

      {/* Main Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative max-w-6xl mx-auto px-6 py-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-8"
      >
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-linear-to-r from-[#00F5FF] to-[#FF6EC7] animate-text-glow-soft">
            Pro-Connect
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            Connecting professionals and clients with trust and convenience.
          </p>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <FaPhone className="text-[#00F5FF] rotate-90" />
              <a href="tel:+97798XXXXXXXX" className="hover:text-[#00F5FF] transition-colors duration-200">
                +977 98XXXXXXXX
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-[#00F5FF]" />
              <a href="mailto:proconnect79info@gmail.com" className="hover:text-[#00F5FF] transition-colors duration-200">
                proconnect79info@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-[#00F5FF]" />
              <a
                href="https://www.google.com/maps?q=Kathmandu,Nepal"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00F5FF] transition-colors duration-200"
              >
                Kathmandu, Nepal
              </a>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Support</h3>
          <ul className="space-y-2 text-gray-300 text-base">
            <motion.li
              whileHover={{ x: 3 }}
              className="cursor-pointer hover:text-[#00F5FF] transition-all duration-200"
              onClick={() => goToPage("/faq")}
            >
              FAQs
            </motion.li>
            <motion.li
              whileHover={{ x: 3 }}
              className="cursor-pointer hover:text-[#00F5FF] transition-all duration-200"
              onClick={() => goToPage("/legal")}
            >
              Privacy & Terms
            </motion.li>
            <motion.li
              whileHover={{ x: 3 }}
              className="cursor-pointer hover:text-[#00F5FF] transition-all duration-200"
              onClick={() => goToPage("/feedback")}
            >
              Feedback
            </motion.li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Follow Us</h3>
          <div className="flex space-x-3 mb-2">
            {[
              { icon: <FaFacebookF />, color: "hover:bg-blue-500" },
              { icon: <FaInstagram />, color: "hover:bg-pink-500" },
              { icon: <FaTwitter />, color: "hover:bg-sky-500" },
              { icon: <FaLinkedinIn />, color: "hover:bg-blue-600" },
            ].map((s, i) => (
              <motion.a
                key={i}
                whileHover={{ scale: 1.25 }}
                href="#"
                className={`p-2 bg-white/10 rounded-full ${s.color} transition-all duration-200`}
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Updates, offers, and top-rated service providers.
          </p>
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10 mt-4 py-4 text-center text-xs text-gray-300 z-10">
        <p>
          © {new Date().getFullYear()} <span className="font-semibold text-[#00F5FF]">Pro-Connect</span>. All rights reserved.
        </p>
      </div>

      {/* Footer Soft Glow Animation */}
      <style>{`
        @keyframes text-glow-soft {
          0%,100% { text-shadow: 0 0 3px #00F5FF, 0 0 6px #FF6EC7; }
          50% { text-shadow: 0 0 6px #00F5FF, 0 0 12px #FF6EC7; }
        }
        .animate-text-glow-soft { animation: text-glow-soft 3s ease-in-out infinite; }
      `}</style>
    </footer>
  );
};

export default Footer;
