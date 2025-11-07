/**
 * Type definitions for AstraTickets API (Lesson 3)
 * Mirrors backend Pydantic schemas
 */

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface User {
  id: number
  email: string
  name?: string
  created_at: string
}

export interface UserCreate {
  email: string
  name?: string
}

export interface Ticket {
  id: number
  title: string
  content: string
  status: TicketStatus
  priority: TicketPriority
  tags?: string
  requester_id: number
  created_at: string
  updated_at: string
}

export interface TicketCreate {
  title: string
  content: string
  status?: TicketStatus
  priority?: TicketPriority
  tags?: string
  requester_id: number
}

export interface TicketUpdate {
  title?: string
  content?: string
  status?: TicketStatus
  priority?: TicketPriority
  tags?: string
}

export interface Reply {
  id: number
  ticket_id: number
  author_id: number
  content: string
  created_at: string
}

export interface ReplyCreate {
  author_id: number
  content: string
}

export interface TicketListParams {
  status?: TicketStatus
  priority?: TicketPriority
  requester_id?: number
  page?: number
  page_size?: number
}
