import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Activity, MapPin, Clock, Calendar, CheckCircle, Clock3 } from 'lucide-react';
import { useGlobal } from '../../context/GlobalState';
import { motion } from 'framer-motion';

export default function CitizenHistory() {
  const navigate = useNavigate();
  const { citizenReports } = useGlobal();

  return (
    <div className="min-h-screen bg-light-gray pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm rounded-b-3xl relative z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
          <ArrowLeft size={24} className="text-dark-black" />
        </button>
        <div>
          <h1 className="text-2xl font-heading font-bold text-dark-black">My Reports</h1>
          <p className="text-xs font-medium text-text-secondary">Your SOS History</p>
        </div>
      </div>

      <div className="p-6">
        {citizenReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-dark-black mb-2">No Reports Yet</h3>
            <p className="text-sm text-text-secondary max-w-xs">
              When you report an emergency using the SOS button, the details will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {citizenReports.map((report, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={report.id || idx} 
                className="bg-white rounded-3xl p-5 shadow-card border border-border"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${
                      report.severity === 'Severe' ? 'bg-primary-lightRed' : 
                      report.severity === 'Moderate' ? 'bg-warning-light' : 'bg-green-50'
                    }`}>
                      <Activity size={24} className={
                        report.severity === 'Severe' ? 'text-primary-red' : 
                        report.severity === 'Moderate' ? 'text-warning-amber' : 'text-green-600'
                      } />
                    </div>
                    <div>
                      <h3 className="font-bold text-dark-black">{report.type || 'Emergency'}</h3>
                      <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold mt-0.5">
                        Severity: {report.severity} • {report.victims} Victim(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-text-secondary text-xs font-bold">
                    <span className="bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                      ID: {report.incidentId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <Calendar size={14} />
                    <span className="text-xs">{new Date(report.id).toLocaleDateString() || 'Today'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <Clock size={14} />
                    <span className="text-xs">{report.timestamp || 'N/A'}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl flex items-start space-x-2 mb-4 border border-gray-100">
                  <MapPin size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-dark-black font-medium line-clamp-2">
                    {report.address || report.location || 'Unknown Location'}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {report.status === 'resolved' ? (
                      <>
                        <CheckCircle size={16} className="text-success-green" />
                        <span className="text-xs font-bold text-success-green">Victim Rescued</span>
                      </>
                    ) : (
                      <>
                        <Clock3 size={16} className="text-warning-amber" />
                        <span className="text-xs font-bold text-warning-amber">Pending Rescue</span>
                      </>
                    )}
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
