/**
 * API service for Chat Sessions
 */
import { apiClient } from './client'
import type {
    ChatSession,
    ChatSessionCreate,
    ChatMessage,
    ChatMessageRequest
} from '../types'

export const chatApi = {
    /**
     * List all chat sessions
     */
    async listSessions(): Promise<ChatSession[]> {
        const response = await apiClient.get<ChatSession[]>('/chat/sessions')
        return response.data
    },

    /**
     * Create a new chat session
     */
    async createSession(data: ChatSessionCreate): Promise<ChatSession> {
        const response = await apiClient.post<ChatSession>('/chat/sessions', data)
        return response.data
    },

    /**
     * Get a specific chat session with messages
     */
    async getSession(sessionId: number): Promise<ChatSession> {
        const response = await apiClient.get<ChatSession>(`/chat/sessions/${sessionId}`)
        return response.data
    },

    /**
     * Delete a chat session
     */
    async deleteSession(sessionId: number): Promise<void> {
        await apiClient.delete(`/chat/sessions/${sessionId}`)
    },

    /**
     * Send a message to a session and get AI response
     */
    async sendMessage(sessionId: number, data: ChatMessageRequest): Promise<ChatMessage> {
        const response = await apiClient.post<ChatMessage>(
            `/chat/sessions/${sessionId}/messages`,
            data
        )
        return response.data
    }
}
