/**
 * API service for Knowledge Base (Lesson 4)
 */
import { apiClient } from './client'

export interface KBDocument {
  id?: string
  text: string
  metadata?: Record<string, any>
}

export interface KBIngestRequest {
  collection?: string
  chunk?: boolean
  max_chars?: number
  overlap?: number
  documents: KBDocument[]
}

export interface KBIngestResponse {
  collection: string
  inserted_ids: string[]
  chunks_added: number
}

export interface KBQueryRequest {
  collection?: string
  query: string
  n_results?: number
}

export interface KBMatch {
  id?: string
  text: string
  metadata?: Record<string, any>
  distance?: number
}

export interface KBQueryResponse {
  collection: string
  query: string
  matches: KBMatch[]
}

export interface KBDeleteRequest {
  collection?: string
  ids: string[]
}

export interface KBDeleteResponse {
  collection: string
  deleted: number
}

export const kbApi = {
  async ingest(data: KBIngestRequest): Promise<KBIngestResponse> {
    const response = await apiClient.post<KBIngestResponse>('/kb/ingest', data)
    return response.data
  },

  async search(data: KBQueryRequest): Promise<KBQueryResponse> {
    const response = await apiClient.post<KBQueryResponse>('/kb/search', data)
    return response.data
  },

  async delete(data: KBDeleteRequest): Promise<KBDeleteResponse> {
    const response = await apiClient.post<KBDeleteResponse>('/kb/delete', data)
    return response.data
  },

  async list(params: { collection: string; limit?: number; offset?: number }): Promise<{
    collection: string
    total: number
    items: { id: string; text?: string; metadata?: Record<string, any> }[]
  }> {
    const response = await apiClient.get('/kb/items', { params })
    return response.data
  }
}
