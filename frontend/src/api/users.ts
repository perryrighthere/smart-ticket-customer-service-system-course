/**
 * API service for Users (Lesson 3)
 */
import { apiClient } from './client'
import type { User, UserCreate } from '../types'

export const userApi = {
  /**
   * Create a new user
   */
  async create(data: UserCreate): Promise<User> {
    const response = await apiClient.post<User>('/users/', data)
    return response.data
  },

  /**
   * List all users
   */
  async list(limit = 50, offset = 0): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/', {
      params: { limit, offset }
    })
    return response.data
  },

  /**
   * Get user by ID
   */
  async get(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`)
    return response.data
  }
}
