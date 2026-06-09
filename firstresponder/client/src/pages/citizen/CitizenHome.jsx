import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, MapPin, Heart, Shield, Bell, FileText, ChevronRight, Activity, Flame, Car, HelpCircle, Users } from 'lucide-react';
import BottomNav from '../../components/common/BottomNav';
import { useGlobal } from '../../context/GlobalState';

export default function CitizenHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [incidentData, setIncidentData] = useState({
    type: '',
    severity: '',
    victims: 1
  });
  const [isSending, setIsSending] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  const { addEmergency, currentUser } = useGlobal();

  const handleSOSClick = () => {
    setShowWizard(true);
    setWizardStep(1);
    setIncidentData({ type: '', severity: '', victims: 1 });
    setAlertSent(false);
  };

  React.useEffect(() => {
    if (location.state?.triggerSOS) {
      handleSOSClick();
      // Clear state so it doesn't reopen if they navigate back
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSendAlert = () => {
    setIsSending(true);

    const finishAlert = (payload) => {
      addEmergency(payload);
      setTimeout(() => {
        setIsSending(false);
        setAlertSent(true);
      }, 500);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let address = 'Unknown Location';

          try {
            // Free Reverse Geocoding API via OpenStreetMap
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            // Try to make a readable short address
            if (data.display_name) {
              address = data.display_name.split(',').slice(0, 3).join(', ');
            }
          } catch (error) {
            address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          }

          finishAlert({
            ...incidentData,
            lat: lat,
            lng: lng,
            location: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
            address: address
          });
        },
        (error) => {
          // If the user blocks location access
          finishAlert({
            ...incidentData,
            lat: null,
            lng: null,
            location: 'Location Access Denied',
            address: 'Unknown GPS Location'
          });
        }
      );
    } else {
      finishAlert({
        ...incidentData,
        lat: null,
        lng: null,
        location: 'Not Supported',
        address: 'Browser does not support GPS'
      });
    }
  };

  return (
    <div className="min-h-screen bg-light-gray pb-24 relative">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm rounded-b-3xl flex justify-between items-center relative z-10">
        <div>
          <p className="text-text-tertiary text-sm font-medium">
            Hello, {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() + currentUser.name.slice(1).split(' ')[0] : 'Citizen'}
          </p>
          <h1 className="text-2xl font-heading font-bold text-dark-black">Stay Safe.</h1>
        </div>
        <div className="relative cursor-pointer">
          <Bell className="text-dark-gray" size={28} />
          <span className="absolute top-0 right-0 w-3 h-3 bg-primary-red rounded-full border-2 border-white"></span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 mt-8 flex flex-col items-center">
        
        {/* The New SOS Button Container */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-10">
          <div className="absolute inset-0 bg-primary-lightRed rounded-full animate-ping opacity-30"></div>
          <div className="absolute inset-4 bg-primary-red opacity-20 rounded-full animate-pulse"></div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSOSClick}
            className="w-48 h-48 bg-gradient-to-b from-primary-red to-primary-darkRed rounded-full shadow-[0_15px_50px_rgba(226,75,74,0.5)] flex flex-col items-center justify-center border-4 border-white z-10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <AlertTriangle size={64} className="text-white mb-2 drop-shadow-md" />
            <span className="text-white font-heading font-black text-3xl tracking-wider">SOS</span>
          </motion.button>
        </div>

        <p className="text-center text-text-secondary max-w-xs mb-8">
          Tap the SOS button to instantly request emergency assistance from nearby volunteers.
        </p>

        {/* Quick Actions Grid */}
        <div className="w-full grid grid-cols-2 gap-4">
          <ActionCard 
            icon={<MapPin className="text-blue-500" size={28} />}
            title="Hospitals"
            subtitle="Find nearby ERs"
            onClick={() => navigate('/hospitals')}
          />
          <ActionCard 
            icon={<Heart className="text-primary-red" size={28} />}
            title="First Aid"
            subtitle="Offline guides"
            onClick={() => navigate('/first-aid')}
          />
          <ActionCard 
            icon={<Shield className="text-warning-amber" size={28} />}
            title="Safety Setup"
            subtitle="Emergency contacts"
          />
          <ActionCard 
            icon={<FileText className="text-success-green" size={28} />}
            title="History"
            subtitle="Past reports"
            onClick={() => navigate('/citizen-history')}
          />
        </div>
      </div>

      <BottomNav />

      {/* The Emergency Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-dark-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: '90vh' }}
            >
              {/* Header */}
              <div className="bg-primary-red p-6 text-white relative">
                <h2 className="text-2xl font-heading font-bold">Emergency Alert</h2>
                <p className="text-white/80 text-sm">Step {wizardStep} of 3</p>
                <button 
                  onClick={() => setShowWizard(false)}
                  className="absolute top-6 right-6 text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* STEP 1: Incident Type */}
                  {wizardStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 className="text-lg font-bold text-dark-black mb-4">What type of incident is this?</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <SelectionCard 
                          icon={<Car />} title="Road Accident" 
                          selected={incidentData.type === 'Road Accident'}
                          onClick={() => { setIncidentData({...incidentData, type: 'Road Accident'}); setTimeout(() => setWizardStep(2), 300); }}
                        />
                        <SelectionCard 
                          icon={<Flame />} title="Fire Accident" 
                          selected={incidentData.type === 'Fire Accident'}
                          onClick={() => { setIncidentData({...incidentData, type: 'Fire Accident'}); setTimeout(() => setWizardStep(2), 300); }}
                        />
                        <SelectionCard 
                          icon={<Activity />} title="Medical" 
                          selected={incidentData.type === 'Medical'}
                          onClick={() => { setIncidentData({...incidentData, type: 'Medical'}); setTimeout(() => setWizardStep(2), 300); }}
                        />
                        <SelectionCard 
                          icon={<HelpCircle />} title="Other" 
                          selected={incidentData.type === 'Other'}
                          onClick={() => { setIncidentData({...incidentData, type: 'Other'}); setTimeout(() => setWizardStep(2), 300); }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Severity */}
                  {wizardStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 className="text-lg font-bold text-dark-black mb-4">What is the severity?</h3>
                      <div className="space-y-3">
                        <SeverityCard 
                          title="Minor" desc="Conscious, minor injuries, stable." color="border-green-500 bg-green-50 text-green-700"
                          selected={incidentData.severity === 'Minor'}
                          onClick={() => { setIncidentData({...incidentData, severity: 'Minor'}); setTimeout(() => setWizardStep(3), 300); }}
                        />
                        <SeverityCard 
                          title="Moderate" desc="Severe pain, bleeding, but conscious." color="border-warning-amber bg-warning-light text-warning-amber"
                          selected={incidentData.severity === 'Moderate'}
                          onClick={() => { setIncidentData({...incidentData, severity: 'Moderate'}); setTimeout(() => setWizardStep(3), 300); }}
                        />
                        <SeverityCard 
                          title="Severe" desc="Unconscious, heavy bleeding, life-threatening." color="border-primary-red bg-primary-lightRed text-primary-red"
                          selected={incidentData.severity === 'Severe'}
                          onClick={() => { setIncidentData({...incidentData, severity: 'Severe'}); setTimeout(() => setWizardStep(3), 300); }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Victims & Send */}
                  {wizardStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      {!alertSent ? (
                        <>
                          <h3 className="text-lg font-bold text-dark-black mb-4">Expected number of victims?</h3>
                          <div className="flex items-center justify-center space-x-6 py-6 mb-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <button 
                              onClick={() => setIncidentData({...incidentData, victims: Math.max(1, incidentData.victims - 1)})}
                              className="w-12 h-12 rounded-full bg-white border border-gray-200 text-2xl font-bold flex items-center justify-center text-dark-black shadow-sm"
                            >-</button>
                            <div className="flex flex-col items-center w-20">
                              <Users className="text-text-tertiary mb-1" />
                              <span className="text-4xl font-heading font-black text-primary-red">{incidentData.victims}</span>
                            </div>
                            <button 
                              onClick={() => setIncidentData({...incidentData, victims: incidentData.victims + 1})}
                              className="w-12 h-12 rounded-full bg-white border border-gray-200 text-2xl font-bold flex items-center justify-center text-dark-black shadow-sm"
                            >+</button>
                          </div>

                          <div className="bg-primary-lightRed p-4 rounded-xl mb-6 flex items-start space-x-3">
                            <MapPin className="text-primary-red mt-1 shrink-0" size={20} />
                            <p className="text-xs text-primary-darkRed font-medium">
                              Your exact GPS location will be securely attached to this alert and sent to volunteers within a 5km radius.
                            </p>
                          </div>

                          <button 
                            onClick={handleSendAlert}
                            disabled={isSending}
                            className="w-full bg-primary-red hover:bg-primary-darkRed text-white py-4 rounded-xl font-bold text-lg shadow-glow-red transition flex items-center justify-center"
                          >
                            {isSending ? (
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              "Transmit Emergency Alert"
                            )}
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="text-success-green" size={40} />
                          </div>
                          <h3 className="text-xl font-bold text-dark-black mb-2">Alert Transmitted!</h3>
                          <p className="text-text-secondary mb-8">
                            Nearby volunteers have been notified. Stay calm and follow first aid guidelines if safe to do so.
                          </p>
                          <button 
                            onClick={() => {
                              setShowWizard(false);
                              navigate('/tracking/live');
                            }}
                            className="w-full bg-dark-black text-white py-4 rounded-xl font-bold"
                          >
                            View Live Tracking
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponents for the UI
function ActionCard({ icon, title, subtitle, onClick }) {
  return (
    <div onClick={onClick} className="bg-white p-4 rounded-2xl shadow-card border border-border flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition">
      <div className="mb-3 bg-gray-50 p-3 rounded-full">{icon}</div>
      <h3 className="font-bold text-dark-black text-sm">{title}</h3>
      <p className="text-[10px] text-text-tertiary mt-1 uppercase tracking-wider">{subtitle}</p>
    </div>
  );
}

function SelectionCard({ icon, title, selected, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 cursor-pointer transition ${
        selected ? 'border-primary-red bg-primary-lightRed text-primary-red' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
      }`}
    >
      {icon}
      <span className="font-bold text-sm text-center">{title}</span>
    </div>
  );
}

function SeverityCard({ title, desc, color, selected, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
        selected ? color : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
      }`}
    >
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="text-xs opacity-80 mt-1">{desc}</p>
      </div>
      {selected && <ChevronRight />}
    </div>
  );
}
