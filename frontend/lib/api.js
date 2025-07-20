// lib/api.js
class APIClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    console.log('API Base URL:', this.baseURL)
  }

  async getAuthHeaders() {
  console.log('🔑 Getting auth headers...')
  try {
    const { supabase } = await import('./supabase')
    console.log('📦 Supabase imported')
    
    const { data: { session } } = await supabase.auth.getSession()
    console.log('👤 Session obtained:', session ? 'exists' : 'null')
    
    if (session?.access_token) {
      console.log('✅ Using authenticated headers')
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    }
    
    console.log('❌ Using non-authenticated headers')
    return {
      'Content-Type': 'application/json'
    }
  } catch (error) {
    console.error('💥 Error getting auth headers:', error)
    return {
      'Content-Type': 'application/json'
    }
  }
}

  async request(endpoint, options = {}) {
  console.log('🚀 API request starting for:', endpoint)
  
  try {
    console.log('🔑 Getting headers...')
    const headers = await this.getAuthHeaders()
    console.log('✅ Headers obtained:', headers)
    
    const config = {
      headers,
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    }

    const url = `${this.baseURL}${endpoint}`
    console.log('📡 Making fetch request to:', url)
    
    const response = await fetch(url, config)
    console.log('📥 Response received:', response.status)
    
    // остальной код...
  } catch (error) {
    console.error('💥 API Request failed:', error)
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