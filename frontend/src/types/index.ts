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

export interface TicketAISuggestionRequest {
  collection?: string
  n_results?: number
  provider?: string
  base_url?: string
  model?: string
  api_key?: string
}

export interface TicketAISuggestionResponse {
  ticket_id: number
  category: string
  confidence: number
  suggested_priority: TicketPriority
  suggested_tags: string[]
  ai_reply: string
  kb_snippets: string[]
}

export type ChatRole = 'user' | 'assistant'

export interface AIChatMessage {
  role: ChatRole
  content: string
  kb_sources?: string[]
  kb_snippets?: string[]
}

export interface AIChatRequest {
  query: string
  collection?: string
  n_results?: number
  distance_threshold?: number
  history?: AIChatMessage[]
  provider?: string
  base_url?: string
  model?: string
  api_key?: string
}

export interface AIChatResponse {
  query: string
  answer: string
  kb_sources: string[]
  kb_snippets: string[]
}

export interface TicketMessage {
  id: number
  ticket_id: number
  sender_id: number
  sender_type: 'user' | 'agent'
  content: string
  created_at: string
}

export interface TicketMessageCreate {
  content: string
}

export interface ChatMessage {
  id: number
  session_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatSession {
  id: number
  user_id?: number
  title: string
  created_at: string
  updated_at: string
  messages: ChatMessage[]
}

export interface ChatSessionCreate {
  title: string
}

export interface ChatMessageRequest {
  query: string
  collection?: string
  n_results?: number
  distance_threshold?: number
  provider?: string
  base_url?: string
  model?: string
  api_key?: string
}
