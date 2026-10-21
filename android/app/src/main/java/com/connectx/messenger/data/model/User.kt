package com.connectx.messenger.data.model

data class User(
    val uid: String = "",
    val displayName: String = "",
    val username: String = "",
    val usernameNormalized: String = "",
    val publicId: String = "", // e.g., CX-7K4M9P2Q
    val photoURL: String = "",
    val bio: String = "Available",
    val email: String? = null,
    val phoneNumber: String? = null,
    val isEmailVerified: Boolean = false,
    val isPhoneVerified: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val lastSeen: Long = System.currentTimeMillis(),
    val isOnline: Boolean = false,
    val accountStatus: String = "active", // "active", "suspended", "deactivated"
    val suspensionReason: String? = null,
    val isAdmin: Boolean = false,
    val blockedUsers: List<String> = emptyList()
)

data class PrivacySettings(
    val lastSeenVisibility: String = "everyone", // "everyone", "contacts", "nobody"
    val readReceipts: Boolean = true,
    val whoCanFindByPublicId: String = "everyone",
    val whoCanFindByUsername: String = "everyone"
)
