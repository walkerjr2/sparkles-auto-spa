
import React, { useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import logo from "./assets/newlogo.png";
import { useNavigate } from "react-router-dom";


const CustomerLogin = () => {
  const navigate = useNavigate();

  // Removed redirect after login so user stays on main site
  // useEffect(() => {
  //   const unsub = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       navigate('/dashboard');
  //     }
  //   });
  //   return () => unsub();
  // }, [navigate]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      await signInWithPopup(auth, provider);
      navigate('/'); // Go to home page after login
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        alert("Sign-in cancelled. Please try again.");
      } else if (error.code === 'auth/unauthorized-domain') {
        alert("This domain is not authorized. Please contact support.");
      } else if (error.code === 'auth/popup-blocked') {
        alert("Popup was blocked. Please allow popups for this site and try again.");
      } else {
        alert("Google sign-in failed: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#19c2ff] via-[#6fff3e] to-[#f6ff6b] p-4">
      <div className="bg-white/95 rounded-[2.5rem] shadow-2xl p-0 max-w-lg w-full flex flex-col items-center border border-gray-100 animate-fade-in">
        {/* Header with logo and brand */}
        <div className="w-full flex flex-col items-center justify-center bg-gradient-to-r from-[#e3f0fa] to-[#e6ffe6] rounded-t-[2.5rem] p-8 border-b border-[#e0e7ef]">
          <img src={logo} alt="Sparkles Auto Spa Logo" className="h-16 md:h-20 mb-2" style={{maxWidth:'160px'}} />
          <h1 className="text-3xl md:text-4xl font-extrabold text-sparkle-blue text-center tracking-tight mb-1" style={{letterSpacing:'-1px'}}>Customer Login</h1>
          <p className="text-base md:text-lg text-[#3a4a5a] font-medium text-center max-w-xs">Sign in to access your dashboard and manage your bookings.</p>
        </div>
        {/* Premium login card */}
        <div className="w-full flex flex-col items-center justify-center p-10 gap-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full px-10 py-4 bg-sparkle-blue text-white font-bold rounded-full shadow-lg hover:bg-sparkle-blue-dark transition-colors text-lg flex items-center justify-center gap-3 book-btn-mobile"
            style={{minWidth: '200px'}}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              style={{ width: 28, height: 28, background: 'white', borderRadius: '50%', padding: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            />
            Sign in with Google
          </button>
          <div className="w-full flex flex-col items-center mt-2">
            <span className="text-gray-400 text-xs">Powered by Sparkles Auto Spa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
