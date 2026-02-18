import React, { useState, useEffect } from "react";
import API from "../services/api";
import { getCurrentUser } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";

const RequestList = ({ refreshTrigger, onRequestUpdate, onForceApprove, isAdmin = false }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [resources, setResources] = useState({});
  
  const user = getCurrentUser();
  const isAdminUser = user?.role === "ADMIN" || isAdmin;

  useEffect(() => {
    fetchRequests();
    if (isAdminUser) {
      fetchResources();
    }
  }, [refreshTrigger, filter]);

  const fetchResources = async () => {
    try {
      const res = await API.get("/admin/resources");
      const resourceMap = {};
      res.data.forEach(r => {
        resourceMap[r.id] = r;
      });
      setResources(resourceMap);
    } catch (err) {
      console.error("Error fetching resources:", err);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const endpoint = isAdminUser ? "/bookings/all" : "/bookings/my";
      const res = await API.get(endpoint);
      
      let filteredData = res.data;
      
      if (filter !== "all") {
        filteredData = filteredData.filter(
          req => req.status.toLowerCase() === filter.toLowerCase()
        );
      }
      
      // Sort by date (most recent first)
      filteredData.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
      
      setRequests(filteredData);
      setError("");
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/bookings/${id}/approve`);
      fetchRequests();
      if (onRequestUpdate) onRequestUpdate("approved", id);
    } catch (err) {
      console.error("Error approving booking:", err);
      alert("Failed to approve booking");
    }
  };

  const handleReject = (id) => {
    setCurrentBookingId(id);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await API.put(`/bookings/${currentBookingId}/reject`, {
        reason: rejectionReason
      });
      setShowRejectModal(false);
      setRejectionReason("");
      setCurrentBookingId(null);
      fetchRequests();
      if (onRequestUpdate) onRequestUpdate("rejected", currentBookingId);
    } catch (err) {
      console.error("Error rejecting booking:", err);
      alert("Failed to reject booking");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await API.delete(`/bookings/${id}`);
      fetchRequests();
      if (onRequestUpdate) onRequestUpdate("cancelled", id);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking");
    }
  };

  const handleForceApproveClick = (request) => {
    if (onForceApprove) {
      onForceApprove(request);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      APPROVED: "bg-green-500/20 text-green-300 border-green-500/30",
      REJECTED: "bg-red-500/20 text-red-300 border-red-500/30",
      CANCELLED: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      OVERRIDDEN: "bg-purple-500/20 text-purple-300 border-purple-500/30"
    };
    
    return (
      <motion.span 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`px-3 py-1 text-xs font-medium rounded-full border ${colors[status] || colors.PENDING} inline-flex items-center`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'PENDING' ? 'bg-amber-400' :
          status === 'APPROVED' ? 'bg-green-400' :
          status === 'REJECTED' ? 'bg-red-400' :
          status === 'CANCELLED' ? 'bg-gray-400' :
          'bg-purple-400'
        }`}></span>
        {status}
      </motion.span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      STAFF: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      STUDENT: "bg-green-500/20 text-green-300 border-green-500/30"
    };
    
    return (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full border ${colors[role] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
        {role}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    // Convert "09:00:00" to "9:00 AM"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  if (loading && requests.length === 0) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-12">
        <div className="flex justify-center items-center h-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-3 border-blue-400/20 border-t-blue-400 rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6 text-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
          {isAdminUser ? "All Booking Requests" : "My Bookings"}
        </h2>
        
        <div className="flex gap-2 bg-gray-900/50 p-1 rounded-xl">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <motion.button
              key={f}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-lg text-sm capitalize font-medium transition-all
                ${filter === f 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }
              `}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-4 flex items-center gap-3"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {requests.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            <svg className="w-20 h-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </motion.div>
          <p className="text-gray-400 text-lg">No booking requests found</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          className="space-y-4"
        >
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              variants={itemVariants}
              custom={index}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              className="bg-gray-700/50 rounded-xl p-5 border border-gray-600/50 transition-all cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="font-semibold text-lg text-gray-200">
                      {resources[request.resourceId]?.name || `Resource #${request.resourceId}`}
                    </h3>
                    {getRoleBadge(request.userRole)}
                    {request.emergencyOverride && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium border border-amber-500/30">
                        ⚡ Emergency Override
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Booked by: {request.userName} ({request.userEmail})
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Date</p>
                  <p className="font-medium text-gray-200">{formatDate(request.bookingDate)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Time</p>
                  <p className="font-medium text-gray-200">
                    {formatTime(request.startTime)} - {formatTime(request.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Duration</p>
                  <p className="font-medium text-gray-200">{request.duration || '?'} mins</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Resource ID</p>
                  <p className="font-medium text-gray-200">#{request.resourceId}</p>
                </div>
                {resources[request.resourceId]?.type && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Type</p>
                    <p className="font-medium text-gray-200">{resources[request.resourceId].type}</p>
                  </div>
                )}
              </div>

              {request.rejectionReason && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 p-3 rounded-lg"
                >
                  <span className="font-semibold">Rejection Reason: </span>
                  {request.rejectionReason}
                </motion.div>
              )}

              {/* Admin Actions */}
              {isAdminUser && request.status === "PENDING" && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex flex-wrap gap-2" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApprove(request.id)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-green-500/30 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReject(request.id)}
                    className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-red-500/30 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </motion.button>
                  
                </motion.div>
              )}

              {/* User Actions */}
              {!isAdminUser && request.status === "PENDING" && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCancel(request.id)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Cancel Request
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Booking Details
                </h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">Booking ID</p>
                    <p className="font-medium text-gray-200">{selectedRequest.id}</p>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">Status</p>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg col-span-2">
                    <p className="text-gray-400 text-xs mb-1">User</p>
                    <p className="font-medium text-gray-200">{selectedRequest.userName}</p>
                    <p className="text-sm text-gray-400">{selectedRequest.userEmail}</p>
                    <div className="mt-1">{getRoleBadge(selectedRequest.userRole)}</div>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg col-span-2">
                    <p className="text-gray-400 text-xs mb-1">Resource</p>
                    <p className="font-medium text-gray-200">
                      {resources[selectedRequest.resourceId]?.name || `Resource #${selectedRequest.resourceId}`}
                    </p>
                    <p className="text-sm text-gray-400">
                      Type: {resources[selectedRequest.resourceId]?.type || 'Unknown'} | 
                      Capacity: {resources[selectedRequest.resourceId]?.capacity || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg col-span-2">
                    <p className="text-gray-400 text-xs mb-1">Date & Time</p>
                    <p className="font-medium text-gray-200">{formatDate(selectedRequest.bookingDate)}</p>
                    <p className="text-sm text-gray-400">
                      {formatTime(selectedRequest.startTime)} - {formatTime(selectedRequest.endTime)}
                    </p>
                  </div>
                </div>

                {selectedRequest.rejectionReason && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg"
                  >
                    <p className="font-semibold text-red-400 mb-1">Rejection Reason:</p>
                    <p className="text-red-300">{selectedRequest.rejectionReason}</p>
                  </motion.div>
                )}

                {selectedRequest.emergencyOverride && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg"
                  >
                    <p className="font-semibold text-amber-400 mb-1 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Emergency Override
                    </p>
                    <p className="text-amber-300 text-sm">This booking was force-approved by an administrator</p>
                  </motion.div>
                )}

                <div className="border-t border-gray-700 pt-4 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRequest(null)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowRejectModal(false);
              setRejectionReason("");
              setCurrentBookingId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-200 text-center mb-2">Reject Booking</h3>
              <p className="text-gray-400 text-center mb-6">Please provide a reason for rejection</p>
              
              <div className="mb-6">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-200 placeholder-gray-400"
                  rows="4"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmReject}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-red-500/30"
                >
                  Confirm Reject
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setCurrentBookingId(null);
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
    </motion.div>
  );
};

export default RequestList;