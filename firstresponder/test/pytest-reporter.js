const path = require('path');

module.exports = async function* customReporter(source) {
  yield "============================= test session starts ==============================\n";
  
  let passed = 0;
  let failed = 0;
  
  for await (const event of source) {
    if (event.type === 'test:pass' || event.type === 'test:fail') {
      // Node.js 20+ uses event.data.type === 'suite'? Let's check event.data
      // Generally we don't want to print the top-level files as passed, only individual tests.
      // A test without subtests usually doesn't have nested tests, but just to be safe:
      if (event.data.name && !event.data.file) {
          // might be root
      }
      
      // Node <= 20 nested tests detection
      if (event.data.details && event.data.details.type === 'suite') {
          continue;
      }
      
      const status = event.type === 'test:pass' ? 'PASSED' : 'FAILED';
      if (status === 'PASSED') passed++;
      else failed++;
      
      let file = event.data.file || 'unknown';
      if (file.startsWith('file://')) {
        file = new URL(file).pathname;
        if (process.platform === 'win32' && file.match(/^\/[a-zA-Z]:\//)) {
          file = file.slice(1);
        }
      }
      
      let relFile = path.relative(process.cwd(), file).replace(/\\/g, '/');
      let name = event.data.name;
      
      // Format to look like Pytest: 
      // file.js::TestName PASSED
      yield `${relFile}::${name} ${status}\n`;
    }
  }
  
  yield "============================== test session ends ===============================\n";
  const total = passed + failed;
  const passedPercentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  yield `\n${passed} passed, ${failed} failed in total (${passedPercentage}% success)\n`;
};
