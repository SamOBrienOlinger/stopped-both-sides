set -euo pipefail
mkdir -p android-results
adb wait-for-device
adb shell settings put secure show_ime_with_hard_keyboard 1
adb shell settings put system accelerometer_rotation 0
adb shell input keyevent 224
adb shell wm dismiss-keyguard
adb shell wm size > android-results/display.txt
adb shell wm density >> android-results/display.txt
adb shell getprop ro.build.fingerprint > android-results/build.txt
adb shell ime list -s > android-results/imes.txt
adb shell dumpsys webviewupdate > android-results/webview.txt
node candidate/tests/browser/server.mjs --port 4173 >android-results/site.log 2>&1 &
site_pid=$!
trap 'kill "$site_pid" 2>/dev/null || true' EXIT
for i in {1..20}; do if curl -fsS http://127.0.0.1:4173/stopped-both-sides/ >/dev/null; then break; fi; sleep 1; done
adb reverse tcp:4173 tcp:4173
if adb shell pm path com.android.chrome | grep -q '^package:'; then
  adb shell am set-debug-app --persistent com.android.chrome
  adb shell "echo 'chrome --disable-fre --no-first-run --disable-default-apps' > /data/local/tmp/chrome-command-line" || true
  adb shell am start -a android.intent.action.VIEW -d http://localhost:4173/stopped-both-sides/ -p com.android.chrome
  if node scripts/android-probe.mjs chrome; then exit 0; else status=$?; fi
  if test "$status" != 12; then exit "$status"; fi
  echo 'Chrome did not expose a usable tab. Testing the installed Android WebView.'
fi
bash scripts/android-webview.sh
node scripts/android-probe.mjs webview
