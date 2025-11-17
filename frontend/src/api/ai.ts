/**
 * API service for AI helpers (Lesson 5)
 */
import { apiClient } from './client'
import type {
  TicketAISuggestionRequest,
  TicketAISuggestionResponse,
  AIChatRequest,
  AIChatResponse
} from '../types'

export const aiApi = {
  /**
   * Generate AI suggestion (category + draft reply) for a ticket.
   */
  async suggestForTicket(
    ticketId: number,
    data?: TicketAISuggestionRequest
  ): Promise<TicketAISuggestionResponse> {
    const response = await apiClient.post<TicketAISuggestionResponse>(
      `/ai/tickets/${ticketId}/suggest`,
      data ?? {}
    )
    return response.data
  },

  /**
   * RAG-augmented chat with the knowledge base.
   */
  async chat(payload: AIChatRequest): Promise<AIChatResponse> {
    const response = await apiClient.post<AIChatResponse>('/ai/chat', payload)
    return response.data
  }
}
