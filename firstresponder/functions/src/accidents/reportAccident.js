const admin = require('firebase-admin');
const { haversine } = require('../utils/haversine');
const { sendFCMNotification } = require('../notifications/sendFCMNotification');

// Cloud Function equivalent (using a simplified express/http handler structure for demonstration)
// In a real deployed Firebase Function, this would use functions.https.onCall or onRequest
exports.reportAccident = async (req, res) => {
  try {
    const db = admin.firestore();
    const data = req.body;
    
    // 1. Create accident document
    const accidentRef = db.collection('accidents').doc();
    const initialRadius = data.zoneType === 'rural' ? 5 : 2; // km
    
    const accidentData = {
      id: accidentRef.id,
      reportedById: data.reporterId,
      reportedByName: data.reporterName,
      reportedByPhone: data.reporterPhone,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      accidentType: data.accidentType,
      severity: data.severity,
      victimsCount: data.victimsCount || 1,
      photoUrl: data.photoUrl || null,
      status: 'reported',
      currentAlertRadius: initialRadius,
      notifiedVolunteers: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await accidentRef.set(accidentData);

    // 2. Query volunteers
    const volunteersSnapshot = await db.collection('volunteers')
      .where('isVerified', '==', true)
      .where('isAvailable', '==', true)
      .get();

    let volunteersToAlert = [];
    
    volunteersSnapshot.forEach(doc => {
      const vol = doc.data();
      if (!vol.currentLatitude || !vol.currentLongitude) return;
      
      // Calculate distance using Haversine
      const distance = haversine(
        data.latitude, data.longitude, 
        vol.currentLatitude, vol.currentLongitude
      );
      
      if (distance <= initialRadius && distance <= (vol.alertRadiusKm || 10)) {
        volunteersToAlert.push({ id: doc.id, distance, fcmToken: vol.fcmToken });
      }
    });

    // 3. Create alerts and notify
    const batch = db.batch();
    const notifiedIds = [];

    for (const vol of volunteersToAlert) {
      const alertRef = db.collection('alerts').doc();
      batch.set(alertRef, {
        id: alertRef.id,
        accidentId: accidentRef.id,
        volunteerId: vol.id,
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        distance: vol.distance,
        accidentType: data.accidentType,
        severity: data.severity
      });
      notifiedIds.push(vol.id);
      
      // Notify (in background)
      if (vol.fcmToken) {
        sendFCMNotification(vol.fcmToken, {
          title: "URGENT: Accident Nearby!",
          body: `${data.accidentType} reported ${vol.distance.toFixed(1)}km away.`,
          data: { accidentId: accidentRef.id, type: "NEW_ALERT" }
        });
      }
    }
    
    // Update accident with notified list
    if (notifiedIds.length > 0) {
      batch.update(accidentRef, {
        notifiedVolunteers: admin.firestore.FieldValue.arrayUnion(...notifiedIds)
      });
    }

    await batch.commit();

    // 4. Schedule Cloud Task for radius expansion (Simulated via Pub/Sub or Tasks)
    // scheduleRadiusExpansion(accidentRef.id, 120); // 120 seconds

    res.status(200).json({ 
      success: true, 
      accidentId: accidentRef.id,
      volunteersNotified: volunteersToAlert.length
    });

  } catch (error) {
    console.error("Error reporting accident:", error);
    res.status(500).json({ error: error.message });
  }
};
