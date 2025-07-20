// pages/tests/[id].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useTests } from '../../hooks/useTests'
import GlassCard from '../../components/Common/GlassCard'
import TestForm from '../../components/Tests/TestForm'
import TestResults from '../../components/Tests/TestResults'
import { toast } from 'react-hot-toast'

export default function TestPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const { getTest, saveTestResult } = useTests()
  
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState('info') // info, test, results
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchTest()
    } else if (id === 'undefined') {
      setError('Некорректный ID теста')
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const fetchTest = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading test with ID:', id)
      const testData = await getTest(id)
      
      if (testData && testData.questions && testData.questions.length > 0) {
        setTest(testData)
        console.log('Test loaded successfully:', testData.title)
      } else {
        throw new Error('Тест не содержит вопросов')
      }
    } catch (error) {
      console.error('Error in fetchTest:', error)
      setError(error.message || 'Ошибка загрузки теста')
      
      // Показываем toast только один раз
      if (error.message === 'Тест не найден') {
        toast.error('Тест не найден')
      } else {
        toast.error('Ошибка загрузки теста')
      }
      
      // Перенаправляем пользователя через небольшую задержку
      setTimeout(() => {
        router.push('/tests')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTest = () => {
    setCurrentStep('test')
  }

  const handleTestComplete = async (result) => {
    try {
      // Подсчитываем результат
      const calculatedResult = calculateTestResult(result.answers)
      
      // Сохраняем в базу данных
      const savedResult = await saveTestResult(id, {
        testTitle: test.title,
        testCategory: test.category,
        totalScore: calculatedResult.totalScore,
        categoryScores: calculatedResult.categoryScores,
        answers: result.answers,
        timeTaken: result.timeTaken
      })

      setTestResult({
        ...calculatedResult,
        id: savedResult.id,
        timeTaken: result.timeTaken,
        answers: result.answers
      })
      setCurrentStep('results')
    } catch (error) {
      console.error('Error completing test:', error)
      toast.error('Ошибка сохранения результата')
    }
  }

  const calculateTestResult = (answers) => {
    let totalScore = 0
    const categoryScores = {}

    // Проходим по всем ответам
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = test.questions.find(q => q.id === questionId)
      if (!question) return

      if (question.type === 'multiple_choice') {
        const selectedAnswer = question.answers.find(a => a.id === answer.answerId)
        if (selectedAnswer) {
          totalScore += selectedAnswer.score || 0
          
          // Добавляем баллы по категориям
          if (selectedAnswer.categories) {
            selectedAnswer.categories.forEach(category => {
              categoryScores[category] = (categoryScores[category] || 0) + (selectedAnswer.score || 0)
            })
          }
        }
      } else if (question.type === 'scale') {
        const scaleValue = parseInt(answer.value) || 0
        totalScore += scaleValue
        
        // Для scale вопросов используем категории из вопроса
        if (question.categories) {
          question.categories.forEach(category => {
            categoryScores[category] = (categoryScores[category] || 0) + scaleValue
          })
        }
      }
    })

    return { totalScore, categoryScores }
  }

  const handleExit = () => {
    router.push('/tests')
  }

  const handleResultsClose = () => {
    router.push('/profile')
  }

  const handleShare = async (result) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Мой результат теста',
          text: `Я прошел тест "${test.title}" и набрал ${result.totalScore} баллов!`,
          url: window.location.origin + `/results/shared/${result.id}`
        })
      } else {
        await navigator.clipboard.writeText(
          `Я прошел тест "${test.title}" и набрал ${result.totalScore} баллов! ${window.location.origin}/results/shared/${result.id}`
        )
        toast.success('Ссылка скопирована!')
      }
    } catch (error) {
      toast.error('Ошибка при попытке поделиться')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white text-lg">Загрузка теста...</p>
        </div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <GlassCard className="p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {error || 'Тест не найден'}
          </h2>
          <p className="text-gray-300 mb-6">
            Возможно, тест был удален или у вас нет прав доступа к нему.
          </p>
          <button
            onClick={() => router.push('/tests')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Вернуться к списку тестов
          </button>
        </GlassCard>
      </div>
    )
  }

  if (currentStep === 'test') {
    return (
      <TestForm
        test={test}
        onComplete={handleTestComplete}
        onExit={handleExit}
      />
    )
  }

  if (currentStep === 'results') {
    return (
      <TestResults
        result={testResult}
        test={test}
        onClose={handleResultsClose}
        onShare={handleShare}
      />
    )
  }

  // Страница информации о тесте
  return (
    <>
      <Head>
        <title>{test.title} | CareerPath</title>
        <meta name="description" content={test.description} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleExit}
              className="text-gray-300 hover:text-white transition-colors"
            >
              ← Назад к тестам
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Информация о тесте</h1>
            </div>
            
            <div></div>
          </div>

          {/* Test Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-8 mb-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{test.icon}</div>
                <h2 className="text-3xl font-bold text-white mb-4">{test.title}</h2>
                <p className="text-gray-300 text-lg">{test.description}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {test.duration} мин
                  </div>
                  <div className="text-gray-300">Время</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {test.questions_count || test.questions.length}
                  </div>
                  <div className="text-gray-300">Вопросов</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-2 capitalize">
                    {test.difficulty === 'easy' ? 'Легкий' : 
                     test.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                  </div>
                  <div className="text-gray-300">Сложность</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">
                    {test.completed_count || 0}
                  </div>
                  <div className="text-gray-300">Прошли</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Что вас ожидает:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    {test.questions_count || test.questions.length} вопросов на {test.duration} минут
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Детальный анализ ваших результатов
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Персональные рекомендации по развитию
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Возможность поделиться результатами
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={handleStartTest}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Начать тест
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </>
  )
}