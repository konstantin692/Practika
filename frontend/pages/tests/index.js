// pages/tests/index.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useTests } from '../../hooks/useTests'
import TestCard from '../../components/Tests/TestCard' // Исправленный импорт
import GlassCard from '../../components/Common/GlassCard'

export default function TestsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { tests, loading, error, getTestCategories } = useTests()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const categoriesData = await getTestCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleStartTest = (testId) => {
    if (!user) {
      router.push('/login')
      return
    }
    router.push(`/tests/${testId}`)
  }

  const filteredTests = tests.filter(test => {
    const categoryMatch = selectedCategory === 'all' || test.category === selectedCategory
    const difficultyMatch = selectedDifficulty === 'all' || test.difficulty === selectedDifficulty
    return categoryMatch && difficultyMatch
  })

  const difficultyLabels = {
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div 
                className="text-2xl font-bold text-white cursor-pointer"
                onClick={() => router.push('/')}
              >
                CareerPath
              </div>
              
              <div className="flex items-center space-x-4">
                {user ? (
                  <button 
                    onClick={() => router.push('/profile')}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Профиль
                  </button>
                ) : (
                  <button 
                    onClick={() => router.push('/login')}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Войти
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white text-lg">Загрузка тестов...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div 
                className="text-2xl font-bold text-white cursor-pointer"
                onClick={() => router.push('/')}
              >
                CareerPath
              </div>
              
              <div className="flex items-center space-x-4">
                {user ? (
                  <button 
                    onClick={() => router.push('/profile')}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Профиль
                  </button>
                ) : (
                  <button 
                    onClick={() => router.push('/login')}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Войти
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <GlassCard className="p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Ошибка загрузки</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Попробовать снова
            </button>
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Тесты | CareerPath</title>
        <meta name="description" content="Выберите тест для профориентации и карьерного развития" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div 
                className="text-2xl font-bold text-white cursor-pointer"
                onClick={() => router.push('/')}
              >
                CareerPath
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <button 
                  onClick={() => router.push('/')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Главная
                </button>
                <span className="text-white font-semibold">Тесты</span>
              </nav>

              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-white hidden sm:block">
                      {user.email?.split('@')[0] || 'Пользователь'}
                    </span>
                    <button 
                      onClick={() => router.push('/profile')}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Профиль
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => router.push('/login')}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Войти
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Выберите тест
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-300 text-lg max-w-2xl mx-auto"
            >
              Пройдите профессиональные тесты для определения ваших способностей и карьерных предпочтений
            </motion.p>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Category Filter */}
                <div className="flex-1">
                  <label className="block text-white font-semibold mb-2">Категория</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all" className="bg-gray-800">Все категории</option>
                    {categories.map(category => (
                      <option key={category.name} value={category.name} className="bg-gray-800">
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div className="flex-1">
                  <label className="block text-white font-semibold mb-2">Сложность</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all" className="bg-gray-800">Любая сложность</option>
                    <option value="easy" className="bg-gray-800">Легкий</option>
                    <option value="medium" className="bg-gray-800">Средний</option>
                    <option value="hard" className="bg-gray-800">Сложный</option>
                  </select>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Tests Grid */}
          {filteredTests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-white mb-2">Тесты не найдены</h3>
                <p className="text-gray-300 mb-4">
                  Попробуйте изменить фильтры поиска
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedDifficulty('all')
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Сбросить фильтры
                </button>
              </GlassCard>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <TestCard test={test} onStart={handleStartTest} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Additional Info */}
          {filteredTests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16"
            >
              <GlassCard className="p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Не знаете, с чего начать?
                </h3>
                <p className="text-gray-300 mb-6">
                  Рекомендуем начать с базового теста на профориентацию
                </p>
                <button 
                  onClick={() => {
                    const basicTest = tests.find(test => test.category === 'orientation')
                    if (basicTest) {
                      handleStartTest(basicTest.id)
                    }
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Пройти базовый тест
                </button>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}