# Android APK & Signed Bundle (.AAB) Compilation Manual

This guide covers building debug APKs, signed release APKs, and Google Play Store App Bundles for **ConnectX Messenger**.

---

## 1. Environment Setup

| Component | Minimum Version | Recommended |
|---|---|---|
| **Android Studio** | Hedgehog (2023.1.1) | Ladybug (2024.2.1+) |
| **Android Gradle Plugin (AGP)** | 8.3.0 | 8.7.0 |
| **Gradle** | 8.4 | 8.7 |
| **JDK** | OpenJDK 17 | Eclipse Temurin 17 |
| **Build Tools** | 34.0.0 | 35.0.0 |
| **Target SDK** | 35 (Android 15) | 35 |

Verify your environment by running:
```bash
java -version
./gradlew --version
```

---

## 2. Compiling the Debug APK

The debug APK includes debugging symbols, uses the default debug keystore, and bypasses code obfuscation for rapid iteration.

```bash
cd android
./gradlew assembleDebug
```

### Output Location:
```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### Installing on Device via ADB:
```bash
# Connect device via USB with USB Debugging enabled
adb devices

# Install APK
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 3. Creating a Signed Release APK / AAB

For production distribution, Android requires cryptographic signing.

### Step 1: Create a Secure Signing Keystore
```bash
keytool -genkey -v \
  -keystore connectx-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias connectx_key
```

Keep your keystore file and passwords secure; losing them prevents publishing app updates.

### Step 2: Configure `keystore.properties`
Create `android/keystore.properties` (never commit this file to version control):
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=connectx_key
storeFile=../connectx-release-key.jks
```

### Step 3: Compile Signed App Bundle (.aab)
```bash
./gradlew bundleRelease
```
Output:
```text
android/app/build/outputs/bundle/release/app-release.aab
```

### Step 4: Compile Standalone Release APK
If distributing outside Google Play (direct APK download):
```bash
./gradlew assembleRelease
```
Output:
```text
android/app/build/outputs/apk/release/app-release.apk
```

---

## 4. ProGuard & R8 Configuration (`proguard-rules.pro`)

Add rules to prevent R8 from stripping WebRTC and Firebase models:
```proguard
# WebRTC Keep Rules
-keep class org.webrtc.** { *; }
-dontwarn org.webrtc.**

# Firebase Models
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.google.firebase.firestore.PropertyName <fields>;
    @com.google.firebase.firestore.PropertyName <methods>;
}
-keep class com.connectx.messenger.data.model.** { *; }

# Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
```

---

## 5. Build Troubleshooting Checklist

1. **Missing `google-services.json` error**:
   - Download from Firebase Console -> Project Settings -> General -> Your apps -> `google-services.json`. Place in `android/app/google-services.json`.
2. **`compileSdkVersion` mismatch**:
   - Ensure Android SDK Platform 35 is installed in Android Studio via `Tools > SDK Manager > SDK Platforms`.
3. **WebRTC native library load failure**:
   - Verify `io.getstream:stream-webrtc-android:1.2.2` is resolving in `android/app/build.gradle.kts`.
