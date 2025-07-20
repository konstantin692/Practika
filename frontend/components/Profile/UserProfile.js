// components/Profile/UserProfile.js
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import { useTests } from '../../hooks/useTests'
import GlassCard from '../Common/GlassCard'
import { toast } from 'react-hot-toast'

const UserProfile = () => {
  const router = useRouter()
  const { user, profile, updateProfile, signOut } = useAuth()
  const { getUserResults, getUserLearningPlan, generateLearningPlan } = useTests()
  const [results, setResults] = useState([])
  const [learningPlan, setLearningPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    age: '',
    education: '',
    experience: ''
  })

  useEffect(() => {
    if (user && profile) {
      setProfileData({
        name: profile.name || '',
        bio: profile.bio || '',
        age: profile.age || '',
        education: profile.education || '',
        experience: profile.experience || ''
      })
      fetchUserData()
    }
  }, [user, profile])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const [userResults, userPlan] = await Promise.all([
        getUserResults(),
        getUserLearningPlan()
      ])
      setResults(userResults)
      setLearningPlan(userPlan)
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData)
      setEditing(false)
    } catch (error) {
      // Ошибка уже обработана в хуке
    }
  }

  const handleGeneratePlan = async () => {
    try {
      if (results.length === 0) {
        toast.error('Пройдите хотя бы один тест для создания плана обучения')
        return
      }
      const newPlan = await generateLearningPlan()
      setLearningPlan(newPlan)
    } catch (error) {
      // Ошибка уже обработана в хуке
    }
  }

  const handleShareResult = async (result) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Мой результат теста',
          text: `Я прошел тест "${result.test_title}" и набрал ${result.total_score} баллов!`,
          url: window.location.origin + `/results/shared/${result.id}`
        })
      } else {
        await navigator.clipboard.writeText(
          `Я прошел тест "${result.test_title}" и набрал ${result.total_score} баллов! ${window.location.origin}/results/shared/${result.id}`
        )
        toast.success('Ссылка скопирована!')
      }
    } catch (error) {
      toast.error('Ошибка при попытке поделиться')
    }
  }

  const getResultsSummary = () => {
    if (results.length === 0) return null

    const totalTests = results.length
    const averageScore = results.reduce((sum, result) => sum + result.total_score, 0) / totalTests
    const mostRecentTest = results[0]
    
    // Подсчитываем время, потраченное на тесты
    const totalTimeSpent = results.reduce((sum, result) => sum + (result.time_taken || 0), 0)

    return {
      totalTests,
      averageScore: Math.round(averageScore),
      mostRecentTest,
      totalTimeSpent: Math.round(totalTimeSpent / 60) // в минутах
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const summary = getResultsSummary()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white text-lg">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            Мой профиль
          </motion.h1>
          
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/tests')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Пройти тест
            </button>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {profileData.name.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {profileData.name || 'Пользователь'}
                </h2>
                <p className="text-gray-300">{user?.email}</p>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Имя"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="О себе"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  />
                  <input
                    type="number"
                    value={profileData.age}
                    onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                    placeholder="Возраст"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={profileData.education}
                    onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                    placeholder="Образование"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                    placeholder="Опыт работы"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profileData.bio && (
                    <div>
                      <p className="text-sm text-gray-400">О себе</p>
                      <p className="text-white">{profileData.bio}</p>
                    </div>
                  )}
                  {profileData.age && (
                    <div>
                      <p className="text-sm text-gray-400">Возраст</p>
                      <p className="text-white">{profileData.age} лет</p>
                    </div>
                  )}
                  {profileData.education && (
                    <div>
                      <p className="text-sm text-gray-400">Образование</p>
                      <p className="text-white">{profileData.education}</p>
                    </div>
                  )}
                  {profileData.experience && (
                    <div>
                      <p className="text-sm text-gray-400">Опыт</p>
                      <p className="text-white">{profileData.experience}</p>
                    </div>
                  )}
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Редактировать профиль
                  </button>
                </div>
              )}
            </GlassCard>

            {/* Stats */}
            {summary && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Статистика</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Тестов пройдено:</span>
                    <span className="text-white font-semibold">{summary.totalTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Средний балл:</span>
                    <span className="text-white font-semibold">{summary.averageScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Время на тесты:</span>
                    <span className="text-white font-semibold">{summary.totalTimeSpent} мин</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Последний тест:</span>
                    <span className="text-white font-semibold">
                      {formatDate(summary.mostRecentTest.created_at)}
                    </span>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Test History and Learning Plan */}
          <div className="lg:col-span-2">
            {/* Test History */}
            <GlassCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-6">История тестов</h3>
              
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-gray-300 mb-4">Вы еще не проходили тесты</p>
                  <button 
                    onClick={() => router.push('/tests')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Пройти первый тест
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{result.test_title || 'Тест'}</h4>
                          <p className="text-gray-300 text-sm">
                            {formatDate(result.created_at)}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-blue-400">
                              Балл: {result.total_score}
                            </span>
                            <span className="text-gray-400">
                              Время: {formatTime(result.time_taken || 0)}
                            </span>
                            {result.test_category && (
                              <span className="text-purple-400 capitalize">
                                {result.test_category}
                              </span>
                            )}
                          </div>
                          
                          {/* Category Scores */}
                          {result.category_scores && Object.keys(result.category_scores).length > 0 && (
                            <div className="mt-3">
                              <p className="text-gray-400 text-sm mb-2">Результаты по категориям:</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(result.category_scores)
                                  .sort(([,a], [,b]) => b - a)
                                  .slice(0, 3)
                                  .map(([category, score]) => (
                                    <span 
                                      key={category}
                                      className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs"
                                    >
                                      {category}: {score}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleShareResult(result)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            📤 Поделиться
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Learning Plan */}
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">План обучения</h3>
                <button
                  onClick={handleGeneratePlan}
                  disabled={results.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {learningPlan ? 'Обновить план' : 'Создать план'}
                </button>
              </div>

              {!learningPlan ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📚</div>
                  <p className="text-gray-300">
                    {results.length === 0 
                      ? 'Пройдите несколько тестов, чтобы получить персональный план обучения'
                      : 'Нажмите "Создать план" для генерации персонального плана обучения'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Strengths */}
                  {learningPlan.strengths && learningPlan.strengths.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-green-400 mb-3">
                        🌟 Сильные стороны
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {learningPlan.strengths.map(({ category, score }, index) => (
                          <div key={index} className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                            <div className="text-white font-semibold capitalize">
                              {category.replace('_', ' ')}
                            </div>
                            <div className="text-green-400">{score.toFixed(1)}/5</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvement Areas */}
                  {learningPlan.improvements && learningPlan.improvements.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-400 mb-3">
                        📈 Области для развития
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {learningPlan.improvements.map(({ category, score }, index) => (
                          <div key={index} className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                            <div className="text-white font-semibold capitalize">
                              {category.replace('_', ' ')}
                            </div>
                            <div className="text-yellow-400">{score.toFixed(1)}/5</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {learningPlan.recommendations && learningPlan.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-blue-400 mb-3">
                        💡 Рекомендации
                      </h4>
                      <div className="space-y-4">
                        {learningPlan.recommendations.map((rec, index) => (
                          <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`text-2xl ${rec.type === 'strength' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {rec.type === 'strength' ? '🌟' : '📈'}
                              </div>
                              <div className="flex-1">
                                <h5 className="text-white font-semibold mb-2">{rec.title}</h5>
                                <p className="text-gray-300 mb-2">{rec.description}</p>
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className={`px-2 py-1 rounded ${
                                    rec.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                    rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-green-500/20 text-green-300'
                                  }`}>
                                    {rec.priority === 'high' ? 'Высокий приоритет' :
                                     rec.priority === 'medium' ? 'Средний приоритет' :
                                     'Низкий приоритет'}
                                  </span>
                                  {rec.estimated_time && (
                                    <span className="text-gray-400">
                                      ⏱️ {rec.estimated_time}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm">
                      План создан: {formatDate(learningPlan.generated_at)}
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile