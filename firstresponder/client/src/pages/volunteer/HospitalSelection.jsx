import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Navigation2, Check, MapPin, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HospitalSelection() {
  const navigate = useNavigate();
  const [volLocation, setVolLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Get Location and Fetch REAL nearby hospitals
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setVolLocation({ lat, lng });

        try {
          // We use viewbox and bounded=1 to force the search to stay within a 10km radius of the user
          const offset = 0.1; 
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&viewbox=${lng-offset},${lat-offset},${lng+offset},${lat+offset}&bounded=1&limit=10`;
          
          const response = await fetch(url);
          let data = await response.json();
          
          // Ensure Saveetha Hospital uses its real-world coordinates
          const saveetha = {
            place_id: 'saveetha-local-override',
            name: 'Saveetha Medical College and Hospital',
            display_name: 'Saveetha Nagar, Thandalam, Chennai, Tamil Nadu',
            lat: 13.028822, // Precise Latitude
            lon: 80.002410  // Precise Longitude
          };
          
          if (data && Array.isArray(data)) {
            // Remove any other Saveetha results to avoid duplicates
            data = data.filter(h => h.name && !h.name.toLowerCase().includes('saveetha'));
            data = [saveetha, ...data];
          } else {
            data = [saveetha];
          }

          if (data && data.length > 0) {
            setHospitals(data);
            setSelectedHospital(data[0]); 
          } else {
            // Fallback: If OpenStreetMap has missing tags in this exact location, 
            // generate realistic local fallback data for the demo so it never breaks.
            const fallbacks = [
              {
                place_id: 'mock1',
                name: 'Saveetha Medical College and Hospital',
                display_name: 'Saveetha Nagar, Thandalam, Chennai, Tamil Nadu',
                lat: 13.028822,
                lon: 80.002410
              },
              {
                place_id: 'mock2',
                name: 'Apollo Speciality Hospitals',
                display_name: 'Vanagaram, Chennai, Tamil Nadu',
                lat: 13.0592,
                lon: 80.1554
              },
              {
                place_id: 'mock3',
                name: 'SRM Medical College Hospital',
                display_name: 'Kattankulathur, Chengalpattu, Tamil Nadu',
                lat: 12.8236,
                lon: 80.0435
              }
            ];
            setHospitals(fallbacks);
            setSelectedHospital(fallbacks[0]);
          }
        } catch (error) {
          console.error("Failed to fetch real hospitals:", error);
        } finally {
          setLoading(false);
        }
      });
    }
  }, []);

  const startRouting = () => {
    if (selectedHospital) {
      navigate('/navigation', { 
        state: { 
          isHospitalRoute: true,
          destLat: selectedHospital.lat,
          destLng: selectedHospital.lon,
          address: selectedHospital.name || 'Hospital'
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#e5e3df] relative flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex items-center justify-between pointer-events-none">
        <div className="bg-primary-red/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-red-400 flex items-center space-x-3 text-white">
          <Stethoscope size={24} className="animate-pulse" />
          <span className="font-bold tracking-wide uppercase">Emergency Transport</span>
        </div>
      </div>

      {/* Real Live Map Routing to Selected Hospital */}
      <div className="flex-1 relative z-0">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-100">
            <Activity size={40} className="animate-spin mb-4" />
            <span className="font-bold">Locating nearby hospitals...</span>
          </div>
        ) : selectedHospital && volLocation ? (
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            src={`https://maps.google.com/maps?saddr=${volLocation.lat},${volLocation.lng}&daddr=${selectedHospital.lat},${selectedHospital.lon}&output=embed`}
            className="w-full h-full absolute inset-0"
          ></iframe>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
            No hospitals found in radius.
          </div>
        )}
      </div>

      {/* Bottom Hospital Selection Card */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 relative z-10"
      >
        <h2 className="text-xl font-bold text-dark-black mb-4">Select Destination Facility</h2>
        
        {/* Horizontal scrollable list of real hospitals */}
        <div className="flex space-x-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {hospitals.map((hosp, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedHospital(hosp)}
              className={`min-w-[240px] snap-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedHospital?.place_id === hosp.place_id 
                  ? 'border-[#0F9D58] bg-[#0F9D58]/10' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-dark-black text-sm line-clamp-2 pr-2">
                  {hosp.name || 'General Hospital'}
                </h3>
                {selectedHospital?.place_id === hosp.place_id && (
                  <Check size={18} className="text-[#0F9D58] shrink-0" />
                )}
              </div>
              <div className="flex items-start space-x-1 text-text-secondary">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <p className="text-xs line-clamp-2">
                  {hosp.display_name.split(',').slice(0, 3).join(',')}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={startRouting}
          className="w-full mt-2 bg-[#0F9D58] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#0b8043] transition flex items-center justify-center space-x-2"
        >
          <Navigation2 size={24} />
          <span>START ROUTING TO HOSPITAL</span>
        </button>
      </motion.div>
    </div>
  );
}
