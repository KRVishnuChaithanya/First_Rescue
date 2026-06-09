import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // In a real app, check auth state here
      navigate('/onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-dark-black to-primary-darkRed flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            boxShadow: [
              "0 0 0 rgba(226,75,74,0)",
              "0 0 40px rgba(226,75,74,0.6)",
              "0 0 0 rgba(226,75,74,0)"
            ]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="bg-primary-red p-6 rounded-full mb-6 relative"
        >
          <HeartPulse size={64} className="text-white" strokeWidth={1.5} />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl md:text-5xl font-heading font-bold text-white mb-2 tracking-wide"
        >
          FirstResponder
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-light-gray text-lg md:text-xl font-body font-light tracking-wider opacity-80"
        >
          Save lives. Every second counts.
        </motion.p>
      </motion.div>
    </div>
  );
}
