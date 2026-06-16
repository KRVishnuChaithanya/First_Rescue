import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ArrowRight } from 'lucide-react';

export default function ReportStep1() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("123 Mount Road, Chennai");

  return (
    <div className="h-screen flex flex-col bg-light-gray relative">
      {/* Header */}
      <div className="absolute top-0 w-full z-10 p-6 pt-10">
        <div className="glass rounded-full px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-bold text-dark-black">Step 1 of 3</span>
          <div className="flex space-x-1">
            <div className="w-6 h-1.5 bg-primary-red rounded-full"></div>
            <div className="w-6 h-1.5 bg-gray-300 rounded-full"></div>
            <div className="w-6 h-1.5 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-grow bg-gray-300 relative">
        <img 
          src="https://maps.googleapis.com/maps/api/staticmap?center=13.0604,80.2495&zoom=15&size=800x800&key=YOUR_API_KEY" 
          alt="Map" 
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        
        {/* Custom Red Pin Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full flex flex-col items-center">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="bg-primary-red text-white p-3 rounded-full shadow-glow-red"
          >
            <MapPin size={32} />
          </motion.div>
          <div className="w-3 h-1 bg-black/30 rounded-full mt-1 blur-[1px]"></div>
        </div>

        {/* GPS Button */}
        <button className="absolute bottom-6 right-6 bg-white p-3 rounded-full shadow-lg text-primary-red border border-gray-100 hover:bg-gray-50">
          <Navigation size={24} />
        </button>
      </div>

      {/* Bottom Card */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="bg-white rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-20"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <h2 className="text-2xl font-heading font-bold text-dark-black mb-2">Accident Location</h2>
        <p className="text-text-secondary text-sm mb-6">Drag the map to pin the exact location of the emergency.</p>
        
        <div className="bg-gray-50 border border-border rounded-xl p-4 flex items-center space-x-3 mb-6">
          <MapPin className="text-primary-red shrink-0" size={24} />
          <input 
            type="text" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-transparent border-none focus:ring-0 w-full font-medium text-dark-black p-0"
          />
        </div>

        <button 
          onClick={() => navigate('/report/step2')}
          className="w-full btn-primary py-4 flex items-center justify-center space-x-2 text-lg font-bold rounded-xl"
        >
          <span>Confirm Location</span>
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}
