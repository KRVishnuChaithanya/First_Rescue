const path = require('path');
const fs = require('fs');

module.exports = async function* customReporter(source) {
  yield "============================= test session starts ==============================\n";
  
  let passed = 0;
  let failed = 0;
  let tests = [];
  let startTime = Date.now();
  
  for await (const event of source) {
    if (event.type === 'test:pass' || event.type === 'test:fail') {
      // General suite check
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
      let duration = event.data.details && event.data.details.duration_ms ? event.data.details.duration_ms : 0;
      
      tests.push({ file: relFile, name, status, duration });
      yield `${relFile}::${name} ${status}\n`;
    }
  }
  
  const totalDuration = Date.now() - startTime;
  yield "============================== test session ends ===============================\n";
  const total = passed + failed;
  const passedPercentage = total > 0 ? Math.round((passed / total) * 100) : 0;
  yield `\n${passed} passed, ${failed} failed in total (${passedPercentage}% success)\n`;

  // Generate Markdown table with Interpretation and Conclusion for GitHub Step Summary
  let md = `### 🧪 Test Suite Results\n\n`;
  
  // Endpoint Breakdown (Table format requested by user)
  md += `**Test Breakdown**\n\n`;
  md += `| Test File | Test Case | Status | Duration |\n`;
  md += `|-----------|-----------|--------|----------|\n`;
  for (const t of tests) {
    const emoji = t.status === 'PASSED' ? '✅' : '❌';
    md += `| \`${t.file}\` | ${t.name} | ${emoji} ${t.status} | ${t.duration.toFixed(1)} ms |\n`;
  }
  
  md += `\n💡 **Interpretation**\n`;
  md += `- **Success Rate:** ${passedPercentage}% of tests passed successfully.\n`;
  md += `- **Failure Rate:** ${total > 0 ? ((failed/total)*100).toFixed(1) : 0}% failures. -> ${failed === 0 ? 'Excellent performance' : 'Requires attention'}\n`;
  md += `- **Total Tests:** ${total} test cases executed.\n`;
  md += `- **Execution Time:** System successfully executed tests in ${totalDuration} ms.\n`;
  
  md += `\n📝 **Conclusion**\n`;
  if (failed === 0) {
    md += `The test verifies the backend and frontend components, logical branches, and overall system stability under expected conditions. All systems are fully operational with 0 errors.\n`;
  } else {
    md += `The test suite encountered ${failed} errors. Immediate attention is required to fix the failing tests before proceeding with deployment.\n`;
  }
  
  fs.writeFileSync('test-summary.md', md);
};
