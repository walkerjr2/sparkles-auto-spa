import React from "react";

export default function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
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
  );
}
