# ConnectX Messenger - Complete Project & Deployment Guide

> **Tagline**: Connect Everyone, Everywhere.  
> **Target Version**: v2.4.0 (Build 24)  
> **Android Target SDK**: 35 (Android 15) · Min SDK: 26 (Android 8.0)  
> **Frontend**: React 19, TypeScript, Tailwind CSS, Vite  
> **Android Native**: Kotlin, Jetpack Compose, Material 3, WebRTC, Firebase KTX  

---

## 1. Project Overview & Direct ZIP Download

The complete application is structured into two primary components:
1. **Android Application (`/android`)**: Production-ready Kotlin Jetpack Compose mobile app supporting real-time chat, voice messaging, WebRTC calling with screen sharing, and the Identity Triad.
2. **Admin Panel (`/admin-panel` & Web Console)**: Separate web-based administration dashboard for user moderation, account suspension, remote config toggles, announcements, and audit logs.

### 📥 Direct ZIP Download
You can download the bundled project archive directly from the application's top navigation bar or via:
- **Download Path**: `/connectx_messenger_full_project.zip`

---

## 2. Complete Project Directory Structure

```text
ConnectX-Messenger/
├── android/                                 # Complete Android Kotlin Project
│   ├── build.gradle.kts                     # Root project build script
│   ├── settings.gradle.kts                  # Repository & plugin management
│   ├── gradle/wrapper/
│   │   └── gradle-wrapper.properties        # Gradle 8.7 distribution
│   └── app/
│       ├── build.gradle.kts                 # App module dependencies (Compose, WebRTC, Firebase)
│       └── src/main/
│           ├── AndroidManifest.xml          # Permissions (Camera, Audio, MediaProjection, Location)
│           ├── res/values/
│           │   ├── strings.xml              # Application strings
│           │   └── themes.xml               # Material 3 window styling
│           └── java/com/connectx/messenger/
│               ├── ConnectXApplication.kt   # FirebaseApp initialization
│               ├── MainActivity.kt          # Edge-to-edge Compose entry point
│               ├── data/
│               │   ├── model/
│               │   │   ├── User.kt          # User & Privacy settings model
│               │   │   ├── Message.kt       # Message & Reaction model
│               │   │   └── Conversation.kt  # Conversation, GroupMeta & CallSession
│               │   └── repository/
│               │       ├── AuthRepository.kt # Transactional Public ID & handle uniqueness
│               │       └── ChatRepository.kt # Real-time Firestore flow & message batching
│               ├── webrtc/
│               │   ├── WebRtcCallManager.kt # STUN ICE traversal & screen capture
│               │   └── ScreenShareForegroundService.kt # Android 14+ Foreground Service
│               ├── ui/
│               │   ├── theme/
│               │   │   ├── Color.kt         # Blue (#2563EB) & Purple (#7C3AED) palettes
│               │   │   └── Theme.kt         # Material 3 light/dark color schemes
│               │   └── navigation/
│               │       └── NavGraph.kt      # Bottom Navigation & route definitions
│
├── admin-panel/                             # Separate Standalone Admin Panel
│   ├── package.json                         # Dependencies (React 19, Lucide, Tailwind)
│   ├── README.md                            # Admin portal quickstart
│   └── src/                                 # Admin UI components
│
├── firebase-blueprint.json                  # Intermediate representation database schema
├── firestore.rules                          # Hardened RBAC and Master Gate rules
├── storage.rules                            # Cloud Storage media & avatar rules
├── security_spec.md                         # Threat vector specification (Dirty Dozen)
├── firestore.rules.test.ts                  # Security assertion test suite
└── public/
    └── connectx_messenger_full_project.zip  # Downloadable full archive
```

---

## 3. How to Build the Android APK

### Prerequisites:
1. **Android Studio** (Ladybug | 2024.2.1 or newer)
2. **Java Development Kit (JDK)**: JDK 17 or JDK 21
3. **Android SDK Platform 35** installed via SDK Manager

### Step 1: Add Firebase Configuration
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create an Android app with package name: `com.connectx.messenger`.
3. Download `google-services.json` and place it in:
   `android/app/google-services.json`

### Step 2: Build Debug APK via Command Line
Open a terminal in the `/android` directory and run:

```bash
# On Linux / macOS:
chmod +x gradlew
./gradlew assembleDebug

# On Windows:
gradlew.bat assembleDebug
```

Your compiled APK will be located at:
```text
android/app/build/outputs/apk/debug/app-debug.apk
```

You can install it directly to an Android phone or emulator with:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 3: Build Release Android App Bundle (.aab) for Google Play Store
1. Generate an upload keystore:
```bash
keytool -genkey -v -keystore connectx-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias connectx
```
2. Run bundleRelease:
```bash
./gradlew bundleRelease
```
The resulting `.aab` file in `android/app/build/outputs/bundle/release/app-release.aab` is ready for upload to Google Play Console.
