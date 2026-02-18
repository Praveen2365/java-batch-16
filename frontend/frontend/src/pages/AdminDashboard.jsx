import React, { useState, useEffect } from "react";
import { logout, getCurrentUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import ResourceTable from "../components/ResourceTable";
import RequestList from "../components/RequestList";
import BookingForm from "../components/BookingForm";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  const [activeTab, setActiveTab] = useState("resources");
  const [refreshResources, setRefreshResources] = useState(0);
  const [refreshRequests, setRefreshRequests] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");
  
  // Resource management states
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    name: "",
    type: "",
    capacity: "",
    status: "AVAILABLE"
  });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch resources on mount and refresh
  useEffect(() => {
    if (activeTab === "resources") {
      fetchResources();
    }
  }, [refreshResources, activeTab]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/resources");
      setResources(res.data);
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleResourceUpdate = () => {
    setRefreshResources(prev => prev + 1);
  };

  const handleRequestUpdate = (action, id) => {
    setRefreshRequests(prev => prev + 1);
    setRefreshResources(prev => prev + 1);
  };

  const handleResourceSelect = (resource) => {
    setSelectedResource(resource);
    setShowBookingForm(true);
  };

  const handleBookingComplete = () => {
    setShowBookingForm(false);
    setSelectedResource(null);
    setRefreshResources(prev => prev + 1);
    setRefreshRequests(prev => prev + 1);
  };

  const handleForceApprove = (booking) => {
    setSelectedBooking(booking);
    setShowOverrideModal(true);
  };

  const confirmForceApprove = async () => {
    try {
      // API call would go here
      setShowOverrideModal(false);
      setSelectedBooking(null);
      setOverrideReason("");
      setRefreshRequests(prev => prev + 1);
    } catch (error) {
      console.error("Force approve error:", error);
    }
  };

  // Resource CRUD operations
  const handleAddResource = () => {
    setEditingResource(null);
    setResourceForm({
      name: "",
      type: "",
      capacity: "",
      status: "AVAILABLE"
    });
    setShowResourceModal(true);
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setResourceForm({
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity,
      status: resource.status
    });
    setShowResourceModal(true);
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    
    try {
      await API.delete(`/admin/resources/${id}`);
      setRefreshResources(prev => prev + 1);
    } catch (err) {
      console.error("Error deleting resource:", err);
      alert("Failed to delete resource");
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingResource) {
        await API.put(`/admin/resources/${editingResource.id}`, resourceForm);
      } else {
        await API.post("/admin/resources", resourceForm);
      }
      
      setShowResourceModal(false);
      setRefreshResources(prev => prev + 1);
    } catch (err) {
      console.error("Error saving resource:", err);
      alert("Failed to save resource");
    }
  };

  const resourceTypes = ["LAB", "CLASSROOM", "HALL", "SEMINAR", "MEETING", "LECTURE_HALL"];

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
      {/* Modern Header with Glass Effect - Dark Theme */}
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
                className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{currentUser?.email}</span>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium border border-indigo-500/30">
                    Administrator
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

          {/* Modern Tabs with Icons - Dark Theme */}
          <div className="flex space-x-2">
            {[
              { 
                id: "resources", 
                label: "Resources", 
                icon: "M4 6h16M4 12h16M4 18h16",
                activeIcon: "M4 6h16M4 12h16M4 18h16",
                count: resources.length
              },
              { 
                id: "requests", 
                label: "Booking Requests", 
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                activeIcon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3 text-sm font-medium transition-all flex items-center space-x-2 overflow-hidden group ${
                  activeTab === tab.id
                    ? 'text-indigo-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <motion.div
                  className="absolute inset-0 bg-indigo-500/10 rounded-t-xl"
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
                {tab.id === "requests" && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative z-10 px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full text-xs font-medium border border-red-500/30"
                  >
                    3
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content - Dark Theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-6"
          >
            {activeTab === "resources" ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Quick Actions Card - Dark Theme */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                    <span className="w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full mr-3"></span>
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddResource}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-3 group"
                    >
                      <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="font-medium">Add Resource</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedResource(null);
                        setShowBookingForm(true);
                      }}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3 group"
                    >
                      <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">New Booking</span>
                    </motion.button>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 text-amber-300 px-4 py-4 rounded-xl flex items-center text-sm"
                    >
                      <svg className="w-5 h-5 mr-3 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Admin bookings are auto-approved and can override existing bookings</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Resources Management Table - Dark Theme */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-700/50 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-200 flex items-center">
                      <span className="w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full mr-3"></span>
                      Resource Management
                    </h2>
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20"
                      >
                        <span className="text-sm text-indigo-300 font-medium">
                          {resources.length} resource{resources.length !== 1 ? 's' : ''}
                        </span>
                      </motion.div>
                      <motion.button
                        whileHover={{ rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRefreshResources(prev => prev + 1)}
                        className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                        title="Refresh"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="p-12 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-10 border-3 border-indigo-400/20 border-t-indigo-400 rounded-full mx-auto"
                      />
                    </div>
                  ) : resources.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-16 text-center"
                    >
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block"
                      >
                        <svg className="w-20 h-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </motion.div>
                      <p className="text-gray-400 text-lg mb-4">No resources found</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddResource}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-indigo-500/30"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Your First Resource
                      </motion.button>
                    </motion.div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-900/50">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Resource</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Capacity</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                          {resources.map((resource, index) => (
                            <motion.tr
                              key={resource.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                              className="group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mr-3"
                                  >
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                  </motion.div>
                                  <span className="text-sm font-semibold text-gray-200">{resource.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-gray-400">{resource.type}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center text-sm text-gray-400">
                                  <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  {resource.capacity}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <motion.span 
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  className={`px-3 py-1 text-xs font-medium rounded-full inline-flex items-center ${
                                    resource.status === 'AVAILABLE' 
                                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    resource.status === 'AVAILABLE' ? 'bg-green-400' : 'bg-amber-400'
                                  }`}></span>
                                  {resource.status}
                                </motion.span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleEditResource(resource)}
                                    className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 rounded-xl transition-all"
                                    title="Edit"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteResource(resource.id)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all"
                                    title="Delete"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <RequestList 
                refreshTrigger={refreshRequests}
                onRequestUpdate={handleRequestUpdate}
                onForceApprove={handleForceApprove}
                isAdmin={true}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Booking Form Modal - Dark Theme */}
      <AnimatePresence>
        {showBookingForm && (
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
                resourceId={selectedResource?.id}
                onBookingComplete={handleBookingComplete}
                onCancel={() => {
                  setShowBookingForm(false);
                  setSelectedResource(null);
                }}
                isAdmin={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Resource Modal - Dark Theme */}
      <AnimatePresence>
        {showResourceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowResourceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                  {editingResource ? "Edit Resource" : "Add New Resource"}
                </h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowResourceModal(false)}
                  className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              <form onSubmit={handleResourceSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resource Name
                  </label>
                  <input
                    type="text"
                    value={resourceForm.name}
                    onChange={(e) => setResourceForm({...resourceForm, name: e.target.value})}
                    placeholder="e.g., Computer Lab 101"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-200 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resource Type
                  </label>
                  <select
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm({...resourceForm, type: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-200"
                    required
                  >
                    <option value="" className="bg-gray-700">Select type</option>
                    {resourceTypes.map(type => (
                      <option key={type} value={type} className="bg-gray-700">{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={resourceForm.capacity}
                    onChange={(e) => setResourceForm({...resourceForm, capacity: e.target.value})}
                    placeholder="e.g., 50"
                    min="1"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-200 placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={resourceForm.status}
                    onChange={(e) => setResourceForm({...resourceForm, status: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-200"
                  >
                    <option value="AVAILABLE" className="bg-gray-700">Available</option>
                    <option value="MAINTENANCE" className="bg-gray-700">Under Maintenance</option>
                    <option value="BOOKED" className="bg-gray-700">Booked</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30"
                  >
                    {editingResource ? "Update Resource" : "Add Resource"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowResourceModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Force Approve Modal - Dark Theme */}
      <AnimatePresence>
        {showOverrideModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowOverrideModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-200 text-center mb-2">Force Approve Booking</h3>
              <p className="text-gray-400 text-center mb-6">
                This booking may conflict with existing bookings. Are you sure you want to force approve?
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for override (optional)
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Enter reason for emergency override..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-200 placeholder-gray-400"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmForceApprove}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-amber-500/30"
                >
                  Force Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowOverrideModal(false);
                    setSelectedBooking(null);
                    setOverrideReason("");
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-xl font-medium transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;