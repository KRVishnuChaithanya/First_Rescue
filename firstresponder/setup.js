const fs = require('fs');
const path = require('path');

const dirs = [
  'client/src/components/common',
  'client/src/components/maps',
  'client/src/components/citizen',
  'client/src/components/volunteer',
  'client/src/components/admin',
  'client/src/pages/auth',
  'client/src/pages/citizen',
  'client/src/pages/volunteer',
  'client/src/pages/admin',
  'client/src/pages/shared',
  'client/src/hooks',
  'client/src/context',
  'client/src/firebase',
  'client/src/utils',
  'client/src/styles',
  'functions/src/auth',
  'functions/src/accidents',
  'functions/src/volunteers',
  'functions/src/notifications',
  'functions/src/ratings',
  'functions/src/admin',
  'functions/src/sos',
  'functions/src/utils',
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

console.log('Directories created successfully.');
