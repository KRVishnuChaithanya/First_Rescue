import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Users, Clock, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobal } from '../../context/GlobalState';

export default function IncomingAlert() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds
  const [calcDistance, setCalcDistance] = useState('Calculating...');
  const [calcEta, setCalcEta] = useState('Calculating...');
  const [volLocation, setVolLocation] = useState({ lat: 13.0288, lng: 80.0024 }); // Default fallback to Saveetha
  const controls = useAnimation();
  const { emergencies } = useGlobal();

  const latestEmergency = emergencies.length > 0 ? emergencies[emergencies.length - 1] : null;

  const handleDecline = (reason = "Declined") => {
    toast.error(`Alert ${reason}. Forwarding to the next nearby volunteer...`, { duration: 4000 });
    navigate('/volunteer-home');
  };

  useEffect(() => {
    if (!latestEmergency) {
      navigate('/volunteer-home');
      return;
    }
    // Flashing background animation
    controls.start({
      backgroundColor: ["#E24B4A", "#A32D2D", "#E24B4A"],
      transition: { duration: 1.5, repeat: Infinity }
    });

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDecline("Time expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Calculate actual distance between volunteer and incident
    if (latestEmergency.lat && latestEmergency.lng) {
      
      const calculateDistance = (volLat, volLng) => {
        const R = 6371; // Earth radius in km
        const dLat = (latestEmergency.lat - volLat) * Math.PI / 180;
        const dLon = (latestEmergency.lng - volLng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(volLat * Math.PI / 180) * Math.cos(latestEmergency.lat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        let distanceKm = R * c;

        setCalcDistance(`${distanceKm.toFixed(2)} km away`);
        const etaMins = Math.round(distanceKm * 3); // rough estimate: 3 mins per km
        setCalcEta(`~${etaMins} mins travel`);
        setVolLocation({ lat: volLat, lng: volLng });
      };

      // Immediately calculate with fallback first so UI doesn't hang
      calculateDistance(13.0288, 80.0024);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => calculateDistance(pos.coords.latitude, pos.coords.longitude), 
          () => {}, 
          { timeout: 3000 } // Fail fast if permission hangs
        );
      }
    }

    return () => clearInterval(timer);
  }, [latestEmergency.lat, latestEmergency.lng]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    toast.success("Alert Accepted! Calculating fastest route...");
    navigate('/navigation');
  };

  if (!latestEmergency) return null;

  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <motion.div 
      animate={controls}
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-white"
    >
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="mb-8 flex flex-col items-center"
      >
        <AlertTriangle size={80} className="text-white mb-4 drop-shadow-lg" />
        <h1 className="text-4xl font-heading font-black tracking-wider text-center drop-shadow-md">
          ACCIDENT<br/>NEARBY
        </h1>
      </motion.div>

      <div className="w-full max-w-md bg-white text-dark-black rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Progress Bar at top of card */}
        <div className="absolute top-0 left-0 h-2 bg-gray-200 w-full">
          <div 
            className="h-full bg-primary-red transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-start mt-2 mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-1 text-[10px] rounded font-bold animate-pulse uppercase ${
                latestEmergency.severity === 'Severe' ? 'bg-red-100 text-red-600 border border-red-200' :
                latestEmergency.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' :
                'bg-green-100 text-green-600 border border-green-200'
              }`}>
                {latestEmergency.severity || 'HIGH'} SEVERITY
              </span>
            </div>
            <h2 className="text-2xl font-bold font-heading">{latestEmergency.type}</h2>
            <p className="text-sm text-text-secondary">Severity: {latestEmergency.severity} • Victims: {latestEmergency.victims}</p>
          </div>
          
          {/* Circular Countdown Timer */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#f3f4f6" strokeWidth="6" />
              <circle 
                cx="50%" cy="50%" r="45%" 
                fill="none" 
                stroke={timeLeft < 10 ? "#E24B4A" : "#2E7D32"} 
                strokeWidth="6"
                strokeDasharray={`${(progressPercentage / 100) * 180} 200`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className={`font-bold ${timeLeft < 10 ? 'text-primary-red' : 'text-success-green'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3">
            <MapPin className="text-text-tertiary mt-0.5" size={20} />
            <div>
              <p className="font-bold text-sm">{latestEmergency.address || 'Anna Salai, Near Mount Road'}</p>
              <p className="text-xs text-text-secondary">
                {calcDistance || latestEmergency.distance || 'Calculating...'} • {calcEta || latestEmergency.eta || 'Calculating...'}
              </p>
              <p className="text-[10px] text-gray-400 font-mono mt-1">Live GPS: {latestEmergency.location || '13.0604° N, 80.2495° E'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="text-text-tertiary" size={20} />
            <p className="font-bold text-sm">{latestEmergency.victims} Victims reported</p>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="text-text-tertiary" size={20} />
            <p className="font-bold text-sm">Reported 1 minute ago</p>
          </div>
        </div>

        {/* Live Route Map Iframe */}
        <div className="w-full h-40 bg-gray-200 rounded-xl mb-8 relative overflow-hidden shadow-inner border border-gray-200">
          {volLocation && latestEmergency.lat ? (
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight="0" 
              marginWidth="0" 
              src={`https://maps.google.com/maps?saddr=${volLocation.lat},${volLocation.lng}&daddr=${latestEmergency.lat},${latestEmergency.lng}&output=embed`}
              className="absolute inset-0"
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 font-bold bg-gray-100">
              Calculating Route...
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDecline()}
            className="py-4 border-2 border-primary-red text-primary-red rounded-xl font-bold flex flex-col items-center justify-center space-y-1 bg-white hover:bg-primary-lightRed"
          >
            <X size={24} />
            <span>DECLINE</span>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleAccept}
            className="py-4 bg-success-green text-white rounded-xl font-bold flex flex-col items-center justify-center space-y-1 shadow-glow-green"
          >
            <Check size={24} />
            <span>ACCEPT</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
