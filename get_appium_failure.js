const https = require('https');

const options = {
  hostname: 'api.github.com',
  path: '/repos/KRVishnuChaithanya/First_Rescue/actions/runs?status=failure',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const runs = json.workflow_runs.filter(r => r.name.includes('Appium'));
    if (runs.length > 0) {
      console.log('Latest Appium Run URL:', runs[0].html_url);
      console.log('Jobs URL:', runs[0].jobs_url);
      
      // Fetch jobs to see which failed
      https.get({
        hostname: 'api.github.com',
        path: new URL(runs[0].jobs_url).pathname,
        method: 'GET',
        headers: { 'User-Agent': 'Node.js' }
      }, (res2) => {
        let jobData = '';
        res2.on('data', chunk => jobData += chunk);
        res2.on('end', () => {
          const jobsJson = JSON.parse(jobData);
          const failedJob = jobsJson.jobs.find(j => j.conclusion === 'failure');
          if (failedJob) {
            console.log('Failed Step:', failedJob.steps.find(s => s.conclusion === 'failure'));
          } else {
            console.log('No failed job found or still running?');
          }
        });
      });
    } else {
      console.log('No Appium runs found.');
    }
  });
}).on('error', console.error);
