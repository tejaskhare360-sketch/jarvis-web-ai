package com.example.geminichat.data

import com.example.geminichat.model.ChatMessage
import com.example.geminichat.model.ParticipantRole
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.google.ai.client.generativeai.type.generationConfig
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class GeminiService {

    // Default to the fast, low-latency, and capable Gemini 1.5 Flash model
    var modelName: String = "gemini-1.5-flash"

    // System instructions define the assistant's tone and formatting
    var systemInstructionText: String =
        "You are Gemini, a helpful, friendly, and knowledgeable AI assistant. " +
        "Provide direct, clear answers and format code, lists, and key points nicely using Markdown."

    fun streamChatResponse(
        apiKey: String,
        history: List<ChatMessage>,
        prompt: String
    ): Flow<String> = flow {
        val cleanKey = apiKey.trim()
        if (cleanKey.isBlank()) {
            throw IllegalArgumentException("Gemini API key is not set. Please tap the Key icon at the top to configure your API key.")
        }

        val generativeModel = GenerativeModel(
            modelName = modelName,
            apiKey = cleanKey,
            generationConfig = generationConfig {
                temperature = 0.7f
                topK = 40
                topP = 0.95f
            },
            systemInstruction = content {
                text(systemInstructionText)
            }
        )

        // Map prior conversation turns to Gemini Content items for multi-turn conversational context
        val chatHistory = history
            .filter { it.role != ParticipantRole.ERROR && it.text.isNotBlank() }
            .map { msg ->
                val roleStr = if (msg.role == ParticipantRole.USER) "user" else "model"
                content(role = roleStr) {
                    text(msg.text)
                }
            }

        val chat = generativeModel.startChat(history = chatHistory)
        val stream = chat.sendMessageStream(prompt)

        stream.collect { response ->
            val textChunk = response.text
            if (!textChunk.isNullOrEmpty()) {
                emit(textChunk)
            }
        }
    }
}
