import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../firebase/config';
import { collection, onSnapshot, addDoc, serverTimestamp, GeoPoint, doc, updateDoc } from 'firebase/firestore';

const GlobalContext = createContext();

export const useGlobal = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  // Use localStorage to persist data across page refreshes for the local demo
  // Using v3 keys to intentionally WIPE the old data and reset the system to 0
  const [volunteers, setVolunteers] = useState(() => {
    const saved = localStorage.getItem('firstResponder_v3_volunteers');
    return saved ? JSON.parse(saved) : [];
  });

  const [emergencies, setEmergencies] = useState(() => {
    const saved = localStorage.getItem('firstResponder_v3_emergencies');
    return saved ? JSON.parse(saved) : [];
  });

  const [volunteerStats, setVolunteerStats] = useState(() => {
    const saved = localStorage.getItem('firstResponder_v3_stats');
    return saved ? JSON.parse(saved) : { rescues: 0, hours: 0, rating: 5.0 };
  });

  const [rescueHistory, setRescueHistory] = useState(() => {
    const saved = localStorage.getItem('firstResponder_v3_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [citizenReports, setCitizenReports] = useState(() => {
    const saved = localStorage.getItem('firstResponder_v3_citizenReports');
    return saved ? JSON.parse(saved) : [];
  });

  const [systemStats, setSystemStats] = useState(() => {
    const saved = localStorage.getItem('firstResponder_v3_system');
    return saved ? JSON.parse(saved) : { registeredCitizens: 0, totalVictimsRescued: 0 };
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('firstResponder_v3_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('firstResponder_v3_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Persisted Duty State
  const [isOnDuty, setIsOnDuty] = useState(() => {
    const saved = localStorage.getItem('firstResponder_v3_isOnDuty');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [dutySeconds, setDutySeconds] = useState(() => {
    const saved = localStorage.getItem('firstResponder_v3_dutySeconds');
    return saved ? JSON.parse(saved) : 0;
  });

  // Background Duty Timer
  useEffect(() => {
    let interval;
    if (isOnDuty) {
      interval = setInterval(() => {
        setDutySeconds((prev) => {
          if (prev >= 36000) { // 10 hours
            setIsOnDuty(false);
            toast.error("Shift Limit Reached. You have been automatically switched off duty after 10 continuous hours.");
            return prev; // Keep the time at 10 hours, DO NOT reset to 0!
          }
          const newValue = prev + 1;
          localStorage.setItem('firstResponder_v3_dutySeconds', JSON.stringify(newValue));
          return newValue;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnDuty]);

  useEffect(() => {
    localStorage.setItem('firstResponder_v3_isOnDuty', JSON.stringify(isOnDuty));
  }, [isOnDuty]);

  // Listen for changes from OTHER tabs to simulate a real-time WebSocket backend
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'firstResponder_v3_emergencies') {
        const newData = e.newValue ? JSON.parse(e.newValue) : [];
        setEmergencies(newData);
      }
      if (e.key === 'firstResponder_v3_volunteers') {
        const newData = e.newValue ? JSON.parse(e.newValue) : [];
        setVolunteers(newData);
      }
      if (e.key === 'firstResponder_v3_stats') {
        const newData = e.newValue ? JSON.parse(e.newValue) : { rescues: 0, hours: 0, rating: 5.0 };
        setVolunteerStats(newData);
      }
      if (e.key === 'firstResponder_v3_history') {
        const newData = e.newValue ? JSON.parse(e.newValue) : [];
        setRescueHistory(newData);
      }
      if (e.key === 'firstResponder_v3_citizenReports') {
        const newData = e.newValue ? JSON.parse(e.newValue) : [];
        setCitizenReports(newData);
      }
      if (e.key === 'firstResponder_v3_system') {
        const newData = e.newValue ? JSON.parse(e.newValue) : { registeredCitizens: 0, totalVictimsRescued: 0 };
        setSystemStats(newData);
      }
      if (e.key === 'firstResponder_v3_users') {
        const newData = e.newValue ? JSON.parse(e.newValue) : [];
        setUsers(newData);
      }
      if (e.key === 'firstResponder_v3_currentUser') {
        const newData = e.newValue ? JSON.parse(e.newValue) : null;
        setCurrentUser(newData);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Firebase Listener for real-time cross-device alerts
    let unsub = () => {};
    if (db) {
      unsub = onSnapshot(collection(db, 'rescue_requests'), (snapshot) => {
        const fbEmergencies = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            incidentId: data.incidentId || doc.id,
            type: data.type || 'Emergency',
            status: data.status || 'active',
            timestamp: data.timestamp?.seconds ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString() : new Date().toLocaleTimeString(),
            location: data.location instanceof GeoPoint ? `${data.location.latitude.toFixed(4)}° N, ${data.location.longitude.toFixed(4)}° E` : (data.location || 'Unknown Location'),
            address: data.address || 'Unknown GPS Location',
            severity: data.severity || 'Severe',
            victims: data.victims || 1,
            lat: data.location instanceof GeoPoint ? data.location.latitude : (data.lat || null),
            lng: data.location instanceof GeoPoint ? data.location.longitude : (data.lng || null),
            fbDocId: doc.id // keep track of doc ID for resolving later
          };
        }).filter(e => e.status !== 'resolved' && e.status !== 'completed');
        
        setEmergencies(prev => {
          const fbIds = new Set(fbEmergencies.map(e => e.incidentId));
          const filteredLocal = prev.filter(e => !fbIds.has(e.incidentId));
          // Prepend firebase emergencies so they show up!
          return [...fbEmergencies, ...filteredLocal];
        });
      });
    }

    // Firebase Listener for user syncing across devices
    let unsubUsers = () => {};
    if (db) {
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const fbUsers = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setUsers(fbUsers);
        saveToStorage('firstResponder_v3_users', fbUsers);
      });
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsub();
      unsubUsers();
    };
  }, []);

  const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const registerUser = async (userData) => {
    // Generate temporary local ID first
    const localId = Date.now();
    const newUsers = [...users, { ...userData, id: localId }];
    setUsers(newUsers);
    saveToStorage('firstResponder_v3_users', newUsers);

    // Save to Firebase for persistent web sync
    if (db) {
      try {
        await addDoc(collection(db, 'users'), {
          ...userData,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firebase User registration error:", err);
      }
    }

    // Also update system stats for citizens
    if (userData.role === 'citizen') {
      const updatedSystemStats = { ...systemStats, registeredCitizens: systemStats.registeredCitizens + 1 };
      setSystemStats(updatedSystemStats);
      saveToStorage('firstResponder_v3_system', updatedSystemStats);
    }
  };

  const loginUser = (identifier, password) => {
    const user = users.find(u => (u.email === identifier || u.phone === identifier) && u.password === password);
    if (user) {
      setCurrentUser(user);
      saveToStorage('firstResponder_v3_currentUser', user);
      return user;
    }
    return null;
  };

  const loginUserByEmail = (identifier) => {
    const user = users.find(u => u.email === identifier || u.phone === identifier);
    if (user) {
      setCurrentUser(user);
      saveToStorage('firstResponder_v3_currentUser', user);
      return user;
    }
    return null;
  };

  const updatePassword = async (email, newPassword) => {
    const updatedUsers = users.map(u => u.email === email ? { ...u, password: newPassword } : u);
    setUsers(updatedUsers);
    saveToStorage('firstResponder_v3_users', updatedUsers);
    
    if (currentUser?.email === email) {
      const updatedCurrent = { ...currentUser, password: newPassword };
      setCurrentUser(updatedCurrent);
      saveToStorage('firstResponder_v3_currentUser', updatedCurrent);
    }

    // Sync password change to Firebase
    if (db) {
      try {
        const userToUpdate = users.find(u => u.email === email);
        if (userToUpdate && typeof userToUpdate.id === 'string') {
          await updateDoc(doc(db, 'users', userToUpdate.id), { password: newPassword });
        }
      } catch (err) {
        console.error("Firebase Password update error:", err);
      }
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('firstResponder_v3_currentUser');
  };

  const addVolunteerRequest = (volunteerData) => {
    const newVolunteers = [...volunteers, { ...volunteerData, id: Date.now(), status: 'pending', date: new Date().toISOString().split('T')[0] }];
    setVolunteers(newVolunteers);
    saveToStorage('firstResponder_v3_volunteers', newVolunteers);
  };

  const updateVolunteerStatus = (id, newStatus) => {
    const newVolunteers = volunteers.map(v => v.id === id ? { ...v, status: newStatus } : v);
    setVolunteers(newVolunteers);
    saveToStorage('firstResponder_v3_volunteers', newVolunteers);
  };

  const addEmergency = async (emergencyData) => {
    // Generate unified ID to sync between citizen and volunteer
    const incidentId = `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmergency = { ...emergencyData, id: Date.now(), incidentId, status: 'active', timestamp: new Date().toLocaleTimeString() };
    
    // Save locally
    const newEmergencies = [...emergencies, newEmergency];
    setEmergencies(newEmergencies);
    saveToStorage('firstResponder_v3_emergencies', newEmergencies);

    const newCitizenReports = [newEmergency, ...citizenReports];
    setCitizenReports(newCitizenReports);
    saveToStorage('firstResponder_v3_citizenReports', newCitizenReports);

    // Save to Firebase for cross-device syncing
    if (db) {
      try {
        await addDoc(collection(db, 'rescue_requests'), {
          incidentId,
          type: emergencyData.type || 'Emergency',
          severity: emergencyData.severity || 'Severe',
          victims: emergencyData.victims || 1,
          status: 'active',
          timestamp: serverTimestamp(),
          address: emergencyData.address || 'Unknown Location',
          lat: emergencyData.lat || null,
          lng: emergencyData.lng || null,
          location: (emergencyData.lat && emergencyData.lng) ? new GeoPoint(emergencyData.lat, emergencyData.lng) : 'Unknown'
        });
      } catch (err) {
        console.error("Firebase sync error:", err);
      }
    }
  };

  const resolveLatestEmergency = () => {
    const updated = [...emergencies];
    updated.pop();
    setEmergencies(updated);
    saveToStorage('firstResponder_v3_emergencies', updated);
  };

  const clearAllEmergencies = () => {
    setEmergencies([]);
    saveToStorage('firstResponder_v3_emergencies', []);
  };

  const recordSuccessfulRescue = (emergency, hospital) => {
    const victimsCount = emergency?.victims || 1;
    const updatedStats = {
      ...volunteerStats,
      rescues: volunteerStats.rescues + Number(victimsCount),
      hours: volunteerStats.hours + 2 // Simulating 2 hours worked per mission
    };
    setVolunteerStats(updatedStats);
    saveToStorage('firstResponder_v3_stats', updatedStats);

    const historyItem = {
      id: emergency?.incidentId || `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      type: emergency?.type || 'Emergency Rescue',
      severity: emergency?.severity || 'Moderate',
      victims: victimsCount,
      hospitalName: hospital?.name || 'Local Hospital',
      location: emergency?.address || 'Unknown Location'
    };
    
    const newHistory = [historyItem, ...rescueHistory];
    setRescueHistory(newHistory);
    saveToStorage('firstResponder_v3_history', newHistory);

    // Sync status back to the citizen portal
    if (emergency && emergency.incidentId) {
      const updatedCitizenReports = citizenReports.map(report => 
        report.incidentId === emergency.incidentId 
          ? { ...report, status: 'resolved' } 
          : report
      );
      setCitizenReports(updatedCitizenReports);
      saveToStorage('firstResponder_v3_citizenReports', updatedCitizenReports);
    }

    const updatedSystemStats = {
      ...systemStats,
      totalVictimsRescued: systemStats.totalVictimsRescued + Number(victimsCount)
    };
    setSystemStats(updatedSystemStats);
    saveToStorage('firstResponder_v3_system', updatedSystemStats);

    // Sync resolution to Firebase
    if (db && emergency?.fbDocId) {
      try {
        updateDoc(doc(db, 'rescue_requests', emergency.fbDocId), { status: 'resolved' });
      } catch (err) {
        console.error("Firebase update error:", err);
      }
    }
  };

  const checkVolunteerApproved = (email) => {
    // If we can't find them, we simulate they are pending for demo purposes unless they use a specific test email
    const vol = volunteers.find(v => v.email === email);
    if (!vol) return 'not_found';
    return vol.status;
  };

  return (
    <GlobalContext.Provider value={{ 
      volunteers, addVolunteerRequest, updateVolunteerStatus, checkVolunteerApproved,
      emergencies, addEmergency, resolveLatestEmergency, clearAllEmergencies,
      volunteerStats, recordSuccessfulRescue, rescueHistory, citizenReports,
      systemStats, users, registerUser, loginUser, loginUserByEmail, updatePassword, logoutUser, currentUser,
      isOnDuty, setIsOnDuty, dutySeconds
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
