const admin = require('firebase-admin');
// You need to export GOOGLE_APPLICATION_CREDENTIALS pointing to a service account key JSON to run this

admin.initializeApp();

const db = admin.firestore();

async function seed() {
  console.log("Starting seed process...");

  // 1. Admin user
  await admin.auth().createUser({
    email: 'admin@firstresponder.app',
    password: 'Admin@123',
    displayName: 'Admin User'
  }).then(async (userRecord) => {
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: 'Admin User',
      email: 'admin@firstresponder.app',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log("Admin user created.");
  }).catch(e => console.log("Admin might exist:", e.message));

  // 2. Hospitals in Chennai
  const hospitals = [
    { name: "Govt. General Hospital", latitude: 13.0827, longitude: 80.2707, phone: "044-25305000", emergencyAvailable: true, beds: 150, rating: 4.2, departments: ["Emergency", "Trauma", "ICU"], isOpen24Hours: true },
    { name: "Apollo Hospitals Greams Road", latitude: 13.0569, longitude: 80.2425, phone: "044-28293333", emergencyAvailable: true, beds: 200, rating: 4.8, departments: ["Emergency", "Trauma", "Surgery", "ICU"], isOpen24Hours: true },
    { name: "Stanley Medical College Hospital", latitude: 13.1067, longitude: 80.2917, phone: "044-25281347", emergencyAvailable: true, beds: 100, rating: 4.0, departments: ["Emergency", "Trauma", "Blood Bank"], isOpen24Hours: true },
    { name: "Fortis Malar Hospital", latitude: 12.9982, longitude: 80.2455, phone: "044-42892222", emergencyAvailable: true, beds: 120, rating: 4.5, departments: ["Emergency", "ICU", "Surgery"], isOpen24Hours: true },
    { name: "MIOT International", latitude: 13.0418, longitude: 80.1795, phone: "044-22492288", emergencyAvailable: true, beds: 180, rating: 4.6, departments: ["Emergency", "Trauma", "Orthopedics"], isOpen24Hours: true }
  ];

  for (let h of hospitals) {
    const ref = db.collection('hospitals').doc();
    h.id = ref.id;
    await ref.set(h);
  }
  console.log("Hospitals seeded.");

  // 3. First Aid Guides
  const guides = [
    {
      title: "CPR (Cardiopulmonary Resuscitation)", category: "CPR", icon: "cpr-icon", isOffline: true,
      steps: [
        { stepNo: 1, title: "Check Scene & Person", instruction: "Make sure scene is safe, tap shoulder and shout 'Are you okay?'" },
        { stepNo: 2, title: "Call 108", instruction: "If no response, call 108 or ask someone else to call." },
        { stepNo: 3, title: "Open Airway", instruction: "Tilt head back slightly and lift chin." },
        { stepNo: 4, title: "Check Breathing", instruction: "Listen carefully for no more than 10 seconds." },
        { stepNo: 5, title: "Chest Compressions", instruction: "Push hard and fast in center of chest (100-120 per minute)." },
        { stepNo: 6, title: "Rescue Breaths", instruction: "With head tilted, pinch nose and give 2 breaths." }
      ]
    },
    {
      title: "Bleeding Control", category: "bleeding", icon: "bleeding-icon", isOffline: true,
      steps: [
        { stepNo: 1, title: "Safety", instruction: "Put on gloves if available." },
        { stepNo: 2, title: "Direct Pressure", instruction: "Apply firm, direct pressure over the wound with clean cloth." },
        { stepNo: 3, title: "Elevate", instruction: "Raise the injured area above the heart if possible." },
        { stepNo: 4, title: "Bandage", instruction: "Wrap bandage firmly over the dressing." },
        { stepNo: 5, title: "Tourniquet", instruction: "Only for severe, life-threatening limb bleeding." }
      ]
    }
  ];

  for (let g of guides) {
    const ref = db.collection('firstAidGuides').doc();
    g.id = ref.id;
    await ref.set(g);
  }
  console.log("First aid guides seeded.");

  // 4. Sample Volunteers (mocked)
  const vol1Ref = db.collection('volunteers').doc('test-vol-1');
  await vol1Ref.set({
    uid: 'test-vol-1', userId: 'user-id-1', isVerified: true, isAvailable: true, alertRadiusKm: 5,
    travelMode: 'bike', totalRescues: 4, rating: 4.8, totalRatings: 5,
    currentLatitude: 13.0600, currentLongitude: 80.2500, createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 5. Sample Accidents
  const accRef = db.collection('accidents').doc();
  await accRef.set({
    id: accRef.id, reportedById: 'user-id-2', reportedByName: 'Ramesh', latitude: 13.0604, longitude: 80.2495,
    accidentType: 'collision', severity: 'high', status: 'resolved', resolvedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log("Seeding complete.");
  process.exit(0);
}

seed();
