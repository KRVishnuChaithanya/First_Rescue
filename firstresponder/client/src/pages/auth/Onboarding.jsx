import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, HeartPulse, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "Report Accidents Instantly",
    desc: "Every second counts. Send your location to nearby trained responders with a single tap.",
    icon: <MapPin size={80} className="text-white drop-shadow-md" />,
    color: "bg-primary-red"
  },
  {
    id: 2,
    title: "Volunteers Near You",
    desc: "Our algorithm finds verified medical volunteers within a 5km radius to assist immediately.",
    icon: <Users size={80} className="text-white drop-shadow-md" />,
    color: "bg-warning-amber"
  },
  {
    id: 3,
    title: "Offline First Aid Guides",
    desc: "No internet? No problem. Access life-saving first aid instructions completely offline.",
    icon: <HeartPulse size={80} className="text-white drop-shadow-md" />,
    color: "bg-success-green"
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      navigate('/login');
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-light-gray relative overflow-hidden">
      
      {/* Dynamic Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 ${slides[currentSlide].color} opacity-10`}
        />
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center w-full max-w-sm text-center"
          >
            {/* Icon Bubble */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`${slides[currentSlide].color} w-48 h-48 rounded-full flex items-center justify-center shadow-2xl mb-12 relative`}
            >
              <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 scale-110"></div>
              {slides[currentSlide].icon}
            </motion.div>

            <h2 className="text-3xl font-heading font-bold text-dark-black mb-4">
              {slides[currentSlide].title}
            </h2>
            <p className="text-text-secondary text-base px-4">
              {slides[currentSlide].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="h-32 flex flex-col justify-between p-6 z-10">
        <div className="flex justify-center space-x-2">
          {slides.map((_, index) => (
            <motion.div 
              key={index}
              animate={{ 
                width: currentSlide === index ? 24 : 8,
                backgroundColor: currentSlide === index ? '#E24B4A' : '#E0DED8'
              }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        <div className="flex justify-between items-center w-full max-w-md mx-auto mt-6">
          <button 
            onClick={handleSkip}
            className="text-text-secondary font-bold px-4 py-2 hover:text-dark-black transition"
          >
            Skip
          </button>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="bg-primary-red text-white px-8 py-3 rounded-full font-bold shadow-glow-red flex items-center space-x-2"
          >
            <span>{currentSlide === slides.length - 1 ? "Get Started" : "Next"}</span>
            {currentSlide !== slides.length - 1 && <ChevronRight size={20} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
