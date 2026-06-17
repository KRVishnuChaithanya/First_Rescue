const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('artifacts.json', 'utf8'));
  console.log(`Found ${data.total_count} artifacts:`);
  data.artifacts.forEach(art => {
    console.log(`Name: ${art.name}`);
    console.log(`  Size: ${art.size_in_bytes} bytes`);
    console.log(`  Download URL: ${art.archive_download_url}`);
  });
} catch(e) {
  console.error(e);
}
