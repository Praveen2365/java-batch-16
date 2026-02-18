import React, { useState, useEffect } from "react";
import API from "../services/api";
import { getCurrentUser } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";

const ResourceTable = ({ refreshTrigger, onResourceSelect }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  const currentUser = getCurrentUser();
  const role = currentUser?.role;

  useEffect(() => {
    fetchResources();
  }, [refreshTrigger]);

  const fetchResources = async () => {
    setLoading(true);
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
      setError("");
    } catch (err) {
      setError("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  // Filter resources based on search and type
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  // Get unique resource types for filter
  const resourceTypes = ["all", ...new Set(resources.map(r => r.type))];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
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

  const getStatusBadge = (status) => {
    const colors = {
      AVAILABLE: "bg-green-500/20 text-green-300 border-green-500/30",
      MAINTENANCE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      BOOKED: "bg-blue-500/20 text-blue-300 border-blue-500/30"
    };
    
    return (
      <motion.span 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`px-3 py-1 text-xs font-medium rounded-full border ${colors[status] || colors.AVAILABLE} inline-flex items-center`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'AVAILABLE' ? 'bg-green-400' :
          status === 'MAINTENANCE' ? 'bg-amber-400' :
          'bg-blue-400'
        }`}></span>
        {status}
      </motion.span>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-12"
      >
        <div className="flex justify-center items-center h-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-3 border-blue-400/20 border-t-blue-400 rounded-full"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="p-6 border-b border-gray-700/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-200">
            {role === "ADMIN" ? "Resource Management" : "Available Resources"}
          </h2>
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20"
          >
            <span className="text-sm text-blue-300 font-medium">
              {filteredResources.length} of {resources.length} resources
            </span>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-200 placeholder-gray-400"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-200"
          >
            {resourceTypes.map(type => (
              <option key={type} value={type} className="bg-gray-700">
                {type === "all" ? "All Types" : type}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Error State */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-8 text-center"
          >
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl inline-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchResources}
                className="ml-4 text-sm font-medium text-red-300 hover:text-red-200 bg-red-500/20 px-3 py-1 rounded-lg"
              >
                Try again
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!error && filteredResources.length === 0 && (
        <motion.div 
          variants={itemVariants}
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
          <p className="text-gray-400 text-lg mb-2">No resources found</p>
          <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
        </motion.div>
      )}

      {/* Table */}
      {!error && filteredResources.length > 0 && (
        <motion.div variants={itemVariants} className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                {role !== "ADMIN" && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredResources.map((resource, index) => (
                <motion.tr
                  key={resource.id}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  className="group transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mr-3"
                      >
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </motion.div>
                      <div>
                        <span className="text-sm font-semibold text-gray-200">{resource.name}</span>
                        <p className="text-xs text-gray-400 mt-0.5">ID: #{resource.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300 bg-gray-700/50 px-3 py-1.5 rounded-lg">
                      {resource.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {resource.capacity}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(resource.status)}
                  </td>
                  {role !== "ADMIN" && (
                    <td className="px-6 py-4">
                      {resource.status === 'AVAILABLE' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onResourceSelect(resource)}
                          className="px-4 py-2 text-sm font-medium text-blue-300 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 border border-blue-500/30 transition-all flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Book Now
                        </motion.button>
                      )}
                      {resource.status !== 'AVAILABLE' && (
                        <span className="text-sm text-gray-500 italic">Not available</span>
                      )}
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div 
        variants={itemVariants}
        className="px-6 py-4 bg-gray-900/50 border-t border-gray-700/50"
      >
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">
            Showing <span className="text-gray-200 font-medium">{filteredResources.length}</span> of{' '}
            <span className="text-gray-200 font-medium">{resources.length}</span> resources
          </span>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchResources}
            className="flex items-center text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResourceTable;