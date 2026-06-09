import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Mock validation
      if (formData.username === 'admin@firstresponder.app' && formData.password === 'Admin@123') {
        toast.success('Admin authentication successful!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid admin credentials.');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-dark-black flex flex-col justify-center items-center p-6 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-primary-red rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-dark-gray border border-gray-800 p-8 rounded-3xl shadow-2xl z-10 relative"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gray-800 p-4 rounded-full mb-4 border border-gray-700">
            <ShieldCheck size={48} className="text-primary-red" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-white text-center">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-2 text-center">Restricted Access. Authorized personnel only.</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Admin ID / Email</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="admin@firstresponder.app"
                required
                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-red transition"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Secure Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="Admin@123"
                required
                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-red pr-10 transition"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <Lock className="absolute right-3 top-3.5 text-gray-500" size={18} />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-red text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 mt-4 hover:bg-primary-darkRed transition shadow-glow-red border border-red-500/50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Authenticate</span>
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <button onClick={() => navigate('/login')} className="text-sm text-gray-500 hover:text-white transition">
            Return to User Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
