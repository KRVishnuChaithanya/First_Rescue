# PowerShell script to start Vite preview server, wait until it's ready, run Selenium tests, then stop the server
# Navigate to client directory
Set-Location "c:/Users/HP/OneDrive/Desktop/First_Rescue-main/First_Rescue-main/firstresponder/client"
# Build the client (required for Vite preview)
npm run build
# Start Vite preview in background on fixed port
$preview = Start-Process "cmd.exe" -ArgumentList "/c npx vite preview --port 5173" -NoNewWindow -PassThru
# Wait a moment for server to start
Start-Sleep -Seconds 10
# Return to project root (firstresponder) as CI does
Set-Location "c:/Users/HP/OneDrive/Desktop/First_Rescue-main/First_Rescue-main/firstresponder"
# Run Selenium tests (matches CI path)
node --test --test-concurrency=1 test/*.e2e.test.js
$testExit = $LASTEXITCODE
# Stop preview server
exit $testExit
