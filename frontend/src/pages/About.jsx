import React from "react";
import { FaUsers, FaLightbulb, FaMapMarkerAlt, FaHandshake } from "react-icons/fa";

const About = () => {
  return (
    <div className="relative min-h-screen bg-amber-50/20">
      {/* Simple background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-gray-200 rounded-full blur-3xl animate-float opacity-30"></div>
        <div className="absolute top-1/3 -right-16 w-64 h-64 bg-gray-300 rounded-full blur-3xl animate-float-delayed opacity-30"></div>
        <div className="absolute -bottom-32 left-1/4 w-72 h-72 bg-gray-200 rounded-full blur-3xl animate-float-slow opacity-30"></div>
      </div>

      <div className="relative z-10 px-4 py-16">
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto mb-20">
          <div className="relative">
            {/* Decorative corner elements */}
            <div className="absolute -top-4 -left-4 w-16 h-16 border-t-2 border-l-2 border-gray-800 rounded-tl-3xl opacity-20"></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b-2 border-r-2 border-gray-800 rounded-br-3xl opacity-20"></div>
            
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
              <div className="text-center space-y-5">
                <div className="inline-block">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 relative">
                    About Pro-Connect
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-800 rounded-full"></div>
                  </h1>
                </div>
                
                <p className="text-base max-w-3xl mx-auto text-gray-700 leading-relaxed">
                  We connect people with trusted local professionals, bridging the gap between demand and skill. Verified profiles, AI-driven recommendations, and smooth interface make services simple, reliable, and inclusive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="max-w-6xl mx-auto mb-20 px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 inline-block relative">
              Our Values
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-800 rounded-full"></div>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { 
                icon: <FaUsers />, 
                title: "Trust", 
                text: "Verified and reliable professionals for confident hiring.",
                bgColor: "bg-gray-50",
                iconBg: "bg-gray-800"
              },
              { 
                icon: <FaLightbulb />, 
                title: "Innovation", 
                text: "Smarter, faster, and more convenient ways to find services.",
                bgColor: "bg-gray-100",
                iconBg: "bg-gray-800"
              },
              { 
                icon: <FaMapMarkerAlt />, 
                title: "Local Focus", 
                text: "Connect with professionals near you efficiently.",
                bgColor: "bg-stone-50",
                iconBg: "bg-black"
              },
              { 
                icon: <FaHandshake />, 
                title: "Professionalism", 
                text: "Quality service and professionalism in every interaction.",
                bgColor: "bg-gray-100",
                iconBg: "bg-gray-800"
              },
            ].map((card, idx) => (
              <div
                key={card.title}
                className="group relative"
                style={{ animation: 'fadeInUp 0.6s ease-out forwards', animationDelay: `${idx * 150}ms`, opacity: 0 }}
              >
                <div className={`relative ${card.bgColor} rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group-hover:scale-105 group-hover:-rotate-1`}>
                  <div className={`w-14 h-14 ${card.iconBg} rounded-xl flex items-center justify-center mb-4 mx-auto shadow-sm group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 relative`}>
                    <div className="absolute inset-0 bg-white/10 rounded-xl animate-ping-slow"></div>
                    <span className="text-white text-xl relative z-10">{card.icon}</span>
                  </div>
                  
                  <h3 className="font-semibold text-base mb-2 text-gray-900 text-center">{card.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-center">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How We Make a Difference */}
        <section className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 inline-block relative">
              How We Make a Difference
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-800 rounded-full"></div>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { 
                title: "Smart Matching", 
                text: "AI-driven recommendations connect users with nearby providers based on preferences and past activity.",
                accentColor: "bg-gray-800"
              },
              { 
                title: "Inclusive Platform", 
                text: "Designed for everyone, including rural users, providing an accessible and user-friendly interface.",
                accentColor: "bg-gray-700"
              },
              { 
                title: "Verified Professionals", 
                text: "Every professional is verified to ensure trust and high-quality service.",
                accentColor: "bg-black"
              },
              { 
                title: "Wide Range of Services", 
                text: "From electricians and plumbers to niche offerings, our platform connects all skilled professionals with clients.",
                accentColor: "bg-gray-800"
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:scale-105"
                style={{ animation: 'fadeInUp 0.6s ease-out forwards', animationDelay: `${idx * 150}ms`, opacity: 0 }}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${item.accentColor} rounded-l-2xl group-hover:w-1.5 transition-all duration-300`}></div>
                
                <div className="relative pl-4">
                  <div className={`absolute -left-2 top-0 w-6 h-6 ${item.accentColor} rounded-lg rotate-45 group-hover:rotate-90 transition-all duration-300 opacity-20`}></div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 relative">
                    {item.title}
                    <div className={`absolute -bottom-1 left-0 h-0.5 ${item.accentColor} rounded-full w-0 group-hover:w-full transition-all duration-300`}></div>
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(20px, -20px) rotate(5deg); }
          66% { transform: translate(-15px, 15px) rotate(-5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-20px, 20px) rotate(-5deg); }
          66% { transform: translate(15px, -15px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -15px) scale(1.05); }
        }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping-slow {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.3); }
          100% { opacity: 0; transform: scale(1); }
        }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 30s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default About;