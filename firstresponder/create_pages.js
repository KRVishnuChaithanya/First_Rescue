const fs = require('fs');
const path = require('path');

const pages = [
  'auth/Splash', 'auth/Onboarding', 'auth/Register', 'auth/OTPVerify', 'auth/Login', 'auth/ForgotPassword', 'auth/ResetPassword',
  'citizen/CitizenHome', 'citizen/ReportStep1', 'citizen/ReportStep2', 'citizen/ReportStep3', 'citizen/AccidentConfirmed', 'citizen/LiveTracking', 'citizen/AmbulanceTracker', 'citizen/HospitalFinder', 'citizen/HospitalDetail', 'citizen/FirstAidList', 'citizen/FirstAidDetail',
  'volunteer/SOSScreen', 'volunteer/VolunteerRegister', 'volunteer/CertUpload', 'volunteer/VolunteerHome', 'volunteer/IncomingAlert', 'volunteer/AlertDetail', 'volunteer/Navigation', 'volunteer/VictimStatus', 'volunteer/RescueComplete', 'volunteer/RescueHistory',
  'admin/AdminLogin', 'admin/AdminHome', 'admin/LiveMap', 'admin/VolunteerManage', 'admin/VolunteerVerify', 'admin/AccidentReports', 'admin/AccidentDetail', 'admin/Heatmap', 'admin/AdminSettings',
  'shared/Profile', 'shared/EditProfile', 'shared/AlertRadius', 'shared/NotifPrefs', 'shared/AppSettings', 'shared/HelpFAQ', 'shared/About', 'shared/Offline', 'shared/Rating'
];

pages.forEach(page => {
  const compName = page.split('/')[1];
  const content = `import React from 'react';\n\nexport default function ${compName}() {\n  return (\n    <div className="p-4">\n      <h1 className="text-2xl font-heading text-primary-red">${compName}</h1>\n    </div>\n  );\n}\n`;
  const filePath = path.join(__dirname, 'client/src/pages', `${page}.jsx`);
  fs.writeFileSync(filePath, content);
});

console.log('Pages created successfully.');
