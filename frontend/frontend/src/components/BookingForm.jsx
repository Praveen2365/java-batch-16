import React, { useState, useEffect } from "react";
import API from "../services/api";
import { getCurrentUser } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";

const BookingForm = ({ resourceId, onBookingComplete, onCancel, isAdmin = false }) => {
  const [formData, setFormData] = useState({
    resourceId: resourceId || "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);
  const [conflictingSlots, setConflictingSlots] = useState([]);

  const currentUser = getCurrentUser();
  const role = currentUser?.role;

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (formData.resourceId && formData.bookingDate) {
      checkAvailability();
    }
  }, [formData.resourceId, formData.bookingDate]);

  const fetchResources = async () => {
    try {
      let endpoint = "";
      if (role === "ADMIN") {
        endpoint = "/admin/resources";
      } else if (role === "STUDENT") {
        endpoint = "/student/resources";
      } else if (role === "STAFF") {
        endpoint = "/staff/resources";
      }
      
      const res = await API.get(endpoint);
      setResources(res.data);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Failed to load resources");
    }
  };

  const checkAvailability = async () => {
    try {
      const res = await API.get(`/bookings/available-slots`, {
        params: {
          resourceId: formData.resourceId,
          date: formData.bookingDate
        }
      });
      
      if (res.data && res.data.length > 0) {
        setAvailableSlots(res.data);
        // Find conflicting slots (unavailable ones)
        const conflicts = res.data.filter(slot => !slot.available);
        setConflictingSlots(conflicts);
        setShowTimeSlots(true);
      }
    } catch (err) {
      console.error("Error checking availability:", err);
    }
  };

  const selectTimeSlot = (start, end, isAvailable) => {
    if (!isAvailable && isAdmin) {
      // Admin can book unavailable slots (override)
      setFormData({
        ...formData,
        startTime: start,
        endTime: end
      });
      setShowOverrideWarning(true);
      setShowTimeSlots(false);
    } else if (isAvailable) {
      setFormData({
        ...formData,
        startTime: start,
        endTime: end
      });
      setShowTimeSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!formData.resourceId || !formData.bookingDate || !formData.startTime || !formData.endTime) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        resourceId: parseInt(formData.resourceId),
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        emergencyOverride: isAdmin && showOverrideWarning // Flag for emergency override
      };

      const res = await API.post("/bookings", bookingData);
      
      if (isAdmin) {
        setSuccess("Booking created successfully! (Admin override)");
      } else {
        setSuccess("Booking request submitted successfully!");
      }
      
      setTimeout(() => {
        if (onBookingComplete) {
          onBookingComplete();
        }
      }, 1500);
      
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.response?.data || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };

  const slotVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.05, type: "spring", stiffness: 300 }
    })
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6 text-white"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
          {isAdmin ? "Admin Booking (Auto-Approved)" : "Book a Resource"}
        </h2>
        {isAdmin && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium border border-amber-500/30"
          >
            Admin Mode
          </motion.div>
        )}
      </div>
      
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm">Admin Mode: Your bookings are automatically approved and can override existing bookings</span>
        </motion.div>
      )}
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
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
        
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl mb-4 flex items-center gap-3"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Resource Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Resource <span className="text-red-400">*</span>
          </label>
          <select
            name="resourceId"
            value={formData.resourceId}
            onChange={(e) => {
              setFormData({...formData, resourceId: e.target.value});
              setShowOverrideWarning(false);
            }}
            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-200"
            required
          >
            <option value="" className="bg-gray-700">-- Choose a resource --</option>
            {resources.map(resource => (
              <option key={resource.id} value={resource.id} className="bg-gray-700">
                {resource.name} ({resource.type}) - Capacity: {resource.capacity}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={(e) => {
              setFormData({...formData, bookingDate: e.target.value});
              setShowOverrideWarning(false);
            }}
            min={today}
            max={maxDateStr}
            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-200"
            required
          />
        </div>

        {/* Time Slot Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Time Slot <span className="text-red-400">*</span>
          </label>
          
          {formData.startTime && formData.endTime ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl mb-2 ${
                showOverrideWarning && isAdmin
                  ? 'bg-amber-500/10 border border-amber-500/30'
                  : 'bg-blue-500/10 border border-blue-500/30'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {showOverrideWarning && isAdmin && (
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <span className="text-sm text-gray-300">Selected:</span>
                  <span className={`font-medium ${
                    showOverrideWarning && isAdmin ? 'text-amber-300' : 'text-blue-300'
                  }`}>
                    {formData.startTime} - {formData.endTime}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({...formData, startTime: "", endTime: ""});
                    setShowTimeSlots(true);
                    setShowOverrideWarning(false);
                  }}
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition"
                >
                  Change
                </button>
              </div>
              {showOverrideWarning && isAdmin && (
                <p className="text-sm text-amber-300 mt-2 flex items-center gap-2">
                  <span>⚠️</span>
                  This slot is currently booked. Your admin booking will override it.
                </p>
              )}
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                if (formData.resourceId && formData.bookingDate) {
                  checkAvailability();
                } else {
                  setError("Please select resource and date first");
                }
              }}
              className="w-full p-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl transition-all text-left flex items-center justify-between group"
            >
              <span className="text-gray-300">Check Available Time Slots</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}

          <AnimatePresence>
            {showTimeSlots && !formData.startTime && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="mt-4 overflow-hidden"
              >
                <p className="text-sm text-gray-400 mb-3">Available time slots:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-900/50 rounded-xl border border-gray-700/50">
                  {availableSlots.map((slot, index) => (
                    <motion.button
                      key={index}
                      custom={index}
                      variants={slotVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: slot.available ? 1.05 : (isAdmin ? 1.05 : 1) }}
                      whileTap={{ scale: slot.available ? 0.95 : (isAdmin ? 0.95 : 1) }}
                      type="button"
                      onClick={() => selectTimeSlot(slot.startTime, slot.endTime, slot.available)}
                      className={`
                        p-3 text-sm rounded-xl transition-all relative overflow-hidden
                        ${slot.available 
                          ? 'bg-gray-700 hover:bg-green-600/80 cursor-pointer border border-gray-600 hover:border-green-500 text-gray-200' 
                          : isAdmin 
                            ? 'bg-amber-500/10 hover:bg-amber-500/30 cursor-pointer border border-amber-500/30 text-amber-300' 
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed line-through border border-gray-700'
                        }
                      `}
                      disabled={!slot.available && !isAdmin}
                    >
                      <span className="relative z-10">{slot.startTime} - {slot.endTime}</span>
                      {!slot.available && isAdmin && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full"
                        >
                          ⚡
                        </motion.span>
                      )}
                    </motion.button>
                  ))}
                </div>
                {isAdmin && conflictingSlots.length > 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-amber-400 mt-3 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Yellow slots are booked but you can override them as admin
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Purpose (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Purpose (Optional)
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={(e) => setFormData({...formData, purpose: e.target.value})}
            rows="3"
            placeholder="Tell us what this booking is for..."
            className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-200 placeholder-gray-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !formData.startTime}
            className={`
              flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
              ${loading || !formData.startTime
                ? 'bg-gray-600 cursor-not-allowed text-gray-400' 
                : isAdmin 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30'
              }
            `}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                {isAdmin ? 'Create Admin Booking' : 'Request Booking'}
              </>
            )}
          </motion.button>
          
          {onCancel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all text-gray-300"
            >
              Cancel
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default BookingForm;