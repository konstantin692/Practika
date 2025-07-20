// hooks/useTests.js
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { toast } from 'react-hot-toast'
import apiClient from '../lib/api'

export const useTests = () => {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching tests...')
      const response = await apiClient.getTests()
      console.log('Tests response:', response)
      
      // API возвращает { tests: [...], pagination: {...} }
      const testsData = response.tests || response || []
      setTests(testsData)
      console.log('Tests loaded:', testsData.length)
    } catch (error) {
      console.error('Error fetching tests:', error)
      setError(error.message)
      toast.error('Ошибка загрузки тестов')
      setTests([])
    } finally {
      setLoading(false)
    }
  }

  const getTest = async (testId) => {
    try {
      console.log('Fetching test with ID:', testId)
      
      // Проверяем валидность ID
      if (!testId || testId === 'undefined') {
        throw new Error('Некорректный ID теста')
      }
      
      const test = await apiClient.getTest(testId)
      console.log('Test response:', test)
      
      // API может вернуть тест напрямую или в обертке
      const testData = test.test || test
      
      if (!testData) {
        throw new Error('Тест не найден')
      }
      
      // Проверяем наличие обязательных полей
      if (!testData.questions || !Array.isArray(testData.questions)) {
        throw new Error('Некорректная структура теста')
      }
      
      console.log('Test loaded successfully:', testData.title)
      return testData
    } catch (error) {
      console.error('Error fetching test:', error)
      
      // Не показываем toast здесь, пусть вызывающий компонент решает
      throw error
    }
  }

  const saveTestResult = async (testId, result) => {
    if (!user) {
      toast.error('Необходимо войти в систему')
      throw new Error('User not authenticated')
    }
    
    try {
      console.log('Saving test result:', { testId, result })
      
      const resultData = {
        test_id: testId,
        test_title: result.testTitle || 'Тест',
        test_category: result.testCategory || 'general',
        total_score: result.totalScore,
        category_scores: result.categoryScores || {},
        answers: result.answers,
        time_taken: result.timeTaken
      }

      const response = await apiClient.submitTestResult(testId, resultData)
      console.log('Test result saved:', response)
      
      toast.success('Результат сохранен!')
      return response.result
    } catch (error) {
      console.error('Error saving test result:', error)
      toast.error('Ошибка сохранения результата')
      throw error
    }
  }

  const getUserResults = async () => {
    if (!user) return []
    
    try {
      const response = await apiClient.getUserResults()
      console.log('User results:', response)
      return response.results || response || []
    } catch (error) {
      console.error('Error fetching user results:', error)
      toast.error('Ошибка загрузки результатов')
      return []
    }
  }

  const getTestResult = async (resultId) => {
    if (!user) return null
    
    try {
      const result = await apiClient.getUserResult(resultId)
      return result
    } catch (error) {
      console.error('Error fetching test result:', error)
      return null
    }
  }

  const deleteTestResult = async (resultId) => {
    if (!user) {
      toast.error('Необходимо войти в систему')
      throw new Error('User not authenticated')
    }
    
    try {
      await apiClient.deleteUserResult(resultId)
      toast.success('Результат удален')
    } catch (error) {
      console.error('Error deleting test result:', error)
      toast.error('Ошибка удаления результата')
      throw error
    }
  }

  const generateLearningPlan = async () => {
    if (!user) {
      toast.error('Необходимо войти в систему')
      throw new Error('User not authenticated')
    }
    
    try {
      const response = await apiClient.generateLearningPlan()
      toast.success('План обучения создан!')
      return response.learning_plan
    } catch (error) {
      console.error('Error generating learning plan:', error)
      toast.error('Ошибка создания плана обучения')
      throw error
    }
  }

  const getUserLearningPlan = async () => {
    if (!user) return null
    
    try {
      const plan = await apiClient.getUserLearningPlan()
      return plan
    } catch (error) {
      console.error('Error fetching learning plan:', error)
      return null
    }
  }

  const updateLearningPlan = async (planData) => {
    if (!user) {
      toast.error('Необходимо войти в систему')
      throw new Error('User not authenticated')
    }
    
    try {
      const response = await apiClient.updateLearningPlan(planData)
      toast.success('План обучения обновлен!')
      return response.learning_plan
    } catch (error) {
      console.error('Error updating learning plan:', error)
      toast.error('Ошибка обновления плана обучения')
      throw error
    }
  }

  const getTestStats = async () => {
    try {
      const stats = await apiClient.getTestStats()
      return stats
    } catch (error) {
      console.error('Error fetching test stats:', error)
      return null
    }
  }

  const getTestCategories = async () => {
    try {
      const response = await apiClient.getTestCategories()
      return response.categories || []
    } catch (error) {
      console.error('Error fetching test categories:', error)
      return []
    }
  }

  return {
    tests,
    loading,
    error,
    getTest,
    saveTestResult,
    getUserResults,
    getTestResult,
    deleteTestResult,
    generateLearningPlan,
    getUserLearningPlan,
    updateLearningPlan,
    getTestStats,
    getTestCategories,
    refreshTests: fetchTests
  }
}