import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, Droplet, Bone, Flame, Wind, Activity, WifiOff, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';

export default function FirstAidList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const isVolunteer = location.state?.isVolunteer || false;

  const guides = [
    { id: 'cpr', title: 'CPR', desc: 'Cardiopulmonary Resuscitation', icon: <Heart size={32} />, color: 'bg-[#E24B4A]', textColor: 'text-white' },
    { id: 'bleeding', title: 'Bleeding', desc: 'Stop severe bleeding', icon: <Droplet size={32} />, color: 'bg-[#A32D2D]', textColor: 'text-white' },
    { id: 'fracture', title: 'Fractures', desc: 'Broken bones & splints', icon: <Bone size={32} />, color: 'bg-[#F97316]', textColor: 'text-white' },
    { id: 'burns', title: 'Burns', desc: 'Thermal & chemical burns', icon: <Flame size={32} />, color: 'bg-[#F59E0B]', textColor: 'text-white' },
    { id: 'choking', title: 'Choking', desc: 'Heimlich maneuver', icon: <Wind size={32} />, color: 'bg-[#3B82F6]', textColor: 'text-white' },
    { id: 'unconscious', title: 'Unconscious', desc: 'Recovery position', icon: <Activity size={32} />, color: 'bg-[#8B5CF6]', textColor: 'text-white' },
  ];

  const filteredGuides = guides.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-light-gray pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm rounded-b-3xl relative z-10">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-4 text-dark-black hover:text-primary-red transition">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-2xl font-heading font-bold text-dark-black">First Aid Guides</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search symptoms or injuries..."
            className="w-full bg-gray-100 border-none rounded-2xl py-4 pl-12 pr-4 text-dark-black focus:ring-2 focus:ring-primary-red outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Guide Grid */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-dark-black">All Guides</h2>
          <div className="flex items-center space-x-1 bg-gray-200 px-2 py-1 rounded-full text-xs font-bold text-text-secondary">
            <WifiOff size={12} />
            <span>Available Offline</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredGuides.map((guide, i) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/first-aid/${guide.id}`, { state: { isVolunteer } })}
              className={`${guide.color} ${guide.textColor} rounded-3xl p-5 shadow-lg relative overflow-hidden cursor-pointer flex flex-col h-40`}
            >
              {/* Decorative circle */}
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white opacity-10"></div>
              
              <div className="mb-auto">
                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  {guide.icon}
                </div>
              </div>
              
              <div>
                <h3 className="font-heading font-bold text-lg leading-tight mb-1">{guide.title}</h3>
                <p className="text-xs opacity-90 line-clamp-2">{guide.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center text-text-secondary py-12">
            <p>No guides found for "{searchTerm}"</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
