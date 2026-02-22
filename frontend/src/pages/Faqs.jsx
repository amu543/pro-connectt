import React, { useState } from "react";

/* ------------------- FAQ Item ---------------------- */
const FaqItem = ({ faq, index, isFeatured }) => {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className={`group relative ${isFeatured ? 'bg-gray-50' : 'bg-gray-50'} shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-4 border border-gray-200`}
      style={{ animation: 'fadeInUp 0.4s ease-out forwards', animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex justify-between items-center gap-4"
      >
        <span className={`font-medium ${isFeatured ? 'text-base' : 'text-sm'} text-gray-800 transition-colors duration-200 leading-normal`}>
          {faq.question}
        </span>

        <div className={`shrink-0 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shadow-sm transition-all duration-300 ${open ? 'rotate-180' : ''}`}>
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          open ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="relative pl-3 border-l-2 border-gray-700">
          <div className="absolute -left-1.5 top-0 w-2 h-2 bg-gray-700 rounded-full"></div>
          <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
        </div>
      </div>
    </div>
  );
};

/* ------------------- FAQ Data ---------------------- */
const topFaqs = [
  {
    question: "Is fare included?",
    answer: "No, the fare is not included. This is because we only connect you with professionals—you can pick one based on your needs and budget.",
  },
   {
    question: "How to negotiate the fee?",
    answer: "The platform does not set fees. You can negotiate directly with the provider before booking. If it doesn't suit you, simply move to the next provider.",
  },
  
];

const faqsData = [
  
  {
    question: "How do I register as a customer?",
    answer: "Registering is quick and simple! Click 'Register', fill in your details, and you're ready to connect with top professionals.",
  },
  {
    question: "How can I become a service provider?",
    answer: "Sign up as a provider, complete your profile with your skills and experience, and wait for verification. Once verified, you can start getting job requests.",
  },
  {
    question: "Is there a subscription fee?",
    answer: "Nope! Using Pro-Connect is completely free for both customers and service providers.",
  },
  {
    question: "Can I cancel a service request?",
    answer: "Yes, you can cancel your request anytime before the provider accepts it.",
  },
  {
    question: "How is the provider selected?",
    answer: "Providers are suggested according to your preferences, location, and past ratings, so you can choose the best match for your needs.",
  },
  {
    question: "Will it show nearby customers?",
    answer: "The platform will only show a customer's location if the customer allows it and both parties confirm the job.",
  },
  {
    question: "How long does verification take?",
    answer: "Verification usually takes 24-48 hours. You'll receive an email notification once your account is verified.",
  },
  {
    question: "Can I change my profile details?",
    answer: "Yes, you can update your profile details anytime from the 'My Profile' section in your account.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "Payments are handled directly between you and the service provider. You can discuss payment options during negotiation.",
  },
  {
    question: "How do reviews work?",
    answer: "After a service is completed, both parties can leave reviews and ratings. These help maintain quality and trust on the platform.",
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, we use industry-standard encryption to protect your personal information. We never share your data with third parties without your consent.",
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach our support team through the 'Contact Us' page or email support@proconnect.com. We typically respond within 24 hours.",
  },
 
];

/* ------------------- FAQ Page ---------------------- */
const Faqs = () => {
  return (
    <div className="relative min-h-screen bg-amber-50/20 overflow-hidden py-12">
      {/* Simple background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 -left-10 w-64 h-64 bg-gray-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-5 w-56 h-56 bg-gray-300 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="relative inline-block mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 relative">
              FAQs
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-800 rounded-full"></div>
            </h1>
          </div>
          
          <h2 className="text-base font-normal text-gray-600 mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Featured FAQ Section */}
        <div className="max-w-4xl w-full mx-auto mb-12">
          <div className="grid md:grid-cols-2 gap-4">
            {topFaqs.map((faq, index) => (
              <FaqItem key={index} faq={faq} index={index} isFeatured={true} />
            ))}
          </div>
        </div>

        {/* General FAQs in two columns */}
        <div className="max-w-6xl w-full mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 inline-block relative">
              Common Questions
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-700 rounded-full"></div>
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {faqsData.map((faq, index) => (
              <FaqItem key={index} faq={faq} index={index} isFeatured={false} />
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-3xl mx-auto mt-16 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Still have questions?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Can't find the answer you're looking for? Please reach out to our friendly team.
            </p>
            <button className="px-5 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(15px, -15px) rotate(3deg); }
          66% { transform: translate(-10px, 10px) rotate(-3deg); }
        }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 20s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Faqs;