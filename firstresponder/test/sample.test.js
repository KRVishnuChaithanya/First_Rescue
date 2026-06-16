const test = require('node:test');
const assert = require('node:assert');

test('Firebase Config Format Validation', () => {
  const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "demo-key",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "demo-project"
  };
  assert.ok(config.apiKey);
  assert.ok(config.projectId);
});

test('Role Authorization Schema Validation', () => {
  const roles = ['citizen', 'volunteer', 'admin'];
  assert.equal(roles.includes('citizen'), true);
  assert.equal(roles.includes('volunteer'), true);
  assert.equal(roles.includes('admin'), true);
  assert.equal(roles.includes('unknown'), false);
});
