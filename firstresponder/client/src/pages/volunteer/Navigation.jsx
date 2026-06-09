import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation2, MapPin, X, ArrowUpLeft, Phone, Mic, ShieldAlert, Building2 } from 'lucide-react';
import { useGlobal } from '../../context/GlobalState';
import toast from 'react-hot-toast';

export default function Navigation() {
  const navigate = useNavigate();
  const locationState = useLocation().state || {};
  const { emergencies, resolveLatestEmergency, recordSuccessfulRescue } = useGlobal();
  const [eta, setEta] = useState('Calculating...');
  const [distance, setDistance] = useState('0');
  const [volLocation, setVolLocation] = useState(null);

  const { isHospitalRoute, destLat, destLng, address } = locationState;

  const latestEmergency = emergencies.length > 0 ? emergencies[emergencies.length - 1] : null;

  useEffect(() => {
    if (!latestEmergency && !isHospitalRoute) {
      navigate('/volunteer-home');
    }
  }, [latestEmergency, isHospitalRoute, navigate]);

  // Use real-world fallback coordinates (Chembarambakkam area) if the emergency object lacks them
  const targetLat = isHospitalRoute ? destLat : (latestEmergency?.lat || 13.048920);
  const targetLng = isHospitalRoute ? destLng : (latestEmergency?.lng || 80.111610);
  const targetAddress = isHospitalRoute ? address : (latestEmergency?.location || latestEmergency?.address || 'Emergency Scene');

  // Get real location and calculate distance
  useEffect(() => {
    if (navigator.geolocation && targetLat && targetLng) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const volLat = pos.coords.latitude;
        const volLng = pos.coords.longitude;
        const citLat = targetLat;
        const citLng = targetLng;
        
        setVolLocation({ lat: volLat, lng: volLng });

        // Haversine
        const R = 6371; 
        const dLat = (citLat - volLat) * Math.PI / 180;
        const dLon = (citLng - volLng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(volLat * Math.PI / 180) * Math.cos(citLat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        let distanceKm = R * c;

        setDistance(distanceKm.toFixed(2));
        const etaMins = Math.round(distanceKm * 3);
        setEta(`${etaMins} min`);
      });
    }
  }, [targetLat, targetLng]);

  const handleEndNavigation = () => {
    if (isHospitalRoute) {
      toast.success("Patient successfully transferred to hospital.");
      // Record the success for their stats panel and history
      recordSuccessfulRescue(latestEmergency, { name: targetAddress });
      resolveLatestEmergency(); // Remove it from the active emergencies list!
      navigate('/volunteer-home'); // Mission complete
    } else {
      navigate('/hospital-selection');
    }
  };

  return (
    <div className="min-h-screen bg-[#e5e3df] relative flex flex-col overflow-hidden">
      {/* Real Live Map Background */}
      <div className="absolute inset-0 z-0">
        {volLocation && targetLat ? (
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            src={`https://maps.google.com/maps?saddr=${volLocation.lat},${volLocation.lng}&daddr=${targetLat},${targetLng}&output=embed`}
            className="w-full h-full"
          ></iframe>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
            Acquiring GPS Signal...
          </div>
        )}
      </div>

      {/* Top Navigation Instructions (Google Maps Style Green Header) */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-10 bg-[#0F9D58] text-white rounded-b-3xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ArrowUpLeft size={48} strokeWidth={2.5} />
            <div>
              <p className="text-3xl font-heading font-black tracking-wide">Straight</p>
              <p className="text-lg font-medium text-white/90">Head to {targetAddress}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Action Buttons */}
      <div className="absolute top-36 right-4 flex flex-col space-y-3 z-10">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50">
          <Mic size={24} />
        </button>
        <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 hover:bg-gray-50">
          <Phone size={24} />
        </button>
      </div>

      <div className="flex-grow"></div>

      {/* Bottom Status Card */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="relative z-10 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6"
      >
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-4xl font-heading font-black text-[#0F9D58]">{eta}</h2>
            <p className="text-gray-500 font-medium text-lg">{distance} km • Real-time Routing</p>
          </div>
          <button 
            onClick={handleEndNavigation}
            className="bg-primary-red text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-red-500/30 hover:bg-primary-darkRed transition"
          >
            Arrived
          </button>
        </div>

        {/* Emergency/Hospital Info Banner */}
        <div className="bg-gray-100 rounded-2xl p-4 flex items-center space-x-3 mb-2 border border-gray-200">
          <div className={`p-2 rounded-full ${isHospitalRoute ? 'bg-blue-600' : 'bg-primary-red'}`}>
            {isHospitalRoute ? <Building2 size={20} className="text-white" /> : <ShieldAlert size={20} className="text-white" />}
          </div>
          <div className="flex-1">
            <p className="font-bold text-dark-black text-sm">{isHospitalRoute ? targetAddress : latestEmergency?.type}</p>
            <p className="text-xs text-text-secondary">
              {isHospitalRoute ? 'Hospital Destination' : `Severity: ${latestEmergency?.severity} • Victims: ${latestEmergency?.victims}`}
            </p>
          </div>
          <button onClick={() => navigate('/volunteer-home')} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <button 
          onClick={() => {
            if (volLocation && targetLat) {
              window.open(`https://www.google.com/maps/dir/?api=1&origin=${volLocation.lat},${volLocation.lng}&destination=${targetLat},${targetLng}`, '_blank');
            }
          }}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex items-center justify-center space-x-2"
        >
          <Navigation2 size={24} />
          <span>OPEN IN MAPS APP</span>
        </button>
      </motion.div>
    </div>
  );
}
