import React from "react";

const Legal = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-linear-to-b from-[#f5fbff] to-[#e9f6ff] px-4 py-16">
      
      <h1 className="text-4xl md:text-5xl font-bold mb-12 text-[#0b4a6f] text-center">
        Legal Information
      </h1>

      <div className="max-w-3xl w-full space-y-8">
        {/* Privacy Policy */}
        <div className="bg-white/90 border border-[#b7ecff] p-6 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-[#0b4a6f]">
            Privacy Policy
          </h2>
          <ul className="list-disc list-inside space-y-2 text-[#3f6b82]">
            <li>We collect only necessary information: name, email, phone, and optionally location.</li>
            <li>Your data is never sold to third parties.</li>
            <li>Information is shared only with providers with your consent, for service connection purposes.</li>
            <li>We implement reasonable security measures to protect your information.</li>
            <li>You can update or delete your profile anytime.</li>
            <li>Policy updates may occur occasionally, and users will be notified of changes.</li>
          </ul>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white/90 border border-[#b7ecff] p-6 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-[#0b4a6f]">
            Terms & Conditions
          </h2>
          <ul className="list-disc list-inside space-y-2 text-[#3f6b82]">
            <li>Users must provide accurate information and follow platform rules.</li>
            <li>Interactions with service providers and other users must be respectful.</li>
            <li>Pro-Connect connects customers and providers; service quality is not guaranteed.</li>
            <li>Fees are negotiated directly between customer and provider before booking.</li>
            <li>Misuse, fraudulent activity, or harassment may lead to account suspension or termination.</li>
            <li>The platform operates under the laws of Nepal; terms may be updated from time to time.</li>
            <li>Users are responsible for understanding and complying with these terms.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Legal;
