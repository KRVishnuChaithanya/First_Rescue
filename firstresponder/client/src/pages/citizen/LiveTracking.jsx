import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageSquare, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobal } from '../../context/GlobalState';

export default function LiveTracking() {
  const navigate = useNavigate();
  const { emergencies } = useGlobal();
  const latestEmergency = emergencies.length > 0 ? emergencies[0] : null;
  const targetLat = latestEmergency?.lat || 13.0489;
  const targetLng = latestEmergency?.lng || 80.1116;

  const [eta, setEta] = useState(4);
  const [distance, setDistance] = useState(1.2);
  const [volLocation, setVolLocation] = useState({ lat: targetLat + 0.015, lng: targetLng + 0.015 }); // Start slightly offset

  const calculateDistance = (vLat, vLng, cLat, cLng) => {
    const R = 6371; // Earth radius in km
    const dLat = (cLat - vLat) * Math.PI / 180;
    const dLon = (cLng - vLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(vLat * Math.PI / 180) * Math.cos(cLat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (volLocation && targetLat) {
      const dist = calculateDistance(volLocation.lat, volLocation.lng, targetLat, targetLng);
      setDistance(Number(dist.toFixed(2)));
      setEta(Math.max(1, Math.round(dist * 3))); // roughly 3 mins per km
    }
  }, [volLocation, targetLat, targetLng]);

  // Simulate ETA counting down as volunteer approaches
  useEffect(() => {
    const timer = setInterval(() => {
      setVolLocation((prev) => {
        // Move slightly closer to target
        const diffLat = targetLat - prev.lat;
        const diffLng = targetLng - prev.lng;
        return {
          lat: prev.lat + diffLat * 0.1,
          lng: prev.lng + diffLng * 0.1
        };
      });
    }, 10000); // Update every 10 seconds for demo
    return () => clearInterval(timer);
  }, [targetLat, targetLng]);

  return (
    <div className="min-h-screen bg-light-gray flex flex-col relative overflow-hidden">
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex items-center justify-between">
        <button onClick={() => navigate('/citizen-home')} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
          <ArrowLeft size={20} className="text-dark-black" />
        </button>
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-gray-100 flex items-center space-x-2">
          <span className="w-2 h-2 bg-primary-red rounded-full animate-ping"></span>
          <span className="text-xs font-bold text-dark-black tracking-wide uppercase">Live Rescue</span>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative z-0">
        {targetLat && volLocation ? (
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            src={`https://maps.google.com/maps?saddr=${volLocation.lat},${volLocation.lng}&daddr=${targetLat},${targetLng}&output=embed`}
            className="absolute inset-0"
          ></iframe>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200 font-bold text-gray-500">
            Connecting to GPS...
          </div>
        )}

        {/* Floating ETA Label */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-[40%] left-1/2 transform -translate-x-1/2 bg-dark-black text-white px-4 py-2 rounded-xl font-bold shadow-xl flex items-center space-x-2"
        >
          <span>{eta} min away</span>
        </motion.div>
      </div>

      {/* Bottom Responder Card */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 relative z-10"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-dark-black">Volunteer en route</h2>
            <p className="text-text-secondary text-sm">They are {distance} km away from your location.</p>
          </div>
          <div className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-lg text-sm border border-blue-100">
            ETA: {eta} min
          </div>
        </div>

        {/* Responder Details */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center space-x-4 mb-6 border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">JD</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-dark-black">John Doe</h3>
            <p className="text-xs text-text-secondary">Certified Paramedic</p>
          </div>
          <Shield className="text-success-green" size={24} />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 py-4 rounded-xl border border-gray-200 text-dark-black font-bold hover:bg-gray-50 transition">
            <MessageSquare size={20} />
            <span>Message</span>
          </button>
          <button className="flex items-center justify-center space-x-2 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition">
            <Phone size={20} />
            <span>Call</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
