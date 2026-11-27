set -euo pipefail
base="$RUNNER_TEMP/sbs-keyboard-apk"
mkdir -p "$base/classes" "$base/dex"
platform=$(find "$ANDROID_HOME/platforms" -name android.jar | sort -V | tail -1)
build=$(find "$ANDROID_HOME/build-tools" -mindepth 1 -maxdepth 1 -type d | sort -V | tail -1)
cd "$base"
cat > AndroidManifest.xml <<'XML'
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="org.sbs.audit"><uses-sdk android:minSdkVersion="26" android:targetSdkVersion="32"/><uses-permission android:name="android.permission.INTERNET"/><application android:usesCleartextTraffic="true" android:theme="@android:style/Theme.Material.Light.NoActionBar"><activity android:name=".Browser" android:windowSoftInputMode="adjustResize" android:configChanges="orientation|screenSize|keyboardHidden" android:exported="true"/></application></manifest>
XML
cat > Browser.java <<'JAVA'
package org.sbs.audit;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
public class Browser extends Activity {
  public void onCreate(Bundle saved) {
    super.onCreate(saved);
    WebView.setWebContentsDebuggingEnabled(true);
    WebView view = new WebView(this);
    view.getSettings().setJavaScriptEnabled(true);
    view.getSettings().setDomStorageEnabled(true);
    view.getSettings().setUseWideViewPort(true);
    view.setWebViewClient(new WebViewClient());
    setContentView(view);
    view.loadUrl("http://localhost:4173/stopped-both-sides/");
  }
}
JAVA
javac -source 8 -target 8 -cp "$platform" -d classes Browser.java
"$build/d8" --min-api 26 --lib "$platform" --output dex classes/org/sbs/audit/Browser.class
"$build/aapt" package -f -M AndroidManifest.xml -I "$platform" -F raw.apk
(cd dex && zip -q ../raw.apk classes.dex)
"$build/zipalign" -f 4 raw.apk aligned.apk
keytool -genkeypair -keystore debug.p12 -storepass android -keypass android -alias audit -dname CN=Audit -keyalg RSA -validity 365
"$build/apksigner" sign --ks debug.p12 --ks-pass pass:android --out audit.apk aligned.apk
adb install -r audit.apk
adb shell am start -n org.sbs.audit/.Browser
