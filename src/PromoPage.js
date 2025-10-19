import React from "react";
import promoImg from "./assets/new promo.jpg";

export default function PromoPage({ onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-inter rounded-3xl p-2 sm:p-4">
      <button
        onClick={onBack}
        className="fixed top-16 md:top-32 left-4 z-[9999] flex items-center px-4 py-2 bg-sparkle-blue text-white rounded-full shadow-lg border-2 border-sparkle-blue hover:bg-sparkle-blue-dark transition-colors text-base md:text-lg font-bold"
        style={{ minWidth: 44, minHeight: 44 }}
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 mr-2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back
      </button>
      <img 
        src={promoImg} 
        alt="Promotion" 
        className="rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg h-auto mt-20 md:mt-32"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
