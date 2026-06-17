Write-Host "Starting Vite preview..."
$preview = Start-Process -FilePath "npx" -ArgumentList "vite preview --port 5173" -PassThru -NoNewWindow
# Wait a bit for server to start
Start-Sleep -Seconds 5
# Optionally, check if server responding
try {
  $response = Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing -TimeoutSec 10
  Write-Host "Server responded with status $($response.StatusCode)"
} catch {
  Write-Host "Server not responding yet, proceeding anyway"
}
Write-Host "Running Selenium tests..."
node --test --test-concurrency=1 test/*.e2e.test.js
$testExit = $LASTEXITCODE
Write-Host "Tests finished with exit code $testExit"
# Stop preview server
if ($preview -and !$preview.HasExited) {
  Write-Host "Stopping preview server..."
  Stop-Process -Id $preview.Id -Force
}
exit $testExit
