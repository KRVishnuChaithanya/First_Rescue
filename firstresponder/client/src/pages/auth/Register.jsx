import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, User, HeartPulse, ArrowRight, UploadCloud, CheckCircle, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobal } from '../../context/GlobalState';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase/config';
import emailjs from '@emailjs/browser';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('citizen'); // 'citizen', 'volunteer', 'admin'
  const [step, setStep] = useState('details'); // 'details', 'otp', 'password'
  
  const { addVolunteerRequest, registerUser, users } = useGlobal();
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', dob: '', password: '', confirmPassword: '', qualification: ''
  });
  
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }
    if (auth) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (role === 'admin') {
      if (formData.email.toLowerCase() === 'nani@admin') {
        toast.success('Admin Login successful!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid admin credentials. Hint: use "nani@admin"');
      }
      return;
    }

    // Check if phone or email already in use
    const exists = users.some(u => u.email === formData.email || u.phone === formData.phone);
    if (exists) {
      toast.error('Phone number or email ID already in use.');
      return;
    }

    setIsLoading(true);
    
    try {
      setupRecaptcha();
      
      if (!auth) throw new Error("Firebase Auth is not initialized due to missing config.");

      let formattedPhone = formData.phone.trim();
      // Assume Indian number for this project context if + isn't provided
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
      }
      
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      
      setIsLoading(false);
      toast.success(`Real SMS OTP sent to ${formattedPhone} via Firebase!`, { duration: 6000 });
      setStep('otp');
    } catch (error) {
      console.error("Firebase SMS Error:", error);
      
      // FIREBASE SMS FAILED (BILLING) -> SEND EMAIL OTP INSTEAD!
      if (formData.email) {
        toast.success("OTP sent to your Email", { duration: 4000 });
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_wqg5ajw";
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_qwwgghf";
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "wMmy9js4F2kj2PaZl";

        try {
          await emailjs.send(
            serviceId,
            templateId,
            {
              email: formData.email,
              passcode: newOtp
            },
            {
              publicKey: publicKey
            }
          );
          toast.success(`OTP sent successfully to ${formData.email}!`, { duration: 5000 });
          setGeneratedOtp(newOtp);
          setIsLoading(false);
          setStep('otp');
          return;
        } catch (emailErr) {
          console.error("EmailJS Error:", emailErr);
          toast.error("Email failed too. Falling back to Demo Mode (1234).");
        }
      }
      
      setIsLoading(false);
      let errorMsg = error.message || "Unknown error";
      toast.error(`Firebase SMS failed: ${errorMsg}`, { duration: 6000 });
      const newOtp = "1234";
      setGeneratedOtp(newOtp);
      setStep('otp');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (window.confirmationResult) {
        // Firebase verification
        await window.confirmationResult.confirm(otp);
        setIsLoading(false);
        toast.success('Firebase Phone verified successfully!');
        setStep('password');
      } else {
        // Fallback demo verification
        setIsLoading(false);
        if (otp === generatedOtp) {
          toast.success('OTP Verified successfully!');
          setStep('password');
        } else {
          toast.error('Invalid OTP. Please try again.');
        }
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setIsLoading(false);
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      const newUserData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        bloodGroup: 'Unknown',
        role: role
      };

      registerUser(newUserData);

      if (role === 'citizen') {
        toast.success('Registration successful! You can now login.');
        navigate('/login');
      } else {
        addVolunteerRequest({
          name: formData.name,
          email: formData.email,
          qual: formData.qualification || 'Not provided',
        });
        toast.success('Application submitted! Pending Admin approval.', { duration: 4000 });
        navigate('/login');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-light-gray flex flex-col md:flex-row">
      {/* Visual Panel */}
      <div className={`hidden md:flex md:w-5/12 flex-col justify-center items-center text-white p-12 transition-colors duration-500 ${role === 'citizen' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : role === 'volunteer' ? 'bg-gradient-to-br from-primary-red to-primary-darkRed' : 'bg-gradient-to-br from-gray-900 to-black'}`}>
        {role === 'citizen' ? <User size={80} className="mb-8 opacity-90" /> : role === 'volunteer' ? <HeartPulse size={80} className="mb-8 opacity-90" /> : <ShieldAlert size={80} className="mb-8 opacity-90" />}
        <h2 className="text-4xl font-heading font-bold mb-4 text-center">
          {role === 'citizen' ? 'Join as Citizen' : role === 'volunteer' ? 'Become a Responder' : 'Admin Portal'}
        </h2>
        <p className="text-lg opacity-80 text-center max-w-sm">
          {role === 'citizen' 
            ? 'Get immediate access to offline first-aid guides and report emergencies instantly.' 
            : role === 'volunteer' ? 'Use your medical skills to save lives in your community. Your help matters.'
            : 'Secure access to the system dashboard for dispatch and volunteer management.'}
        </p>
      </div>

      {/* Form Panel */}
      <div className="w-full md:w-7/12 min-h-screen flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-72 h-72 bg-primary-lightRed rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg z-10 glass p-8 sm:p-10 rounded-[24px] shadow-2xl"
        >
          
          <h1 className="text-3xl font-heading font-bold text-dark-black mb-2 text-center">Create Account</h1>
          <p className="text-text-secondary mb-8 text-center text-sm">
            {step === 'details' ? 'Join the FirstResponder network today.' : 
             step === 'otp' ? 'Verify your identity.' : 'Secure your account.'}
          </p>

          <div id="recaptcha-container"></div>

          {step === 'details' && (
            <div className="flex p-1 bg-gray-200 rounded-xl mb-8 relative">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(33.33%-3px)] rounded-lg transition-all duration-300 shadow-sm bg-white ${
                  role === 'citizen' ? 'left-1' : role === 'volunteer' ? 'left-[calc(33.33%+1px)]' : 'left-[calc(66.66%+2px)]'
                }`}
              ></div>
              <button 
                type="button"
                onClick={() => setRole('citizen')}
                className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${role === 'citizen' ? 'text-blue-600' : 'text-text-secondary'}`}
              >
                Citizen
              </button>
              <button 
                type="button"
                onClick={() => setRole('volunteer')}
                className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${role === 'volunteer' ? 'text-primary-red' : 'text-text-secondary'}`}
              >
                Volunteer
              </button>
              <button 
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${role === 'admin' ? 'text-dark-black' : 'text-text-secondary'}`}
              >
                Admin
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.form key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleDetailsSubmit} className="space-y-4">
                {role === 'admin' ? (
                  <div className="space-y-6 py-4">
                    <div className="bg-gray-50 border border-border p-4 rounded-xl text-sm text-text-secondary text-center mb-4">
                      Administrator accounts are pre-configured. Please sign in with your admin credentials.
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider">Admin ID / Email</label>
                      <input 
                        type="text" required
                        className="input-field bg-white/60 focus:bg-white"
                        placeholder="admin"
                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider">Full Name</label>
                        <input 
                          type="text" required
                          className="input-field bg-white/60 focus:bg-white"
                          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider">Date of Birth</label>
                        <input 
                          type="date" required
                          className="input-field bg-white/60 focus:bg-white text-dark-gray"
                          value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider">Email</label>
                        <input 
                          type="email" required
                          className="input-field bg-white/60 focus:bg-white"
                          value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider">Phone Number</label>
                        <input 
                          type="tel" required
                          className="input-field bg-white/60 focus:bg-white"
                          value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    {role === 'volunteer' && (
                      <div className="space-y-1 overflow-hidden">
                        <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider text-primary-red">Medical Qualification</label>
                        <div className="relative">
                          <input 
                            type="text" required
                            placeholder="e.g. MBBS, Certified First Responder, Nurse"
                            className="input-field bg-white/60 focus:bg-white border-primary-red/30 focus:border-primary-red pr-10"
                            value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                          />
                          <UploadCloud className="absolute right-3 top-2 text-primary-red opacity-60" size={20} />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 mt-6 transition-colors shadow-lg ${
                    role === 'citizen' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : role === 'volunteer' ? 'bg-primary-red hover:bg-primary-darkRed shadow-glow-red' : 'bg-dark-black hover:bg-gray-800 shadow-xl'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{role === 'admin' ? 'Access Admin' : 'Request OTP'}</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {step === 'otp' && (
              <motion.form key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-3 text-blue-800 text-sm">
                  <Smartphone size={20} className="shrink-0 mt-0.5" />
                  <p>We've sent a 4-digit code to <strong>{window.confirmationResult ? formData.phone : formData.email || formData.phone}</strong>. Please enter it below. <br/><span className="text-xs opacity-70">(Demo Mode: Enter 1234)</span></p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider">One Time Password (OTP)</label>
                  <input 
                    type="text" required maxLength="4"
                    className="input-field bg-white text-center text-2xl tracking-[1em] py-4"
                    placeholder="••••"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || otp.length !== 4}
                  className="w-full text-white bg-dark-black hover:bg-gray-800 py-3.5 rounded-xl font-bold flex items-center justify-center shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Verify OTP</span>
                  )}
                </motion.button>
              </motion.form>
            )}

            {step === 'password' && (
              <motion.form key="password" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="bg-green-50 p-4 rounded-xl flex items-center space-x-3 text-green-800 text-sm mb-4">
                  <CheckCircle size={20} className="shrink-0" />
                  <p className="font-bold">Identity verified! Set your password.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider">Password</label>
                  <input 
                    type="password" required minLength="6"
                    className="input-field bg-white/60 focus:bg-white"
                    placeholder="••••••••"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider">Confirm Password</label>
                  <input 
                    type="password" required minLength="6"
                    className="input-field bg-white/60 focus:bg-white"
                    placeholder="••••••••"
                    value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white py-3.5 rounded-xl font-bold flex items-center justify-center shadow-lg ${
                    role === 'citizen' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary-red hover:bg-primary-darkRed'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Complete Registration</span>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {role !== 'admin' && step === 'details' && (
            <div className="mt-8 text-center text-sm text-text-secondary">
              Already have an account? <Link to="/login" className="text-dark-black font-bold hover:underline">Sign In here</Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
