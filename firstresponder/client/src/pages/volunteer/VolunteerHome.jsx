import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Power, MapPin, Award, Clock, Heart, ChevronRight, Activity, Bell, XCircle } from 'lucide-react';
import BottomNav from '../../components/common/BottomNav';
import { useGlobal } from '../../context/GlobalState';
import toast from 'react-hot-toast';

export default function VolunteerHome() {
  const navigate = useNavigate();
  const { emergencies, volunteerStats, isOnDuty, setIsOnDuty, dutySeconds, currentUser } = useGlobal();
  const [previousCount, setPreviousCount] = useState(emergencies.length);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const formatDutyTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Real-time listener for incoming emergencies (acting as WebSockets/FCM)
  React.useEffect(() => {
    if (emergencies.length > previousCount) {
      if (isOnDuty) {
        // A new emergency came in and we are on duty! Redirect to incoming alert screen.
        navigate('/alert/incoming');
      }
      setPreviousCount(emergencies.length);
    }
  }, [emergencies, isOnDuty, navigate, previousCount]);

  return (
    <div className="min-h-screen bg-light-gray pb-24">
      {/* Header with Topographic background and Toggle */}
      <div className="bg-dark-black text-white rounded-b-[40px] px-6 pt-12 pb-8 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        <div className="flex justify-between items-center relative z-10 mb-8">
          <div>
            <p className="text-text-tertiary text-sm font-medium">
              Hello, {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() + currentUser.name.slice(1).split(' ')[0] : 'Volunteer'}
            </p>
            <h1 className="text-2xl font-heading font-bold">Volunteer Panel</h1>
          </div>
          
          {/* Main Duty Toggle */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isOnDuty 
                  ? 'bg-success-green shadow-glow-green text-white' 
                  : 'bg-dark-gray border border-gray-700 text-gray-500'
              }`}
            >
              <Power size={32} />
            </button>
            <span className={`text-xs font-bold mt-2 ${isOnDuty ? 'text-success-green' : 'text-gray-500'}`}>
              {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
            </span>
          </div>
        </div>

        {/* Real-time Dynamic Stats Dashboard */}
        <div className="grid grid-cols-3 gap-4 p-6 pt-0">
          <div className="bg-[#1e1e1e] rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg border border-white/5">
            <Heart size={20} className="text-primary-red mb-2" />
            <h3 className="text-white font-heading font-bold text-2xl">{volunteerStats?.rescues || 0}</h3>
            <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mt-1">Rescues</p>
          </div>
          
          <div className="bg-[#1e1e1e] rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg border border-white/5">
            <Award size={20} className="text-yellow-500 mb-2" />
            <h3 className="text-white font-heading font-bold text-2xl">{volunteerStats?.rating?.toFixed(1) || '5.0'}</h3>
            <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mt-1">Rating</p>
          </div>
          
          <div className="bg-[#1e1e1e] rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg border border-white/5">
            <Clock size={20} className="text-blue-400 mb-2" />
            <h3 className="text-white font-heading font-bold text-2xl">{formatDutyTime(dutySeconds)}</h3>
            <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mt-1">Duty Time</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-4 relative z-20">
        
        {/* Status Card based on Duty */}
        {isOnDuty ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 shadow-card border border-border flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 flex items-center justify-center bg-success-light rounded-full">
                <span className="absolute inset-0 rounded-full bg-success-green animate-ping opacity-20"></span>
                <Activity size={24} className="text-success-green relative z-10" />
              </div>
              <div>
                <h3 className="font-bold text-dark-black">Monitoring Area</h3>
                <p className="text-sm text-text-secondary">Alert radius: 5.0 km</p>
              </div>
            </div>
            <button 
              onClick={() => {
                if (emergencies && emergencies.length > 0) {
                  navigate('/alert/incoming');
                } else {
                  toast.error("No active emergencies in your radius right now.");
                }
              }} 
              className="bg-primary-red text-white px-8 py-3 rounded-2xl text-base font-bold shadow-glow-red hover:bg-primary-darkRed transition"
            >
              Alerts
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 shadow-card border border-border flex items-center space-x-4 opacity-75"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
              <Power size={24} className="text-gray-400" />
            </div>
            <div>
              <h3 className="font-bold text-dark-black">You are Offline</h3>
              <p className="text-sm text-text-secondary">Toggle power to receive alerts</p>
            </div>
          </motion.div>
        )}

        {/* Action Menu */}
        <div>
          <h2 className="text-lg font-heading font-bold text-dark-black mb-4 px-2">Quick Actions</h2>
          <div className="bg-white rounded-3xl shadow-card border border-border overflow-hidden">
            <ActionRow icon={<MapPin className="text-blue-500" />} title="Adjust Alert Radius" subtitle="Currently set to 5km" />
            <div className="h-px w-full bg-border"></div>
            <ActionRow icon={<Heart className="text-primary-red" />} title="First Aid Guides" subtitle="Review offline materials" onClick={() => navigate('/first-aid', { state: { isVolunteer: true } })} />
            <div className="h-px w-full bg-border"></div>
            <ActionRow icon={<Clock className="text-warning-amber" />} title="Rescue History" subtitle="View past interventions" onClick={() => navigate('/rescue-history')} />
          </div>
        </div>

        {/* Map Preview */}
        <div className="bg-white rounded-3xl p-2 shadow-card border border-border">
          <div 
            onClick={() => setShowLocationModal(true)}
            className="h-32 bg-gray-200 rounded-2xl relative overflow-hidden flex items-center justify-center group cursor-pointer"
          >
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80" 
              alt="Map" 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
              <MapPin size={32} className="text-primary-red mb-2 drop-shadow-md" />
              <span className="bg-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                View My Location
              </span>
            </div>
          </div>
        </div>

      </div>

      <BottomNav role="volunteer" />

      {/* Live Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h3 className="font-heading font-bold text-lg text-dark-black flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />
                Live Tracking Status
              </h3>
              <button onClick={() => setShowLocationModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-2">
              <div className="w-full h-[300px] rounded-2xl overflow-hidden relative border border-border">
                <iframe
                  title="Volunteer Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15545.923838423233!2d80.22271815!3d13.06869485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5266732dc1f6bd%3A0xc3f67073c7e47260!2sNungambakkam%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                {/* Pulse marker over the center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-50 w-10 h-10 -ml-2 -mt-2"></span>
                  <div className="bg-blue-600 w-6 h-6 rounded-full border-2 border-white shadow-lg relative z-10 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 bg-gray-50 flex justify-between items-center border-t border-border">
              <div>
                <p className="text-sm font-bold text-dark-black">Connected to GPS</p>
                <p className="text-xs text-text-secondary mt-0.5">Accuracy: ~3.5 meters</p>
              </div>
              <button onClick={() => setShowLocationModal(false)} className="px-5 py-2 bg-dark-black hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition shadow-md">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ActionRow({ icon, title, subtitle, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition">
      <div className="flex items-center space-x-4">
        <div className="bg-gray-100 p-3 rounded-xl">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-dark-black text-sm">{title}</h4>
          <p className="text-xs text-text-secondary">{subtitle}</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-text-tertiary" />
    </div>
  );
}
