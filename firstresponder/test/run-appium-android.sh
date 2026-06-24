#!/usr/bin/env bash
# run-appium-android.sh
# ─────────────────────────────────────────────────────────────────────────────
# This script runs INSIDE the Android emulator runner environment.
# It is called by android-emulator-runner@v2 via a single `script:` line
# to avoid /bin/sh YAML multiline parsing issues.
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "✅ Android Emulator is running — waiting for full boot..."

# Wait until the emulator has fully booted (sys.boot_completed = 1)
adb wait-for-device shell 'while [ "$(getprop sys.boot_completed 2>/dev/null | tr -d \r)" != "1" ]; do sleep 3; done; echo BOOTED'

echo "✅ Emulator fully booted!"

# Unlock screen (dismiss keyguard)
adb shell input keyevent 82 || true

# Log Chrome / WebView packages available
echo "--- Installed browser/chrome packages ---"
adb shell pm list packages | grep -iE "chrome|webview|browser" || echo "No browser package found"

# Run Appium test suite from the firstresponder folder
cd firstresponder

echo "### 📱 Appium Android Test Results" >> "$GITHUB_STEP_SUMMARY"

node --test \
  --test-reporter=./test/pytest-reporter.js \
  test/appium.*.test.js 2>&1 | tee appium-report.txt
TEST_EXIT=${PIPESTATUS[0]}

if [ -f test-summary.md ]; then
  cat test-summary.md >> "$GITHUB_STEP_SUMMARY"
fi

echo "" >> "$GITHUB_STEP_SUMMARY"
echo "**Emulator:** Android API 31 (Google APIs) · x86_64 · Pixel 5" >> "$GITHUB_STEP_SUMMARY"

exit $TEST_EXIT
