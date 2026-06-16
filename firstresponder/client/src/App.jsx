import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { GlobalProvider } from './context/GlobalState';

// Auth
import Splash from './pages/auth/Splash';
import Onboarding from './pages/auth/Onboarding';
import Register from './pages/auth/Register';
import OTPVerify from './pages/auth/OTPVerify';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Citizen
import CitizenHome from './pages/citizen/CitizenHome';
import ReportStep1 from './pages/citizen/ReportStep1';
import ReportStep2 from './pages/citizen/ReportStep2';
import ReportStep3 from './pages/citizen/ReportStep3';
import AccidentConfirmed from './pages/citizen/AccidentConfirmed';
import LiveTracking from './pages/citizen/LiveTracking';
import AmbulanceTracker from './pages/citizen/AmbulanceTracker';
import HospitalFinder from './pages/citizen/HospitalFinder';
import HospitalDetail from './pages/citizen/HospitalDetail';
import FirstAidList from './pages/citizen/FirstAidList';
import FirstAidDetail from './pages/citizen/FirstAidDetail';
import CitizenHistory from './pages/citizen/CitizenHistory';

// Volunteer
import SOSScreen from './pages/volunteer/SOSScreen';
import VolunteerRegister from './pages/volunteer/VolunteerRegister';
import CertUpload from './pages/volunteer/CertUpload';
import VolunteerHome from './pages/volunteer/VolunteerHome';
import IncomingAlert from './pages/volunteer/IncomingAlert';
import AlertDetail from './pages/volunteer/AlertDetail';
import Navigation from './pages/volunteer/Navigation';
import HospitalSelection from './pages/volunteer/HospitalSelection';
import VictimStatus from './pages/volunteer/VictimStatus';
import RescueComplete from './pages/volunteer/RescueComplete';
import RescueHistory from './pages/volunteer/RescueHistory';

// Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminHome from './pages/admin/AdminHome';
import LiveMap from './pages/admin/LiveMap';
import VolunteerManage from './pages/admin/VolunteerManage';
import VolunteerVerify from './pages/admin/VolunteerVerify';
import AccidentReports from './pages/admin/AccidentReports';
import AccidentDetail from './pages/admin/AccidentDetail';
import Heatmap from './pages/admin/Heatmap';
import AdminSettings from './pages/admin/AdminSettings';

// Shared
import Profile from './pages/shared/Profile';
import EditProfile from './pages/shared/EditProfile';
import AlertRadius from './pages/shared/AlertRadius';
import NotifPrefs from './pages/shared/NotifPrefs';
import AppSettings from './pages/shared/AppSettings';
import HelpFAQ from './pages/shared/HelpFAQ';
import About from './pages/shared/About';
import Offline from './pages/shared/Offline';
import Rating from './pages/shared/Rating';

export default function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <div className="font-sans text-text-primary antialiased selection:bg-primary-red selection:text-white">
          <Toaster position="top-center" />
          <AnimatePresence mode="wait">
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<Splash />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/register" element={<Register />} />
              <Route path="/otp-verify" element={<OTPVerify />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Citizen Routes */}
              <Route path="/citizen-home" element={<CitizenHome />} />
              <Route path="/report/step1" element={<ReportStep1 />} />
              <Route path="/report/step2" element={<ReportStep2 />} />
              <Route path="/report/step3" element={<ReportStep3 />} />
              <Route path="/report/confirmed" element={<AccidentConfirmed />} />
              <Route path="/tracking/live" element={<LiveTracking />} />
              <Route path="/tracking/ambulance" element={<AmbulanceTracker />} />
              <Route path="/hospitals" element={<HospitalFinder />} />
              <Route path="/hospitals/:id" element={<HospitalDetail />} />
              <Route path="/first-aid" element={<FirstAidList />} />
              <Route path="/first-aid/:id" element={<FirstAidDetail />} />
              <Route path="/citizen-history" element={<CitizenHistory />} />

              {/* Volunteer Routes */}
              <Route path="/sos" element={<SOSScreen />} />
              <Route path="/volunteer-register" element={<VolunteerRegister />} />
              <Route path="/cert-upload" element={<CertUpload />} />
              <Route path="/volunteer-home" element={<VolunteerHome />} />
              <Route path="/alert/incoming" element={<IncomingAlert />} />
              <Route path="/alert/:id" element={<AlertDetail />} />
              <Route path="/navigation" element={<Navigation />} />
              <Route path="/hospital-selection" element={<HospitalSelection />} />
              <Route path="/victim-status" element={<VictimStatus />} />
              <Route path="/rescue-complete" element={<RescueComplete />} />
              <Route path="/rescue-history" element={<RescueHistory />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminHome />} />
              <Route path="/admin/live-map" element={<LiveMap />} />
              <Route path="/admin/volunteers" element={<VolunteerManage />} />
              <Route path="/admin/volunteer/:id" element={<VolunteerVerify />} />
              <Route path="/admin/reports" element={<AccidentReports />} />
              <Route path="/admin/accident/:id" element={<AccidentDetail />} />
              <Route path="/admin/heatmap" element={<Heatmap />} />
              <Route path="/admin/settings" element={<AdminSettings />} />

              {/* Shared Routes */}
              <Route path="/citizen-profile" element={<Profile />} />
              <Route path="/volunteer-profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/settings/radius" element={<AlertRadius />} />
              <Route path="/settings/notifications" element={<NotifPrefs />} />
              <Route path="/settings/app" element={<AppSettings />} />
              <Route path="/help" element={<HelpFAQ />} />
              <Route path="/about" element={<About />} />
              <Route path="/offline" element={<Offline />} />
              <Route path="/rating" element={<Rating />} />
            </Routes>
          </AnimatePresence>
        </div>
      </BrowserRouter>
    </GlobalProvider>
  );
}
