/**
 * API service for Tickets (Lesson 3)
 */
import { apiClient } from './client'
import type {
  Ticket,
  TicketCreate,
  TicketUpdate,
  TicketListParams,
  Reply,
  ReplyCreate
} from '../types'

export const ticketApi = {
  /**
   * Create a new ticket
   */
  async create(data: TicketCreate): Promise<Ticket> {
    const response = await apiClient.post<Ticket>('/tickets/', data)
    return response.data
  },

  /**
   * List tickets with optional filters
   */
  async list(params?: TicketListParams): Promise<Ticket[]> {
    const response = await apiClient.get<Ticket[]>('/tickets/', { params })
    return response.data
  },

  /**
   * Get ticket by ID
   */
  async get(id: number): Promise<Ticket> {
    const response = await apiClient.get<Ticket>(`/tickets/${id}`)
    return response.data
  },

  /**
   * Update ticket
   */
  async update(id: number, data: TicketUpdate): Promise<Ticket> {
    const response = await apiClient.put<Ticket>(`/tickets/${id}`, data)
    return response.data
  },

  /**
   * Delete ticket
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tickets/${id}`)
  },

  /**
   * Add reply to ticket
   */
  async addReply(ticketId: number, data: ReplyCreate): Promise<Reply> {
    const response = await apiClient.post<Reply>(`/tickets/${ticketId}/replies`, data)
    return response.data
  },

  /**
   * List replies for a ticket
   */
  async listReplies(ticketId: number): Promise<Reply[]> {
    const response = await apiClient.get<Reply[]>(`/tickets/${ticketId}/replies`)
    return response.data
  }
}
