// lib/api.js
class APIClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    console.log('API Base URL:', this.baseURL)
  }

  async getAuthHeaders() {
    const { supabase } = await import('./supabase')
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    }
    
    return {
      'Content-Type': 'application/json'
    }
  }

  async request(endpoint, options = {}) {
    const headers = await this.getAuthHeaders()
    
    const config = {
      headers,
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    }

    const url = `${this.baseURL}${endpoint}`
    console.log('API Request:', url, config)

    try {
      const response = await fetch(url, config)
      console.log('API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error response:', errorText)
        
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('API Response data:', data)
      return data
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // Tests
  async getTests() {
    return this.request('/tests')
  }

  async getTest(testId) {
    console.log('Getting test with ID:', testId)
    return this.request(`/tests/${testId}`)
  }

  async submitTestResult(testId, result) {
    return this.request(`/tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify(result)
    })
  }

  // User results
  async getUserResults() {
    return this.request('/users/results')
  }

  async getUserResult(resultId) {
    return this.request(`/users/results/${resultId}`)
  }

  async deleteUserResult(resultId) {
    return this.request(`/users/results/${resultId}`, {
      method: 'DELETE'
    })
  }

  // User profile
  async getUserProfile() {
    return this.request('/users/profile')
  }

  async updateUserProfile(profile) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    })
  }

  // Learning plan
  async getUserLearningPlan() {
    return this.request('/users/learning-plan')
  }

  async generateLearningPlan() {
    return this.request('/users/learning-plan/generate', {
      method: 'POST'
    })
  }

  async updateLearningPlan(plan) {
    return this.request('/users/learning-plan', {
      method: 'PUT',
      body: JSON.stringify(plan)
    })
  }

  // Analytics
  async getTestStats() {
    return this.request('/tests/stats')
  }

  async getTestCategories() {
    return this.request('/tests/categories')
  }
}

export const apiClient = new APIClient()
export default apiClient