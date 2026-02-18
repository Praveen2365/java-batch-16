import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [formProgress, setFormProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    if (name === "password") {
      checkPasswordStrength(value);
    }
    
    // Calculate form progress
    calculateFormProgress();
  };

  const calculateFormProgress = () => {
    const fields = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    const filledFields = fields.filter(field => form[field]?.length > 0).length;
    const progress = (filledFields / fields.length) * 100;
    setFormProgress(progress);
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    const errors = [];

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      errors.push("At least 8 characters");
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      errors.push("One uppercase letter");
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      errors.push("One lowercase letter");
    }

    // Number check
    if (/\d/.test(password)) {
      strength += 12.5;
    } else {
      errors.push("One number");
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 12.5;
    } else {
      errors.push("One special character");
    }

    setPasswordStrength(strength);
    setPasswordErrors(errors);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "bg-rose-500";
    if (passwordStrength < 75) return "bg-amber-500";
    if (passwordStrength < 90) return "bg-emerald-500";
    return "bg-green-600";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Medium";
    if (passwordStrength < 90) return "Good";
    return "Strong";
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      alert("Please fill all fields");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return false;
    }

    if (passwordStrength < 50) {
      alert("Please choose a stronger password");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const userData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      };

      await registerUser(userData);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (fieldName) => `
    w-full px-4 py-3.5 
    bg-white/90 backdrop-blur-sm
    border-2 rounded-xl 
    transition-all duration-200 
    outline-none
    ${focusedField === fieldName 
      ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-500/10' 
      : 'border-gray-200 hover:border-gray-300'
    }
    ${form[fieldName] && !focusedField ? 'border-gray-300' : ''}
    placeholder:text-gray-400
    text-gray-700
    font-medium
  `;

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
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Glass Card Container */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header with animated icon */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-indigo-600/30"
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl font-bold text-white"
            >
              Join Our Campus
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-indigo-200 mt-2"
            >
              Create your account to access campus resources
            </motion.p>

            {/* Form Progress Bar */}
            <motion.div 
              variants={itemVariants}
              className="mt-6 max-w-xs mx-auto"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-indigo-200">Form Completion</span>
                <span className="text-xs font-medium text-white">{Math.round(formProgress)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${formProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name Field */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                className="md:col-span-2"
              >
                <label className="block text-sm font-semibold text-indigo-200 mb-2 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={inputClasses('name')}
                />
              </motion.div>

              {/* Email Field */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className="md:col-span-2"
              >
                <label className="block text-sm font-semibold text-indigo-200 mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your university email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={inputClasses('email')}
                />
              </motion.div>

              {/* Phone Field */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className="md:col-span-2"
              >
                <label className="block text-sm font-semibold text-indigo-200 mb-2 ml-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={inputClasses('phone')}
                />
              </motion.div>

              {/* Password Field */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                className="md:col-span-2"
              >
                <label className="block text-sm font-semibold text-indigo-200 mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={inputClasses('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-300 transition-colors"
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

                {/* Password Strength Meter */}
                <AnimatePresence>
                  {form.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-indigo-200">Password strength:</span>
                        <motion.span 
                          key={passwordStrength}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            passwordStrength < 50 ? 'bg-rose-500/20 text-rose-300' :
                            passwordStrength < 75 ? 'bg-amber-500/20 text-amber-300' :
                            passwordStrength < 90 ? 'bg-emerald-500/20 text-emerald-300' :
                            'bg-green-500/20 text-green-300'
                          }`}
                        >
                          {getPasswordStrengthText()}
                        </motion.span>
                      </div>
                      
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full ${getPasswordStrengthColor()} rounded-full`}
                        />
                      </div>

                      {/* Password Requirements */}
                      {passwordErrors.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-3 grid grid-cols-2 gap-2"
                        >
                          {passwordErrors.map((error, index) => (
                            <motion.div
                              key={index}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center text-xs text-rose-300"
                            >
                              <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span className="truncate">{error}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={4}
                className="md:col-span-2"
              >
                <label className="block text-sm font-semibold text-indigo-200 mb-2 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`${inputClasses('confirmPassword')} ${
                      form.confirmPassword && form.password !== form.confirmPassword 
                        ? 'border-rose-400/50 focus:border-rose-400' 
                        : form.confirmPassword && form.password === form.confirmPassword
                        ? 'border-green-400/50'
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-300 transition-colors"
                  >
                    {showConfirmPassword ? (
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
                
                <AnimatePresence>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-xs text-rose-300 flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Passwords don't match
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Role Selection */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={5}
                className="md:col-span-2"
              >
                <label className="block text-sm font-semibold text-indigo-200 mb-2 ml-1">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['STUDENT', 'STAFF'].map((role) => (
                    <motion.button
                      key={role}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setForm({ ...form, role })}
                      className={`
                        py-3.5 px-4 rounded-xl border-2 transition-all duration-200
                        ${form.role === role 
                          ? 'border-indigo-400 bg-indigo-500/20 text-white font-semibold' 
                          : 'border-white/20 hover:border-white/40 text-indigo-200 hover:bg-white/5'
                        }
                      `}
                    >
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Terms and Conditions */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={6}
                className="md:col-span-2"
              >
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 border-2 border-white/20 rounded-lg bg-white/5 checked:bg-indigo-500 checked:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                    required
                  />
                  <span className="text-sm text-indigo-200 group-hover:text-white transition-colors">
                    I agree to the{' '}
                    <button type="button" className="text-white font-semibold hover:underline">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-white font-semibold hover:underline">
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              custom={7}
              className="mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`
                  w-full py-4 rounded-xl font-bold text-white text-lg
                  bg-gradient-to-r from-indigo-500 to-purple-600
                  hover:from-indigo-600 hover:to-purple-700
                  shadow-xl shadow-indigo-600/30
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:from-indigo-500 disabled:hover:to-purple-600
                  relative overflow-hidden group
                `}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  initial={false}
                />
              </motion.button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-indigo-200">
              Already have an account?{' '}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="text-white font-semibold hover:underline inline-flex items-center group"
              >
                Sign in here
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </p>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-2xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full blur-2xl opacity-30"></div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;