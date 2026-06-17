const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'api.github.com',
  path: '/repos/KRVishnuChaithanya/First_Rescue/actions/artifacts/7687024578/zip',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  if (res.statusCode === 302 || res.statusCode === 301) {
    console.log('Redirecting to:', res.headers.location);
    // Follow redirect
    const redirectUrl = res.headers.location;
    const redirectReq = https.get(redirectUrl, (redirectRes) => {
      console.log('Redirect Status:', redirectRes.statusCode);
      const file = fs.createWriteStream('artifact.zip');
      redirectRes.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Downloaded artifact.zip');
      });
    });
  } else {
    let data = '';
    res.on('data', (c) => data += c);
    res.on('end', () => {
      console.log('Response body:', data);
    });
  }
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
