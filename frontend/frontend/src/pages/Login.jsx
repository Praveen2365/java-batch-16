import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { loginUser } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // Load saved state from sessionStorage on component mount
  useEffect(() => {
    const savedLockUntil = sessionStorage.getItem('lockUntil');
    const savedEmail = sessionStorage.getItem('lockedEmail');
    
    if (savedLockUntil && savedEmail) {
      const lockTime = parseInt(savedLockUntil);
      const now = Date.now();
      
      if (lockTime > now) {
        const remainingSeconds = Math.ceil((lockTime - now) / 1000);
        setLockTimeRemaining(remainingSeconds);
        startCountdown(remainingSeconds);
        setForm(prev => ({ ...prev, email: savedEmail }));
      } else {
        sessionStorage.removeItem('lockUntil');
        sessionStorage.removeItem('lockedEmail');
      }
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
      const role = user.role;
      
      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (role === "STUDENT") {
        navigate("/student", { replace: true });
      } else if (role === "STAFF") {
        navigate("/staff", { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (loading || lockTimeRemaining) return;
    
    setLoading(true);
    setError("");
    setRemainingAttempts(null);

    try {
      const user = await loginUser(form.email, form.password);

      // Clear any lock data on successful login
      sessionStorage.removeItem('lockUntil');
      sessionStorage.removeItem('lockedEmail');

      console.log("Login successful, user role:", user.role);
      
      // Navigate based on role with replace to prevent back button issues
      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (user.role === "STUDENT") {
        navigate("/student", { replace: true });
      } else if (user.role === "STAFF") {
        navigate("/staff", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data || "Invalid credentials";
      
      if (errorMsg.includes("attempt(s) remaining")) {
        const matches = errorMsg.match(/(\d+)\s+attempt/);
        if (matches) {
          setRemainingAttempts(parseInt(matches[1]));
        }
        setError(errorMsg);
      } 
      else if (errorMsg.includes("locked") && errorMsg.includes("minute")) {
        const matches = errorMsg.match(/(\d+)\s+minute/);
        if (matches) {
          const minutes = parseInt(matches[1]);
          const lockTimeSeconds = minutes * 60;
          
          const lockExpiry = Date.now() + (lockTimeSeconds * 1000);
          sessionStorage.setItem('lockUntil', lockExpiry);
          sessionStorage.setItem('lockedEmail', form.email);
          
          setLockTimeRemaining(lockTimeSeconds);
          startCountdown(lockTimeSeconds);
        }
        setError(errorMsg);
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setLockTimeRemaining(null);
          sessionStorage.removeItem('lockUntil');
          sessionStorage.removeItem('lockedEmail');
          return null;
        }
        setLockTimeRemaining(prev - 1);
        return prev - 1;
      });
    }, 1000);
  };

  const formatCountdown = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setRemainingAttempts(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glass Card Container */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo/Brand Section */}
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-center mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/30"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </motion.div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-30"></div>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white"
            >
              Campus Resource
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-indigo-200 mt-1 text-sm"
            >
              Management System
            </motion.p>
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
            <p className="text-indigo-200 text-sm mt-1">Please enter your credentials to continue</p>
          </motion.div>

          {/* Error Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-6 overflow-hidden ${
                  lockTimeRemaining 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : remainingAttempts 
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                } backdrop-blur-sm border rounded-2xl`}
              >
                <div className="p-4">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 ${
                      lockTimeRemaining ? 'text-red-400' : remainingAttempts ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {lockTimeRemaining ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : remainingAttempts ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium ${
                        lockTimeRemaining ? 'text-red-200' : remainingAttempts ? 'text-yellow-200' : 'text-red-200'
                      }`}>
                        {lockTimeRemaining ? 'Account Locked' : remainingAttempts ? 'Invalid Credentials' : 'Error'}
                      </p>
                      <p className={`text-sm mt-1 ${
                        lockTimeRemaining ? 'text-red-200/80' : remainingAttempts ? 'text-yellow-200/80' : 'text-red-200/80'
                      }`}>
                        {lockTimeRemaining 
                          ? `Too many failed attempts. Please try again in ${formatCountdown(countdown)}`
                          : remainingAttempts
                            ? `${remainingAttempts} attempt(s) remaining before account lockout`
                            : error
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all text-white placeholder-indigo-200/50"
                  value={form.email}
                  onChange={handleInputChange}
                  disabled={lockTimeRemaining}
                  autoComplete="off"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-indigo-200/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all text-white placeholder-indigo-200/50 pr-12"
                  value={form.password}
                  onChange={handleInputChange}
                  disabled={lockTimeRemaining}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-200/50 hover:text-indigo-200 transition-colors"
                  disabled={lockTimeRemaining}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Indicators */}
            <AnimatePresence>
              {remainingAttempts !== null && !lockTimeRemaining && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-indigo-200">Attempts remaining</span>
                    <span className="font-medium text-yellow-300">{remainingAttempts}/3</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: `${(remainingAttempts / 3) * 100}%` }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                    />
                  </div>
                </motion.div>
              )}

              {lockTimeRemaining && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-indigo-200">Lock time remaining</span>
                    <span className="font-medium text-red-300">{formatCountdown(countdown)}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: `${(lockTimeRemaining / 60) * 100}%` }}
                      className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              whileHover={!lockTimeRemaining ? { scale: 1.02 } : {}}
              whileTap={!lockTimeRemaining ? { scale: 0.98 } : {}}
              type="submit"
              disabled={loading || lockTimeRemaining}
              className={`w-full py-3.5 rounded-xl font-medium text-white transition-all relative overflow-hidden group ${
                loading || lockTimeRemaining
                  ? 'bg-white/10 cursor-not-allowed' 
                  : remainingAttempts === 1
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:shadow-orange-500/30'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30'
              }`}
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : lockTimeRemaining ? (
                  `Locked · ${formatCountdown(countdown)}`
                ) : (
                  'Sign In'
                )}
              </span>
              {!loading && !lockTimeRemaining && (
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-indigo-200 hover:text-white transition-colors">
                Forgot your password?
              </Link>
            </div>
          </form>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-white/10 text-center"
          >
            <p className="text-indigo-200/80 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-white font-medium hover:underline">
                Create Account
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Login;
