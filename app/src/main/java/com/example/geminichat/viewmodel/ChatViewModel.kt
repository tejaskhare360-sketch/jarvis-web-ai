package com.example.geminichat.viewmodel

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.geminichat.data.GeminiService
import com.example.geminichat.model.ChatMessage
import com.example.geminichat.model.ParticipantRole
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val inputText: String = "",
    val isGenerating: Boolean = false,
    val apiKey: String = "",
    val showApiKeyDialog: Boolean = false,
    val errorMessage: String? = null
)

class ChatViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = application.getSharedPreferences("gemini_chat_prefs", Context.MODE_PRIVATE)
    private val geminiService = GeminiService()

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    private var currentGenerationJob: Job? = null

    init {
        val savedKey = prefs.getString("gemini_api_key", "") ?: ""
        _uiState.update { it.copy(apiKey = savedKey) }

        // Prompt user for key on first launch if empty
        if (savedKey.isBlank()) {
            _uiState.update { it.copy(showApiKeyDialog = true) }
        }
    }

    fun onInputTextChanged(newText: String) {
        _uiState.update { it.copy(inputText = newText) }
    }

    fun setShowApiKeyDialog(show: Boolean) {
        _uiState.update { it.copy(showApiKeyDialog = show) }
    }

    fun saveApiKey(newKey: String) {
        val trimmed = newKey.trim()
        prefs.edit().putString("gemini_api_key", trimmed).apply()
        _uiState.update {
            it.copy(
                apiKey = trimmed,
                showApiKeyDialog = false,
                errorMessage = null
            )
        }
    }

    fun clearChat() {
        currentGenerationJob?.cancel()
        _uiState.update {
            it.copy(
                messages = emptyList(),
                isGenerating = false,
                errorMessage = null
            )
        }
    }

    fun dismissError() {
        _uiState.update { it.copy(errorMessage = null) }
    }

    fun sendMessage(userPrompt: String = _uiState.value.inputText) {
        val prompt = userPrompt.trim()
        if (prompt.isBlank() || _uiState.value.isGenerating) return

        val key = _uiState.value.apiKey
        if (key.isBlank()) {
            _uiState.update { it.copy(showApiKeyDialog = true) }
            return
        }

        val userMessage = ChatMessage(
            role = ParticipantRole.USER,
            text = prompt
        )

        // Snapshot prior history before appending new query
        val conversationHistory = _uiState.value.messages

        // Create initial streaming model response placeholder
        val modelPlaceholder = ChatMessage(
            role = ParticipantRole.MODEL,
            text = "",
            isStreaming = true
        )

        _uiState.update { state ->
            state.copy(
                messages = state.messages + userMessage + modelPlaceholder,
                inputText = "",
                isGenerating = true,
                errorMessage = null
            )
        }

        currentGenerationJob = viewModelScope.launch {
            val responseBuffer = StringBuilder()
            val placeholderId = modelPlaceholder.id

            geminiService.streamChatResponse(
                apiKey = key,
                history = conversationHistory,
                prompt = prompt
            ).catch { throwable ->
                val errorMsg = throwable.localizedMessage ?: "Failed to generate response. Check your API key and connection."
                _uiState.update { state ->
                    val updatedMessages = state.messages.map { msg ->
                        if (msg.id == placeholderId) {
                            msg.copy(
                                role = ParticipantRole.ERROR,
                                text = "⚠️ $errorMsg",
                                isStreaming = false
                            )
                        } else msg
                    }
                    state.copy(
                        messages = updatedMessages,
                        isGenerating = false,
                        errorMessage = errorMsg
                    )
                }
            }.collect { chunk ->
                responseBuffer.append(chunk)
                _uiState.update { state ->
                    val updatedMessages = state.messages.map { msg ->
                        if (msg.id == placeholderId) {
                            msg.copy(
                                text = responseBuffer.toString(),
                                isStreaming = true
                            )
                        } else msg
                    }
                    state.copy(messages = updatedMessages)
                }
            }

            // Mark streaming as finalized
            _uiState.update { state ->
                val finalMessages = state.messages.map { msg ->
                    if (msg.id == placeholderId) {
                        msg.copy(isStreaming = false)
                    } else msg
                }
                state.copy(
                    messages = finalMessages,
                    isGenerating = false
                )
            }
        }
    }
}
