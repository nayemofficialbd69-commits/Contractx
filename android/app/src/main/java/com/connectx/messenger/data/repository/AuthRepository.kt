package com.connectx.messenger.data.repository

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

    /**
     * Generates a collision-resistant Public ID in the format CX-XXXXXXXX
     */
    fun generateRawPublicId(): String {
        val sb = StringBuilder("CX-")
        repeat(8) {
            val idx = secureRandom.nextInt(safeAlphabet.length)
            sb.append(safeAlphabet[idx])
        }
        return sb.toString()
    }

    /**
     * Transactionally registers a new user with guaranteed unique publicId and username
     */
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
                    throw IllegalStateException("Username @$normalized is already taken")
                }

                // Generate public ID and ensure collision resistance
                var candidateId = generateRawPublicId()
                var attempts = 0
                while (attempts < 5) {
                    val publicIdRef = firestore.collection("publicIds").document(candidateId)
                    if (!transaction.get(publicIdRef).exists()) {
                        transaction.set(publicIdRef, mapOf("uid" to uid, "createdAt" to System.currentTimeMillis()))
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
                    phoneNumber = phoneNumber,
                    accountStatus = "active",
                    createdAt = System.currentTimeMillis()
                )

                transaction.set(usernamesRef, mapOf("uid" to uid, "createdAt" to System.currentTimeMillis()))
                transaction.set(userDocRef, user)
                user
            }.await().let { Result.success(it) }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun findUserByPublicId(publicId: String): User? {
        val snapshot = firestore.collection("users")
            .whereEqualTo("publicId", publicId.trim().uppercase(Locale.ROOT))
            .limit(1)
            .get()
            .await()
        return snapshot.documents.firstOrNull()?.toObject(User::class.java)
    }

    suspend fun findUserByUsername(username: String): User? {
        val normalized = username.trim().lowercase(Locale.ROOT)
        val snapshot = firestore.collection("users")
            .whereEqualTo("usernameNormalized", normalized)
            .limit(1)
            .get()
            .await()
        return snapshot.documents.firstOrNull()?.toObject(User::class.java)
    }
}
