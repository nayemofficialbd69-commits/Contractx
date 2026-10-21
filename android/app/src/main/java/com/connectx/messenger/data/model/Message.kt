package com.connectx.messenger.data.model

data class Message(
    val id: String = "",
    val conversationId: String = "",
    val senderId: String = "",
    val type: String = "text", // "text", "image", "video", "audio", "file", "location"
    val text: String? = null,
    val mediaUrl: String? = null,
    val mediaDuration: Long? = null,
    val mediaSize: Long? = null,
    val fileName: String? = null,
    val location: LocationData? = null,
    val reactions: List<MessageReaction> = emptyList(),
    val status: String = "sent", // "local_queued", "sent", "delivered", "read"
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long? = null,
    val isEdited: Boolean = false,
    val isDeleted: Boolean = false
)

data class LocationData(
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val name: String? = null,
    val address: String? = null
)

data class MessageReaction(
    val emoji: String = "",
    val userIds: List<String> = emptyList()
)
