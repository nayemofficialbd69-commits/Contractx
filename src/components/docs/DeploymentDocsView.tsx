import React from 'react';
import { BookOpen, Radio, Shield, Key, Terminal, Smartphone, CheckSquare } from 'lucide-react';

export const DeploymentDocsView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)] overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            <span>ConnectX Technical Specification</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Architecture, WebRTC & Deployment Documentation
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Production guidelines for compiling the Android client, provisioning Firebase, configuring STUN/TURN, and releasing signed bundles.
          </p>
        </div>

        {/* 1. Identity Triad Specification */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center gap-2.5 text-base font-bold text-white">
            <Key className="w-5 h-5 text-purple-400" />
            <h2>1. Identity Triad Architecture</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ConnectX enforces three distinct identity levels to prevent identity spoofing, duplicate handles, and account takeover:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-purple-300 block mb-1">A. Display Name</span>
              <p className="text-slate-400 text-[11px]">
                Shown in chat headers and conversation feeds. Freely editable, does not have to be unique.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-purple-300 block mb-1">B. Unique Username</span>
              <p className="text-slate-400 text-[11px]">
                Handle format: <code>@username</code>. Enforced transactionally in the <code>/usernames/</code> collection. Lowercase normalized.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-purple-300 block mb-1">C. Public ID Code</span>
              <p className="text-slate-400 text-[11px]">
                Format: <code>CX-7K4M9P2Q</code>. Generated via crypto-secure collision-resistant generator. Permanent and immutable.
              </p>
            </div>
          </div>
        </div>

        {/* 2. WebRTC & STUN/TURN Setup */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center gap-2.5 text-base font-bold text-white">
            <Radio className="w-5 h-5 text-blue-400" />
            <h2>2. WebRTC Audio/Video & Screen Sharing Setup</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Calls use direct peer-to-peer transport with Google STUN servers for NAT traversal:
          </p>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
{`val iceServers = listOf(
    PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer(),
    PeerConnection.IceServer.builder("stun:stun1.l.google.com:19302").createIceServer()
)
val rtcConfig = PeerConnection.RTCConfiguration(iceServers).apply {
    bundlePolicy = PeerConnection.BundlePolicy.MAXBUNDLE
    sdpSemantics = PeerConnection.SdpSemantics.UNIFIED_PLAN
}`}
          </pre>
          <p className="text-xs text-slate-400">
            For Symmetric NATs, configure a production TURN server (coturn) with username/credential tokens.
          </p>
        </div>

        {/* 3. Android Build & Release Commands */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center gap-2.5 text-base font-bold text-white">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2>3. APK & Signed AAB Build Commands</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Build Debug APK for testing:</span>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-slate-200">
./gradlew assembleDebug
              </pre>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Build Release Android App Bundle (.aab) for Google Play:</span>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-slate-200">
./gradlew bundleRelease
              </pre>
            </div>
          </div>
        </div>

        {/* 4. Security & Privacy Checklist */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center gap-2.5 text-base font-bold text-white">
            <Shield className="w-5 h-5 text-purple-400" />
            <h2>4. Security & Privacy Hardening Verification</h2>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero client trust: username and Public ID uniqueness guaranteed by server transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Firestore Master Gate: Subcollection messages protected by parent conversation membership</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Admin console role verification protected against client-side elevation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Screen sharing explicitly requests MediaProjection runtime permission with foreground service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
