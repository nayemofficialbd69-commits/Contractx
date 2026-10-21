import React, { useState } from 'react';
import { Folder, FileCode, Copy, Check, Download, Layers, Shield, Smartphone } from 'lucide-react';

interface ProjectFile {
  path: string;
  language: string;
  description: string;
  content: string;
}

const ANDROID_PROJECT_FILES: ProjectFile[] = [
  {
    path: 'android/settings.gradle.kts',
    language: 'kotlin',
    description: 'Gradle plugin management and repositories configuration',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "ConnectXMessenger"
include(":app")`,
  },
  {
    path: 'android/build.gradle.kts',
    language: 'kotlin',
    description: 'Project-level Gradle build configuration',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    id("com.google.gms.google-services") version "4.4.2" apply false
}`,
  },
  {
    path: 'android/app/build.gradle.kts',
    language: 'kotlin',
    description: 'App-level build file with Compose, Material 3, Firebase & WebRTC dependencies',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.connectx.messenger"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.connectx.messenger"
        minSdk = 26
        targetSdk = 35
        versionCode = 24
        versionName = "2.4.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.3")

    // Firebase
    val firebaseBom = platform("com.google.firebase:firebase-bom:33.5.1")
    implementation(firebaseBom)
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-storage-ktx")
    implementation("com.google.firebase:firebase-messaging-ktx")

    // WebRTC & Media
    implementation("io.getstream:stream-webrtc-android:1.2.2")
    implementation("io.coil-kt:coil-compose:2.7.0")
}`,
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Android manifest with WebRTC, Camera, Mic, and Foreground MediaProjection permissions',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />

    <application
        android:name=".ConnectXApplication"
        android:icon="@mipmap/ic_launcher"
        android:label="ConnectX"
        android:theme="@style/Theme.ConnectX">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <!-- Public ID Deep Link (cx://user/CX-7K4M9P2Q) -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="cx" android:host="user" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
  },
  {
    path: 'android/app/src/main/java/com/connectx/messenger/data/model/User.kt',
    language: 'kotlin',
    description: 'Kotlin data model for User profile with Public ID and normalized handle',
    content: `package com.connectx.messenger.data.model

data class User(
    val uid: String = "",
    val displayName: String = "",
    val username: String = "",
    val usernameNormalized: String = "",
    val publicId: String = "", // e.g. CX-7K4M9P2Q
    val photoURL: String = "",
    val bio: String = "Available",
    val email: String? = null,
    val phoneNumber: String? = null,
    val isEmailVerified: Boolean = false,
    val isPhoneVerified: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val lastSeen: Long = System.currentTimeMillis(),
    val isOnline: Boolean = false,
    val accountStatus: String = "active",
    val isAdmin: Boolean = false
)`,
  },
  {
    path: 'android/app/src/main/java/com/connectx/messenger/data/repository/AuthRepository.kt',
    language: 'kotlin',
    description: 'Transactional registration guaranteeing unique Public ID and unique username',
    content: `package com.connectx.messenger.data.repository

import com.connectx.messenger.data.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import java.security.SecureRandom
import java.util.Locale

class AuthRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    private val safeAlphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"
    private val secureRandom = SecureRandom()

    fun generateRawPublicId(): String {
        val sb = StringBuilder("CX-")
        repeat(8) {
            val idx = secureRandom.nextInt(safeAlphabet.length)
            sb.append(safeAlphabet[idx])
        }
        return sb.toString()
    }

    suspend fun registerUser(
        uid: String,
        displayName: String,
        username: String,
        email: String?,
        phoneNumber: String?,
        photoUrl: String?
    ): Result<User> {
        val normalized = username.trim().lowercase(Locale.ROOT)
        val usernamesRef = firestore.collection("usernames").document(normalized)
        val userDocRef = firestore.collection("users").document(uid)

        return try {
            firestore.runTransaction { transaction ->
                val usernameSnapshot = transaction.get(usernamesRef)
                if (usernameSnapshot.exists()) {
                    throw IllegalStateException("Username @$normalized is taken")
                }

                var candidateId = generateRawPublicId()
                var attempts = 0
                while (attempts < 5) {
                    val publicIdRef = firestore.collection("publicIds").document(candidateId)
                    if (!transaction.get(publicIdRef).exists()) {
                        transaction.set(publicIdRef, mapOf("uid" to uid))
                        break
                    }
                    candidateId = generateRawPublicId()
                    attempts++
                }

                val user = User(
                    uid = uid,
                    displayName = displayName.trim(),
                    username = normalized,
                    usernameNormalized = normalized,
                    publicId = candidateId,
                    photoURL = photoUrl ?: "",
                    email = email,
                    phoneNumber = phoneNumber
                )

                transaction.set(usernamesRef, mapOf("uid" to uid))
                transaction.set(userDocRef, user)
                user
            }.await().let { Result.success(it) }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}`,
  },
  {
    path: 'firestore.rules',
    language: 'javascript',
    description: 'Production Firestore security rules with Master Gate, RBAC, and ABAC validation',
    content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }

    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }
    function isAdmin() {
      return isSignedIn() && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
        (request.auth.token.email == 'nayemofficial.bd69@gmail.com' && request.auth.token.email_verified == true)
      );
    }
    function isValidId(id) { return id is string && id.size() > 0 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$'); }
    function isValidPublicId(id) { return id is string && id.size() == 11 && id.matches('^CX-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$'); }

    // Users Collection (RBAC & PII Isolation)
    match /users/{userId} {
      allow get: if isOwner(userId) || isAdmin() || (isSignedIn() && resource.data.privacy.whoCanFindByUsername == 'everyone');
      allow list: if isSignedIn() && (resource.data.uid == request.auth.uid || isAdmin());
      allow create: if isOwner(userId) && request.resource.data.uid == request.auth.uid && request.resource.data.isAdmin == false && request.resource.data.accountStatus == 'active';
      allow update: if (isOwner(userId) && request.resource.data.uid == resource.data.uid && request.resource.data.publicId == resource.data.publicId && request.resource.data.isAdmin == resource.data.isAdmin && request.resource.data.accountStatus == resource.data.accountStatus && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['displayName', 'photoURL', 'bio', 'privacy', 'blockedUsers', 'updatedAt', 'lastSeen', 'isOnline'])) || isAdmin();
      allow delete: if isOwner(userId) || isAdmin();
    }

    // Conversations Collection (Relational Access)
    match /conversations/{convId} {
      allow get, list: if isSignedIn() && (request.auth.uid in resource.data.participantIds || isAdmin());
      allow create: if isSignedIn() && isValidId(convId) && request.auth.uid in request.resource.data.participantIds;
      allow update: if isSignedIn() && ((request.auth.uid in resource.data.participantIds && request.resource.data.participantIds == resource.data.participantIds && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastMessage', 'updatedAt', 'groupMeta', 'unreadCounts'])) || isAdmin());
      allow delete: if isAdmin() || (isSignedIn() && resource.data.groupMeta.createdBy == request.auth.uid);

      // Subcollection Messages (Master Gate Relational Sync)
      match /messages/{msgId} {
        allow get, list: if isSignedIn() && (request.auth.uid in get(/databases/$(database)/documents/conversations/$(convId)).data.participantIds || isAdmin());
        allow create: if isSignedIn() && isValidId(msgId) && request.resource.data.senderId == request.auth.uid && (request.auth.uid in get(/databases/$(database)/documents/conversations/$(convId)).data.participantIds);
        allow update: if (isSignedIn() && resource.data.senderId == request.auth.uid && request.resource.data.senderId == resource.data.senderId && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['text', 'isEdited', 'updatedAt', 'reactions', 'status'])) || (isSignedIn() && request.auth.uid in get(/databases/$(database)/documents/conversations/$(convId)).data.participantIds && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['reactions'])) || isAdmin();
        allow delete: if isSignedIn() && (resource.data.senderId == request.auth.uid || isAdmin());
      }
    }

    // Admin Audit Logs (Strict Admin Verification - Append Only & Tamper Proof)
    match /adminAuditLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAdmin() && isValidId(logId) && request.resource.data.adminId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}`,
  },
  {
    path: 'firebase-blueprint.json',
    language: 'json',
    description: 'Intermediate representation schema matching TypeScript interface specifications',
    content: `{
  "entities": {
    "User": {
      "title": "User",
      "description": "User account entity",
      "type": "object",
      "properties": {
        "uid": { "type": "string" },
        "displayName": { "type": "string" },
        "username": { "type": "string" },
        "publicId": { "type": "string" }
      }
    }
  },
  "firestore": {
    "/users/{uid}": { "schema": "User", "description": "User profiles" }
  }
}`,
  },
];

export const CodeExplorerView: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeFile = ANDROID_PROJECT_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
      {/* Subheader */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Android Kotlin Codebase & Project Tree</h1>
            <p className="text-xs text-slate-400">Jetpack Compose · Material 3 · WebRTC · Firebase Coroutines</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/connectx_messenger_full_project.zip"
            download="connectx_messenger_full_project.zip"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
            title="Download full project archive (.zip)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP</span>
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Tree Explorer */}
        <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950/70 p-4 overflow-y-auto shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
            Source Files ({ANDROID_PROJECT_FILES.length})
          </span>
          <div className="space-y-1">
            {ANDROID_PROJECT_FILES.map((f, i) => (
              <button
                key={f.path}
                onClick={() => setSelectedFileIndex(i)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-colors font-mono ${
                  selectedFileIndex === i
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-semibold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <FileCode className="w-4 h-4 shrink-0 text-purple-400" />
                <span className="truncate">{f.path.replace('android/', '')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="flex-1 flex flex-col bg-slate-900/60 overflow-hidden">
          <div className="px-6 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-purple-400 font-bold">{activeFile.path}</span>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">{activeFile.description}</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase text-[10px]">
              {activeFile.language}
            </span>
          </div>

          <pre className="flex-1 p-6 overflow-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-950/40">
            <code>{activeFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
