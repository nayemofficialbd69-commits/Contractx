package com.connectx.messenger.webrtc

import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjection
import com.google.firebase.firestore.FirebaseFirestore
import org.webrtc.*
import java.util.UUID

class WebRtcCallManager(
    private val context: Context,
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    private var peerConnectionFactory: PeerConnectionFactory? = null
    private var peerConnection: PeerConnection? = null
    private var localAudioTrack: AudioTrack? = null
    private var localVideoTrack: VideoTrack? = null
    private var videoCapturer: VideoCapturer? = null
    private var screenCapturer: VideoCapturer? = null
    private var isScreenSharing: Boolean = false

    private val iceServers = listOf(
        PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer(),
        PeerConnection.IceServer.builder("stun:stun1.l.google.com:19302").createIceServer()
    )

    fun initWebRtc(eglBaseContext: EglBase.Context) {
        val options = PeerConnectionFactory.InitializationOptions.builder(context)
            .setEnableInternalTracer(true)
            .createInitializationOptions()
        PeerConnectionFactory.initialize(options)

        peerConnectionFactory = PeerConnectionFactory.builder()
            .setVideoDecoderFactory(DefaultVideoDecoderFactory(eglBaseContext))
            .setVideoEncoderFactory(DefaultVideoEncoderFactory(eglBaseContext, true, true))
            .createPeerConnectionFactory()
    }

    fun startLocalAudioCapture() {
        val audioSource = peerConnectionFactory?.createAudioSource(MediaConstraints())
        localAudioTrack = peerConnectionFactory?.createAudioTrack("ARDAMSa0", audioSource)
        localAudioTrack?.setEnabled(true)
    }

    fun startScreenShare(mediaProjectionResultData: Intent, callback: MediaProjection.Callback) {
        screenCapturer = ScreenCapturerAndroid(mediaProjectionResultData, callback)
        isScreenSharing = true
    }

    fun stopScreenShare() {
        screenCapturer?.stopCapture()
        screenCapturer?.dispose()
        screenCapturer = null
        isScreenSharing = false
    }

    fun toggleMute(muted: Boolean) {
        localAudioTrack?.setEnabled(!muted)
    }

    fun toggleVideo(enabled: Boolean) {
        localVideoTrack?.setEnabled(enabled)
    }

    fun endCall(callId: String) {
        peerConnection?.close()
        peerConnection = null
        localAudioTrack?.dispose()
        localVideoTrack?.dispose()
        firestore.collection("callSessions").document(callId).update("status", "ended")
    }
}
