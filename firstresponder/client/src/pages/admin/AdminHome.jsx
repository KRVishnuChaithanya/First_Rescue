import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, CheckCircle, XCircle, Search, ShieldCheck, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobal } from '../../context/GlobalState';

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [directoryFilter, setDirectoryFilter] = useState('all'); // 'all', 'citizens', 'volunteers'
  const [showEmergenciesModal, setShowEmergenciesModal] = useState(false);
  const { volunteers, updateVolunteerStatus, emergencies, systemStats, users, rescueHistory, clearAllEmergencies } = useGlobal();

  const handleAction = (id, action) => {
    updateVolunteerStatus(id, action === 'approve' ? 'approved' : 'rejected');
    toast.success(`Volunteer ${action === 'approve' ? 'Approved' : 'Rejected'} successfully!`);
  };

  const downloadReport = (report) => {
    const reportContent = `
🆔 Incident ID: ${report.id}
📍 Location: ${report.location}
🕐 Arrived At: ${report.time}

--- SCENE ASSESSMENT ---
✅ What I found:
"${report.victims} person(s) injured due to ${report.type}.
Initial assessment conducted on site.
Medical transport required."

🩸 Injury Level:  
[${report.severity === 'Minor' ? '✓' : ' '}] Minor  [${report.severity === 'Moderate' ? '✓' : ' '}] Moderate  [${report.severity === 'Severe' || report.severity === 'Critical' ? '✓' : ' '}] Severe/Critical

🚑 Actions I Took:
- Applied first aid to injured victim(s)
- Called emergency transport
- Kept crowd away from victim

📸 Photos: [attached securely in system]

⏳ Current Status:
[✓] Hospital notified  
[✓] Volunteer dispatched  
[✓] Situation resolved
`.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Accident_Report_${report.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-light-gray flex">
      {/* Sidebar (Desktop) / Hidden Mobile */}
      <div className="hidden md:flex w-64 bg-dark-black text-white flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center space-x-3 border-b border-gray-800">
          <ShieldCheck size={32} className="text-primary-red" />
          <h1 className="font-heading font-bold text-xl">Admin Panel</h1>
        </div>
        <div className="p-4 space-y-2 flex-1">
          <SidebarItem icon={<Activity />} title="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Users />} title="Users & Volunteers" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarItem icon={<CheckCircle />} title="Accident Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        </div>
        <div className="p-4 border-t border-gray-800 text-sm text-gray-400 text-center">
          Admin@123 Logged In
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto">
        {activeTab === 'dashboard' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold text-dark-black">Overview Dashboard</h2>
              <p className="text-text-secondary">Manage system alerts and volunteer approvals.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <StatCard 
                title="Active Emergencies" 
                value={emergencies.length} 
                subtitle="Require attention" 
                color="text-primary-red" 
                bg="bg-primary-lightRed" 
                onClick={() => setShowEmergenciesModal(true)}
              />
              <StatCard 
                title="Total Volunteers" 
                value={volunteers.length} 
                subtitle={`${volunteers.filter(v => v.status === 'pending').length} pending approval`} 
                color="text-warning-amber" 
                bg="bg-warning-light" 
                onClick={() => {
                  setActiveTab('users');
                  setDirectoryFilter('volunteers');
                }}
              />
              <StatCard title="Total Victims Rescued" value={systemStats?.totalVictimsRescued || 0} subtitle="Across all regions" color="text-blue-600" bg="bg-blue-50" />
            </div>

            {/* Volunteer Approval Table */}
            <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50">
                <h3 className="font-heading font-bold text-xl text-dark-black">Pending Volunteer Requests</h3>
                <div className="relative hidden sm:block">
                  <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-red" />
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-xs uppercase text-text-tertiary border-b border-border">
                      <th className="p-4 font-bold">Name & Qualification</th>
                      <th className="p-4 font-bold">Applied Date</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((vol) => (
                      <tr key={vol.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="p-4">
                          <div className="font-bold text-dark-black text-sm">{vol.name}</div>
                          <div className="text-xs text-text-secondary">{vol.qual}</div>
                        </td>
                        <td className="p-4 text-sm text-text-secondary">{vol.date}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            vol.status === 'pending' ? 'bg-warning-light text-warning-amber' : 
                            vol.status === 'approved' ? 'bg-success-light text-success-green' : 
                            'bg-primary-lightRed text-primary-red'
                          }`}>
                            {vol.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {vol.status === 'pending' ? (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => handleAction(vol.id, 'reject')} className="p-2 text-primary-red hover:bg-primary-lightRed rounded-lg transition" title="Reject">
                                <XCircle size={20} />
                              </button>
                              <button onClick={() => handleAction(vol.id, 'approve')} className="p-2 text-success-green hover:bg-success-light rounded-lg transition" title="Approve">
                                <CheckCircle size={20} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold text-dark-black">Users & Volunteers (10km Radius)</h2>
              <p className="text-text-secondary">View all registered citizens and approved volunteers operating within your 10km administrative zone.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center bg-gray-50 space-y-4 sm:space-y-0">
                <h3 className="font-heading font-bold text-xl text-dark-black">Network Directory</h3>
                
                {/* Filter Toggle */}
                <div className="flex bg-gray-200 p-1 rounded-xl w-full sm:w-auto">
                  <button 
                    onClick={() => setDirectoryFilter('all')}
                    className={`flex-1 sm:px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${directoryFilter === 'all' ? 'bg-white text-dark-black shadow-sm' : 'text-gray-500 hover:text-dark-black'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setDirectoryFilter('citizens')}
                    className={`flex-1 sm:px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${directoryFilter === 'citizens' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-dark-black'}`}
                  >
                    Citizens
                  </button>
                  <button 
                    onClick={() => setDirectoryFilter('volunteers')}
                    className={`flex-1 sm:px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${directoryFilter === 'volunteers' ? 'bg-white text-primary-red shadow-sm' : 'text-gray-500 hover:text-dark-black'}`}
                  >
                    Volunteers
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-xs uppercase text-text-tertiary border-b border-border">
                      <th className="p-4 font-bold">User Name</th>
                      <th className="p-4 font-bold">Contact Info</th>
                      <th className="p-4 font-bold">Role</th>
                      <th className="p-4 font-bold text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render Citizens from users state */}
                    {(directoryFilter === 'all' || directoryFilter === 'citizens') && users.filter(u => u.role === 'citizen').map((user, idx) => (
                      <tr key={`user-${user.id || idx}`} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="p-4">
                          <div className="font-bold text-dark-black text-sm">{user.name}</div>
                        </td>
                        <td className="p-4 text-sm text-text-secondary">
                          <div>{user.email}</div>
                          <div>{user.phone}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600">
                            Citizen
                          </span>
                        </td>
                        <td className="p-4 text-right text-sm font-medium text-text-secondary">
                          Alerts Given: {Math.floor(Math.random() * 5)}
                        </td>
                      </tr>
                    ))}
                    {/* Render Volunteers */}
                    {(directoryFilter === 'all' || directoryFilter === 'volunteers') && volunteers.map((vol, idx) => (
                      <tr key={`vol-${vol.id || idx}`} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="p-4">
                          <div className="font-bold text-dark-black text-sm">{vol.name}</div>
                          <div className="text-xs text-text-secondary">{vol.qual || 'Volunteer'}</div>
                        </td>
                        <td className="p-4 text-sm text-text-secondary">
                          <div>{vol.email}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-lightRed text-primary-red">
                            Volunteer
                          </span>
                        </td>
                        <td className="p-4 text-right text-sm font-medium text-text-secondary">
                          Radius: {Math.floor(Math.random() * 5) + 5} km
                        </td>
                      </tr>
                    ))}
                    {((directoryFilter === 'all' && users.length === 0 && volunteers.length === 0) ||
                      (directoryFilter === 'citizens' && users.filter(u => u.role === 'citizen').length === 0) ||
                      (directoryFilter === 'volunteers' && volunteers.length === 0)) && (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500">No {directoryFilter === 'all' ? 'users' : directoryFilter} found in your 10km radius.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold text-dark-black">Accident Reports</h2>
              <p className="text-text-secondary">View and download official reports for resolved emergencies.</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50">
                <h3 className="font-heading font-bold text-xl text-dark-black">Resolved Incident Logs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-xs uppercase text-text-tertiary border-b border-border">
                      <th className="p-4 font-bold">Incident ID / Date</th>
                      <th className="p-4 font-bold">Type & Severity</th>
                      <th className="p-4 font-bold">Location</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rescueHistory && rescueHistory.length > 0 ? (
                      rescueHistory.map((report) => (
                        <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="p-4">
                            <div className="font-bold text-dark-black text-sm">{report.id}</div>
                            <div className="text-xs text-text-secondary">{report.date} at {report.time}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-sm text-dark-black">{report.type}</div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              report.severity === 'Severe' ? 'bg-primary-lightRed text-primary-red' : 'bg-warning-light text-warning-amber'
                            }`}>
                              {report.severity}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-text-secondary">
                            <div className="line-clamp-1">{report.location}</div>
                            <div className="text-xs mt-1 text-blue-600 font-medium">To: {report.hospitalName}</div>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => downloadReport(report)}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#0F9D58] hover:bg-[#0b8043] text-white text-sm font-bold rounded-lg transition shadow-sm"
                            >
                              <Download size={16} />
                              <span>Download</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500">No accident reports available yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Active Emergencies Modal */}
      {showEmergenciesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50">
              <h3 className="font-heading font-bold text-xl text-dark-black flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-red"></span>
                </span>
                Live Active Emergencies
              </h3>
              <div className="flex items-center space-x-3">
                {emergencies.length > 0 && (
                  <button 
                    onClick={() => {
                      clearAllEmergencies();
                      toast.success("All emergencies cleared!");
                    }} 
                    className="text-xs font-bold text-primary-red hover:bg-primary-lightRed px-3 py-1.5 rounded-lg transition border border-primary-red/20 shadow-sm"
                  >
                    Clear All
                  </button>
                )}
                <button onClick={() => setShowEmergenciesModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {emergencies.length === 0 ? (
                <div className="text-center text-gray-500 py-10 font-medium text-lg">
                  No active emergencies. The city is safe!
                </div>
              ) : (
                <div className="space-y-4">
                  {emergencies.map((em, idx) => (
                    <div key={idx} className="border border-border rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:bg-gray-50 transition">
                      <div>
                        <div className="font-bold text-dark-black text-lg">{em.type} - {em.severity} Severity</div>
                        <div className="text-sm text-text-secondary mt-1 flex items-center gap-1">
                          📍 {em.address || 'Unknown Location'}
                        </div>
                        <div className="text-xs text-gray-400 mt-2 font-medium">Reported: {em.timestamp || new Date().toLocaleTimeString()}</div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                        <span className="inline-block px-3 py-1.5 bg-warning-light text-warning-amber text-xs font-bold uppercase tracking-wider rounded-full border border-warning-amber/20">
                          Alert Broadcasting...
                        </span>
                        <div className="text-[11px] text-gray-500 mt-2 font-medium">
                          Awaiting Volunteer Hospital Drop-off
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon, title, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition ${active ? 'bg-primary-red text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
      {icon}
      <span className="font-medium text-sm">{title}</span>
    </div>
  );
}

function StatCard({ title, value, subtitle, color, bg, onClick }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }} 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-sm border border-border ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300 transition' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-text-secondary text-sm font-medium">{title}</h4>
        <div className={`p-2 rounded-lg ${bg} ${color}`}>
          <Activity size={20} />
        </div>
      </div>
      <h2 className={`text-4xl font-heading font-black mb-1 ${color}`}>{value}</h2>
      <p className="text-xs text-text-tertiary">{subtitle}</p>
    </motion.div>
  );
}
