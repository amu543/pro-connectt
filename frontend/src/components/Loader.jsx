import React, { useEffect, useState } from "react";
import Logo from "../assets/logo.png";

const Loader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p < 100 ? p + 1 : 100));
    }, 30); // ~3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black overflow-hidden">

      {/* Rotating yellow rings */}
      {/* <div className="absolute w-[320px] h-80 rounded-full border-2 border-yellow-400/60 animate-spin-slow"></div> */}

      {/* Yellow circle container */}
      <div className="relative z-10 w-56 h-56 rounded-full border-4 border-yellow-400 flex items-center justify-center shadow-[0_0_45px_rgba(255,193,7,0.45)] bg-linear-to-br from-gray-900 to-black">
        
        {/* Logo (bigger & safely inside) */}
        <img
          src={Logo}
          alt="Pro-Connect"
          className="w-44 h-44 object-contain rounded-full"
        />
      </div>

      {/* Loading text */}
      <p className="mt-8 text-yellow-400 text-lg font-semibold tracking-widest animate-pulse">
        LOADING...
      </p>

      {/* Progress bar */}
      <div className="w-64 mt-4">
        <div className="w-full h-2 bg-gray-800 rounded overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-yellow-500 via-yellow-400 to-yellow-300 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-gray-400 text-sm text-center">
          {progress}%
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        .animate-spin-slow {
          animation: spinSlow 9s linear infinite;
        }

        .animate-spin-slower {
          animation: spinSlow 15s linear infinite;
        }

        .animate-spin-reverse {
          animation: spinReverse 11s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
