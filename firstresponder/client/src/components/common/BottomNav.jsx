import React from 'react';
import { Home, Map as MapIcon, BookOpen, User, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav({ role = 'citizen' }) {
  const location = useLocation();
  const navigate = useNavigate();

  const citizenNav = [
    { icon: <Home size={24} />, label: 'Home', path: '/citizen-home' },
    { icon: <MapIcon size={24} />, label: 'Map', path: '/hospitals' },
    { icon: <BookOpen size={24} />, label: 'Guide', path: '/first-aid' },
    { icon: <User size={24} />, label: 'Profile', path: '/citizen-profile' },
  ];

  const volunteerNav = [
    { icon: <Home size={24} />, label: 'Home', path: '/volunteer-home' },
    { icon: <Clock size={24} />, label: 'History', path: '/rescue-history' },
    { icon: <User size={24} />, label: 'Profile', path: '/volunteer-profile' },
  ];

  const navItems = role === 'volunteer' ? volunteerNav : citizenNav;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border pb-safe pt-2 px-6 flex justify-between items-center z-50">
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-16 h-14 transition-colors ${
              isActive ? 'text-primary-red' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
