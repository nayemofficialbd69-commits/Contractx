package com.connectx.messenger.data.repository

import com.connectx.messenger.data.model.Conversation
import com.connectx.messenger.data.model.Message
import com.connectx.messenger.data.model.MessageReaction
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class ChatRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    /**
     * Observes real-time messages for an authorized conversation (Master Gate protected)
     */
    fun observeMessages(conversationId: String): Flow<List<Message>> = callbackFlow {
        val listener = firestore.collection("conversations")
            .document(conversationId)
            .collection("messages")
            .orderBy("createdAt", Query.Direction.ASCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val messages = snapshot?.documents?.mapNotNull { it.toObject(Message::class.java) } ?: emptyList()
                trySend(messages)
            }
        awaitClose { listener.remove() }
    }

    /**
     * Observes conversations where the user is an active participant
     */
    fun observeConversations(userId: String): Flow<List<Conversation>> = callbackFlow {
        val listener = firestore.collection("conversations")
            .whereArrayContains("participantIds", userId)
            .orderBy("updatedAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val convs = snapshot?.documents?.mapNotNull { it.toObject(Conversation::class.java) } ?: emptyList()
                trySend(convs)
            }
        awaitClose { listener.remove() }
    }

    suspend fun sendMessage(conversationId: String, message: Message): Result<Unit> {
        return try {
            val batch = firestore.batch()
            val msgRef = firestore.collection("conversations")
                .document(conversationId)
                .collection("messages")
                .document(message.id)
            val convRef = firestore.collection("conversations").document(conversationId)

            batch.set(msgRef, message)
            batch.update(
                convRef,
                mapOf(
                    "lastMessage" to message,
                    "updatedAt" to message.createdAt
                )
            )
            batch.commit().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun reactToMessage(
        conversationId: String,
        messageId: String,
        userId: String,
        emoji: String
    ): Result<Unit> {
        val msgRef = firestore.collection("conversations")
            .document(conversationId)
            .collection("messages")
            .document(messageId)

        return try {
            firestore.runTransaction { tx ->
                val snapshot = tx.get(msgRef)
                val msg = snapshot.toObject(Message::class.java) ?: return@runTransaction
                val reactions = msg.reactions.toMutableList()
                val existingIndex = reactions.indexOfFirst { it.emoji == emoji }

                if (existingIndex >= 0) {
                    val existing = reactions[existingIndex]
                    val updatedUsers = existing.userIds.toMutableList()
                    if (updatedUsers.contains(userId)) {
                        updatedUsers.remove(userId)
                    } else {
                        updatedUsers.add(userId)
                    }
                    if (updatedUsers.isEmpty()) {
                        reactions.removeAt(existingIndex)
                    } else {
                        reactions[existingIndex] = existing.copy(userIds = updatedUsers)
                    }
                } else {
                    reactions.add(MessageReaction(emoji = emoji, userIds = listOf(userId)))
                }
                tx.update(msgRef, "reactions", reactions)
            }.await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
