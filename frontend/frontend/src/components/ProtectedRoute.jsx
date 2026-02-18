import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getRole } from "../services/authService";
import { motion } from "framer-motion";

const ProtectedRoute = ({ children, allowedRole }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState({
    authenticated: null,
    role: null,
    checking: true
  });

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const role = getRole();
      
      setAuthState({
        authenticated,
        role,
        checking: false
      });
    };
    
    checkAuth();
  }, [location.pathname]);

  if (authState.checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Animated Logo/Loader */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative w-20 h-20 mx-auto mb-6"
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
            
            {/* Gradient spinner */}
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-b-transparent border-l-blue-500 animate-spin"></div>
            
            {/* Inner gradient ring */}
            <div className="absolute inset-2 rounded-full border-4 border-gray-700/50"></div>
            
            {/* Center icon */}
            <motion.div 
              animate={{ scale: [1, 0.9, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Loading text with gradient */}
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-semibold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent mb-2"
          >
            Verifying Access
          </motion.h2>
          
          {/* Animated dots */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center space-x-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -5, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-2 h-2 rounded-full bg-blue-400"
              />
            ))}
          </motion.div>

          {/* Subtle background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ 
                x: ["-100%", "100%"],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-1/4 left-0 w-1/2 h-32 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent transform -rotate-45"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!authState.authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role if specific role is required
  if (allowedRole && authState.role !== allowedRole) {
    // Redirect to appropriate dashboard based on actual role
    // This prevents redirect loops
    if (authState.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else if (authState.role === "STUDENT") {
      return <Navigate to="/student" replace />;
    } else if (authState.role === "STAFF") {
      return <Navigate to="/staff" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;