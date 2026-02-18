import React, { useState } from "react";
import { logout, getCurrentUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import ResourceTable from "../components/ResourceTable";
import RequestList from "../components/RequestList";
import BookingForm from "../components/BookingForm";
import { motion, AnimatePresence } from "framer-motion";

function StaffDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  const [activeTab, setActiveTab] = useState("resources");
  const [refreshResources, setRefreshResources] = useState(0);
  const [refreshRequests, setRefreshRequests] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBookingComplete = () => {
    setShowBookingForm(false);
    setSelectedResource(null);
    setRefreshResources(prev => prev + 1);
    setRefreshRequests(prev => prev + 1);
  };

  const handleResourceSelect = (resource) => {
    setSelectedResource(resource);
    setShowBookingForm(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header - Dark Theme */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-20 shadow-lg shadow-gray-900/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and User Info */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center space-x-4"
            >
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Staff Portal
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{currentUser?.email}</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30">
                    Staff Member
                  </span>
                </div>
              </div>
            </motion.div>
            
            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-700/80 hover:bg-gray-700 rounded-xl transition-all flex items-center space-x-2 group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </motion.button>
          </div>

          {/* Tabs - Dark Theme */}
          <div className="flex space-x-2">
            {[
              { 
                id: "resources", 
                label: "Available Resources", 
                icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
              },
              { 
                id: "mybookings", 
                label: "My Bookings", 
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3 text-sm font-medium transition-all flex items-center space-x-2 overflow-hidden group ${
                  activeTab === tab.id
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <motion.div
                  className="absolute inset-0 bg-blue-500/10 rounded-t-xl"
                  initial={false}
                  animate={{
                    y: activeTab === tab.id ? 0 : "100%"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                </svg>
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content - Dark Theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          >
            {activeTab === "resources" ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Quick Stats Card - Optional */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full mr-3"></span>
                    Welcome Back!
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Available Resources</span>
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-2xl font-bold text-gray-200 mt-2">24</p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">My Active Bookings</span>
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-2xl font-bold text-gray-200 mt-2">3</p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Pending Requests</span>
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-2xl font-bold text-gray-200 mt-2">1</p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Resource Table */}
                <motion.div variants={itemVariants}>
                  <ResourceTable 
                    refreshTrigger={refreshResources}
                    onResourceSelect={handleResourceSelect}
                  />
                </motion.div>
                
                {/* Booking Form Modal - Dark Theme */}
                <AnimatePresence>
                  {showBookingForm && selectedResource && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                      onClick={() => setShowBookingForm(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BookingForm
                          resourceId={selectedResource.id}
                          onBookingComplete={handleBookingComplete}
                          onCancel={() => {
                            setShowBookingForm(false);
                            setSelectedResource(null);
                          }}
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <RequestList 
                    refreshTrigger={refreshRequests}
                    onRequestUpdate={() => setRefreshRequests(prev => prev + 1)}
                  />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default StaffDashboard;