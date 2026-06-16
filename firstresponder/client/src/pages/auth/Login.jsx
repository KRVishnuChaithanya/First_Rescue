import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldAlert, ArrowRight, User, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobal } from '../../context/GlobalState';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('citizen'); // 'citizen', 'volunteer', 'admin'
  const { checkVolunteerApproved, loginUser } = useGlobal();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      if (role === 'admin') {
        if (formData.email.toLowerCase() === 'nani@admin' && formData.password === 'nani@2005') {
          toast.success('Admin Login successful!');
          navigate('/admin/dashboard');
        } else {
          toast.error('Invalid admin credentials. Hint: use "nani@admin"');
        }
        return;
      }

      const loggedIn = loginUser(formData.email, formData.password);
      if (!loggedIn) {
        toast.error('Invalid credentials. Account not found or wrong password.');
        return;
      }

      if (role === 'citizen') {
        if (loggedIn.role !== 'citizen') {
          toast.error('Account found but role mismatch. Please use Volunteer login.');
          return;
        }
        toast.success('Citizen Login successful!');
        navigate('/citizen-home');
      } else {
        if (loggedIn.role !== 'volunteer') {
          toast.error('Account found but role mismatch. Please use Citizen login.');
          return;
        }
        const status = checkVolunteerApproved(formData.email);
        if (status === 'pending') {
          toast.error('Your application is still pending Admin approval.');
        } else if (status === 'rejected') {
          toast.error('Your application was rejected by the Admin.');
        } else if (status === 'not_found') {
          toast.error('Volunteer application not found. Please register.');
        } else {
          toast.success('Volunteer Login successful!');
          navigate('/volunteer-home');
        }
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-light-gray flex flex-col md:flex-row">
      {/* Dynamic Accent Panel */}
      <div className={`hidden md:flex md:w-1/2 flex-col justify-center items-center text-white p-12 transition-colors duration-500 ${role === 'citizen' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : role === 'volunteer' ? 'bg-gradient-to-br from-primary-red to-primary-darkRed' : 'bg-gradient-to-br from-gray-900 to-black'}`}>
        {role === 'citizen' ? <User size={80} className="mb-8 opacity-90" /> : role === 'volunteer' ? <HeartPulse size={80} className="mb-8 opacity-90" /> : <ShieldAlert size={80} className="mb-8 opacity-90" />}
        <h2 className="text-4xl font-heading font-bold mb-4 text-center">
          {role === 'citizen' ? 'Citizen Portal' : role === 'volunteer' ? 'Responder Portal' : 'Admin Portal'}
        </h2>
        <p className="text-lg opacity-80 text-center max-w-md">
          {role === 'citizen' 
            ? 'Sign in to access emergency tools and report incidents instantly.'
            : role === 'volunteer' ? 'Sign in to your volunteer dashboard to receive and respond to local emergencies.'
            : 'Sign in to manage the system, approve volunteers, and monitor live emergencies.'}
        </p>
      </div>

      {/* Login Form Panel */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-primary-lightRed rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10 glass p-8 rounded-[24px] shadow-2xl"
        >
          
          <h1 className="text-3xl font-heading font-bold text-dark-black mb-2 text-center md:text-left">Sign In</h1>
          <p className="text-text-secondary mb-6 text-center md:text-left text-sm">
            Select your portal and enter your credentials.
          </p>

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

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-dark-gray ml-1 uppercase tracking-wider">Email or Phone</label>
              <input 
                type="text" 
                placeholder="john@example.com"
                className="input-field py-3 px-4 w-full bg-white/60 backdrop-blur-sm border-white/40 focus:bg-white"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="space-y-1 relative">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-dark-gray uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className={`text-xs font-bold hover:underline ${role === 'citizen' ? 'text-blue-600' : 'text-primary-red'}`}>Login via OTP</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="input-field py-3 px-4 w-full bg-white/60 backdrop-blur-sm border-white/40 focus:bg-white pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-dark-gray"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`w-full text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 ${
                role === 'citizen' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : role === 'volunteer' ? 'bg-primary-red hover:bg-primary-darkRed shadow-glow-red' : 'bg-dark-black hover:bg-gray-800 shadow-xl'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In as {role === 'citizen' ? 'Citizen' : role === 'volunteer' ? 'Volunteer' : 'Admin'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          {role !== 'admin' && (
            <div className="mt-8 text-center text-sm text-text-secondary">
              Don't have an account? <Link to="/register" className={`font-bold hover:underline ${role === 'citizen' ? 'text-blue-600' : 'text-primary-red'}`}>Register here</Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
