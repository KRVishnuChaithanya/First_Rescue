const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
const reportAccident = require('./src/accidents/reportAccident');
// ... other imports

exports.reportAccident = functions.https.onRequest(reportAccident.reportAccident);
// ... export other functions
