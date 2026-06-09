import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, MapPin, Building2, ShieldAlert } from 'lucide-react';
import { useGlobal } from '../../context/GlobalState';
import BottomNav from '../../components/common/BottomNav';

export default function RescueHistory() {
  const navigate = useNavigate();
  const { rescueHistory } = useGlobal();

  return (
    <div className="min-h-screen bg-light-gray pb-12">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm rounded-b-3xl relative z-10 flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 text-dark-black hover:text-primary-red transition">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-2xl font-heading font-bold text-dark-black">Rescue History</h1>
      </div>

      <div className="px-6 space-y-4">
        {(!rescueHistory || rescueHistory.length === 0) ? (
          <div className="text-center py-12 text-gray-500">
            <Clock size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold text-lg">No past rescues found.</p>
            <p className="text-sm">Completed missions will appear here.</p>
          </div>
        ) : (
          rescueHistory.map((rescue, index) => (
            <div key={index} className="bg-white rounded-3xl p-5 shadow-card border border-border">
              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-lightRed p-2 rounded-xl">
                    <ShieldAlert className="text-primary-red" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-black">{rescue.type}</h3>
                    <p className="text-xs text-text-secondary">{rescue.date} • {rescue.time}</p>
                  </div>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold font-mono text-gray-600">
                  {rescue.id}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-sm">
                  <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Incident Location</p>
                    <p className="text-gray-500 text-xs">{rescue.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-sm">
                  <Building2 size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Admitted To</p>
                    <p className="text-gray-500 text-xs">{rescue.hospitalName}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-500">Severity: <span className="font-bold text-dark-black">{rescue.severity}</span></span>
                <span className="text-gray-500">Victims Rescued: <span className="font-bold text-primary-red">{rescue.victims}</span></span>
              </div>
            </div>
          ))
        )}
      </div>
      <BottomNav role="volunteer" />
    </div>
  );
}
