import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, MessageSquare, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveTracking() {
  const navigate = useNavigate();
  const [eta, setEta] = useState(4);
  const [distance, setDistance] = useState(1.2);

  // Simulate ETA counting down as volunteer approaches
  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
      setDistance((prev) => (prev > 0.2 ? Number((prev - 0.2).toFixed(1)) : 0.1));
    }, 10000); // Update every 10 seconds for demo
    return () => clearInterval(timer);
  }, []);

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
        <img 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
          alt="Live Tracking Map" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/5"></div>
        
        {/* Simulated Route Path on Map */}
        <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.4))' }}>
          <path 
            d="M 50,500 C 100,400 200,350 250,200 C 270,100 350,150 400,50" 
            fill="none" 
            stroke="#3B82F6" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeDasharray="10 10"
            className="animate-pulse"
          />
          {/* Volunteer Marker */}
          <circle cx="250" cy="200" r="10" fill="#3B82F6" stroke="white" strokeWidth="3" />
          {/* Incident Marker */}
          <circle cx="400" cy="50" r="10" fill="#E24B4A" stroke="white" strokeWidth="3" />
        </svg>

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
