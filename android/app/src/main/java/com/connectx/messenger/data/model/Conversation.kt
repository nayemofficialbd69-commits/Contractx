package com.connectx.messenger.data.model

data class Conversation(
    val id: String = "",
    val type: String = "direct", // "direct", "group"
    val participantIds: List<String> = emptyList(),
    val groupMeta: GroupMeta? = null,
    val lastMessage: Message? = null,
    val unreadCounts: Map<String, Long> = emptyMap(),
    val isMuted: Boolean = false,
    val isArchived: Boolean = false,
    val isPinned: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

data class GroupMeta(
    val name: String = "",
    val photoURL: String? = null,
    val description: String? = null,
    val adminIds: List<String> = emptyList(),
    val createdBy: String = "",
    val membersCount: Int = 0
)

data class CallSession(
    val id: String = "",
    val callerId: String = "",
    val receiverId: String? = null,
    val conversationId: String? = null,
    val type: String = "audio", // "audio", "video"
    val status: String = "calling", // "calling", "ringing", "connected", "ended", "rejected", "missed"
    val startedAt: Long = System.currentTimeMillis(),
    val connectedAt: Long? = null,
    val endedAt: Long? = null,
    val durationSeconds: Long = 0,
    val isScreenSharing: Boolean = false
)
