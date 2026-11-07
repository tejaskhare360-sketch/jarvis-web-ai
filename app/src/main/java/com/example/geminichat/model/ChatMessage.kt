package com.example.geminichat.model

import java.util.UUID

enum class ParticipantRole {
    USER,
    MODEL,
    ERROR
}

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val role: ParticipantRole,
    val text: String,
    val isStreaming: Boolean = false,
    val timestamp: Long = System.currentTimeMillis()
)
