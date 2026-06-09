import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Camera, Lock, User, Mail, Phone, Droplet, ShieldCheck, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import BottomNav from '../../components/common/BottomNav';
import { useGlobal } from '../../context/GlobalState';

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const { currentUser, logoutUser, updatePassword } = useGlobal();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const isVolunteer = location.pathname.includes('volunteer');

  // Fallback if no user is logged in
  const user = currentUser || {
    name: 'Guest User',
    email: 'guest@example.com',
    phone: 'Not Provided',
    bloodGroup: 'Unknown',
    role: isVolunteer ? 'Unregistered Volunteer' : 'Unregistered Citizen'
  };

  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80');

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a local object URL for immediate preview
      const newImageUrl = URL.createObjectURL(file);
      setProfilePic(newImageUrl);
      toast.success("Profile picture updated successfully!");
    }
  };

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    navigate('/login');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    updatePassword(user.email, newPassword);
    toast.success("Password changed successfully! You can use it for your next login.");
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
  };

  return (
    <div className="min-h-screen bg-light-gray pb-12">
      {/* Header */}
      <div className="bg-dark-black text-white px-6 pt-12 pb-24 shadow-sm rounded-b-[40px] relative z-10">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="hover:opacity-75 transition">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-xl font-heading font-bold">My Profile</h1>
          <div className="w-7"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      <div className="px-6 -mt-20 relative z-20 space-y-6">
        
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer" onClick={handleImageClick}>
            <img 
              src={profilePic} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl bg-gray-200"
            />
            <div className="absolute bottom-0 right-0 bg-[#0F9D58] p-2 rounded-full border-2 border-white shadow-md hover:scale-110 transition">
              <Camera size={18} className="text-white" />
            </div>
            
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <h2 className="text-2xl font-heading font-black text-dark-black mt-4">{user.name}</h2>
          <div className="flex items-center space-x-1 text-[#0F9D58] mt-1 bg-green-50 px-3 py-1 rounded-full">
            <ShieldCheck size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">{user.role}</span>
          </div>
        </div>

        {/* Security Notice Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start space-x-3 mt-8">
          <Lock className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-bold text-dark-black">Profile Data Locked</h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              For security and verification purposes, signup details cannot be modified. Please contact a System Administrator if your legal details need to be updated.
            </p>
          </div>
        </div>

        {/* Locked Form Fields */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-border space-y-5">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Full Name</label>
            <div className="flex items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
              <User size={18} className="text-gray-400 mr-3" />
              <input 
                type="text" 
                value={user.name} 
                readOnly 
                className="bg-transparent w-full outline-none text-dark-black font-medium cursor-not-allowed"
              />
              <Lock size={14} className="text-gray-300 ml-2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Email Address</label>
            <div className="flex items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
              <Mail size={18} className="text-gray-400 mr-3" />
              <input 
                type="email" 
                value={user.email} 
                readOnly 
                className="bg-transparent w-full outline-none text-dark-black font-medium cursor-not-allowed"
              />
              <Lock size={14} className="text-gray-300 ml-2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Phone Number</label>
            <div className="flex items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
              <Phone size={18} className="text-gray-400 mr-3" />
              <input 
                type="tel" 
                value={user.phone} 
                readOnly 
                className="bg-transparent w-full outline-none text-dark-black font-medium cursor-not-allowed"
              />
              <Lock size={14} className="text-gray-300 ml-2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Blood Group</label>
            <div className="flex items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
              <Droplet size={18} className="text-primary-red mr-3" />
              <input 
                type="text" 
                value={user.bloodGroup} 
                readOnly 
                className="bg-transparent w-full outline-none text-dark-black font-medium cursor-not-allowed"
              />
              <Lock size={14} className="text-gray-300 ml-2" />
            </div>
          </div>

        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-border">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Lock className="text-warning-amber" size={20} />
              <h3 className="font-bold text-dark-black">Security</h3>
            </div>
            <button 
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordChange} className="space-y-4 mt-4 pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">New Password</label>
                <input 
                  type="password" required minLength="6"
                  className="input-field w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white"
                  placeholder="••••••••"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Confirm New Password</label>
                <input 
                  type="password" required minLength="6"
                  className="input-field w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white"
                  placeholder="••••••••"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-dark-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition"
              >
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white text-primary-red border-2 border-red-100 py-4 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center space-x-2"
        >
          <LogOut size={20} />
          <span>LOGOUT</span>
        </button>

      </div>
      
      {/* Dynamic Bottom Nav */}
      <BottomNav role={isVolunteer ? 'volunteer' : 'citizen'} />
    </div>
  );
}
