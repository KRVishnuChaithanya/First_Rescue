import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation2, Activity, ArrowLeft, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HospitalFinder() {
  const navigate = useNavigate();
  const [userLoc, setUserLoc] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLoc({ lat, lng });

        try {
          // Find real hospitals
          const offset = 0.1;
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&viewbox=${lng-offset},${lat-offset},${lng+offset},${lat+offset}&bounded=1&limit=10`;
          
          const response = await fetch(url);
          let data = await response.json();
          
          // Inject correct Saveetha Medical College coordinates for realism
          const saveetha = {
            place_id: 'saveetha-citizen',
            name: 'Saveetha Medical College and Hospital',
            display_name: 'Saveetha Nagar, Thandalam, Chennai, Tamil Nadu',
            lat: 13.028822,
            lon: 80.002410
          };
          
          if (data && Array.isArray(data)) {
            data = data.filter(h => h.name && !h.name.toLowerCase().includes('saveetha'));
            data = [saveetha, ...data];
          } else {
            data = [saveetha];
          }

          if (data && data.length > 0) {
            setHospitals(data);
            setSelectedHospital(data[0]);
          }
        } catch (error) {
          console.error("Geocoding failed", error);
        } finally {
          setLoading(false);
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-light-gray flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex items-center bg-gradient-to-b from-white/90 to-transparent pointer-events-none">
        <button onClick={() => navigate(-1)} className="pointer-events-auto bg-white p-3 rounded-full shadow-md mr-4 text-dark-black hover:bg-gray-50 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-heading font-bold text-dark-black drop-shadow-sm">Nearby ERs</h1>
          <p className="text-xs font-medium text-text-secondary">Live Coordinated Map</p>
        </div>
      </div>

      {/* Live Map Area */}
      <div className="flex-1 relative z-0 bg-gray-200">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
            <Activity size={40} className="animate-spin mb-4 text-blue-600" />
            <span className="font-bold text-sm">Accessing GPS Coordinates...</span>
          </div>
        ) : selectedHospital && userLoc ? (
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            src={`https://maps.google.com/maps?saddr=${userLoc.lat},${userLoc.lng}&daddr=${selectedHospital.lat},${selectedHospital.lon}&output=embed`}
            className="w-full h-full absolute inset-0"
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
            Unable to determine location.
          </div>
        )}
      </div>

      {/* Hospital Selection Panel */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.1)] p-6 relative z-10"
      >
        <h2 className="text-lg font-bold text-dark-black mb-4 flex items-center">
          <Building2 size={20} className="text-blue-600 mr-2" />
          Available Emergency Rooms
        </h2>
        
        <div className="flex space-x-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {hospitals.map((hosp, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedHospital(hosp)}
              className={`min-w-[260px] snap-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedHospital?.place_id === hosp.place_id 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-dark-black text-sm line-clamp-2 pr-2">
                  {hosp.name || 'General Hospital'}
                </h3>
              </div>
              <div className="flex items-start space-x-1 text-text-secondary">
                <MapPin size={14} className="mt-0.5 shrink-0 text-blue-500" />
                <p className="text-xs line-clamp-2 font-medium">
                  {hosp.display_name.split(',').slice(0, 3).join(',')}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => {
            if(selectedHospital) {
              window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${selectedHospital.lat},${selectedHospital.lon}`, '_blank');
            }
          }}
          className="w-full mt-4 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex items-center justify-center space-x-2"
        >
          <Navigation2 size={24} />
          <span>OPEN IN MAPS APP</span>
        </button>
      </motion.div>
    </div>
  );
}
