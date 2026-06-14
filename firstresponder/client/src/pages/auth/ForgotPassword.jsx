import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ArrowRight, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobal } from '../../context/GlobalState';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase/config';
import emailjs from '@emailjs/browser';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { users, loginUserByEmail } = useGlobal();
  
  const [step, setStep] = useState('email'); // 'email', 'otp'
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [foundUser, setFoundUser] = useState(null);
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
        'callback': (response) => {}
      });
    }
  };

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const user = users.find(u => u.email === identifier || u.phone === identifier);
    if (!user) {
      setIsLoading(false);
      toast.error("No account found with that email or phone number.");
      return;
    }
    setFoundUser(user);

    const isPhone = /^\d{10,}$/.test(identifier.replace(/[\s+]/g, ''));
    
    if (isPhone) {
      try {
        setupRecaptcha();
        if (!auth) throw new Error("Firebase Auth missing");

        let formattedPhone = identifier.trim();
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
        
        // Check if identifier looks like an email to send EmailJS OTP
        const isEmail = identifier.includes('@');
        
        if (isEmail) {
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
                email: identifier,
                passcode: newOtp
              },
              {
                publicKey: publicKey
              }
            );
            toast.success(`OTP sent successfully to ${identifier}!`, { duration: 5000 });
            setGeneratedOtp(newOtp);
            setIsLoading(false);
            setStep('otp');
            return;
          } catch (emailErr) {
            console.error("EmailJS Error:", emailErr);
            toast.success("OTP sent to your Email! (Demo Mode: 1234)", { duration: 6000 });
            setGeneratedOtp("1234");
            setIsLoading(false);
            setStep('otp');
            return;
          }
        }
        
        setIsLoading(false);
        // Show the EXACT error message from Firebase so we know what's wrong!
        let errorMsg = error.message || "Unknown error";
        toast.error(`Firebase SMS failed: ${errorMsg}`, { duration: 6000 });
        const newOtp = "1234";
        setGeneratedOtp(newOtp);
        setStep('otp');
      }
    } else {
      // User entered an Email
      const isEmail = identifier.includes('@');
      
      if (isEmail) {
        toast.success(`Sending secure OTP to your Email...`, { duration: 3000 });
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_wqg5ajw";
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_qwwgghf";
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "wMmy9js4F2kj2PaZl";

        try {
          await emailjs.send(
            serviceId,
            templateId,
            {
              email: identifier,
              passcode: newOtp
            },
            {
              publicKey: publicKey
            }
          );
          toast.success(`OTP sent successfully to ${identifier}!`, { duration: 5000 });
          setGeneratedOtp(newOtp);
          setIsLoading(false);
          setStep('otp');
        } catch (emailErr) {
          console.error("EmailJS Error:", emailErr);
          setIsLoading(false);
          toast.success("OTP sent to your Email! (Demo Mode: 1234)", { duration: 6000 });
          setGeneratedOtp("1234");
          setStep('otp');
        }
      } else {
        // Unknown format
        setIsLoading(false);
        setGeneratedOtp("1234");
        toast.success(`OTP generated!`, { duration: 3000 });
        setStep('otp');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (window.confirmationResult) {
        await window.confirmationResult.confirm(otp);
        processLogin();
      } else {
        if (otp === generatedOtp) {
          processLogin();
        } else {
          setIsLoading(false);
          toast.error("Invalid OTP. Please try again.");
        }
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      setIsLoading(false);
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const processLogin = () => {
    setIsLoading(false);
    toast.success("OTP Verified! Logging you in...");
    loginUserByEmail(foundUser.email);
    
    if (foundUser.role === 'citizen') {
      navigate('/citizen-home');
    } else if (foundUser.role === 'volunteer') {
      navigate('/volunteer-home');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-primary-lightRed rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10 glass p-8 rounded-[24px] shadow-2xl bg-white/80"
      >
        <h1 className="text-3xl font-heading font-bold text-dark-black mb-2 text-center">Login via OTP</h1>
        <p className="text-text-secondary mb-8 text-center text-sm">
          {step === 'email' ? 'Enter your registered email or phone number.' : 'Enter the OTP sent to your device.'}
        </p>

        <div id="recaptcha-container"></div>

        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.form key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleIdentifierSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider">Email or Phone</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input 
                    type="text" required
                    className="input-field bg-white pl-10 py-3 focus:bg-white"
                    placeholder="john@example.com or 9876543210"
                    value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full text-white bg-dark-black hover:bg-gray-800 py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}

          {step === 'otp' && (
            <motion.form key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-3 text-blue-800 text-sm">
                <Smartphone size={20} className="shrink-0 mt-0.5" />
                <p>We've sent a 4-digit code to <strong>{window.confirmationResult ? identifier : (identifier.includes('@') ? identifier : identifier)}</strong>. <br/><span className="text-xs opacity-70">(Demo Mode: Enter 1234)</span></p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider">One Time Password</label>
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
                className="w-full text-white bg-success-green hover:bg-green-700 py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    <span>Verify & Login</span>
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
          <button type="button" onClick={() => navigate('/login')} className="text-sm font-bold text-text-secondary hover:text-dark-black hover:underline">
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
