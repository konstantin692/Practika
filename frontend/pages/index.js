import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import GlassCard from '../components/Common/GlassCard'
import { useAuth } from '../hooks/useAuth'
import { useTests } from '../hooks/useTests'

export default function HomePage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { tests, loading } = useTests()
  const [featuredTests, setFeaturedTests] = useState([])

  useEffect(() => {
    if (tests.length > 0) {
      setFeaturedTests(tests.slice(0, 3))
    }
  }, [tests])

  const handleStartTest = (testId) => {
    if (!user) {
      router.push('/login')
      return
    }
    router.push(`/tests/${testId}`)
  }

  const handleAuthAction = (action) => {
    router.push(`/${action}`)
  }

  const features = [
    {
      title: "Профориентация",
      description: "Определите свои способности и интересы",
      icon: "🎯",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Карьерные пути",
      description: "Получите рекомендации по развитию карьеры",
      icon: "🚀",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Обучение",
      description: "Персональные планы развития навыков",
      icon: "📚",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Аналитика",
      description: "Отслеживайте свой прогресс",
      icon: "📊",
      color: "from-orange-500 to-red-500"
    }
  ]

  return (
    <>
      <Head>
        <title>CareerPath - Найди свой путь</title>
        <meta name="description" content="Пройди тест на профориентацию и получи персональный план развития карьеры" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-white cursor-pointer"
                onClick={() => router.push('/')}
              >
                CareerPath
              </motion.div>
              
              <nav className="hidden md:flex space-x-8">
                <button 
                  onClick={() => router.push('/tests')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Тесты
                </button>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                  Возможности
                </a>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                  О нас
                </a>
              </nav>

              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-white">
                      Привет, {profile?.name || user.email?.split('@')[0] || 'Пользователь'}!
                    </span>
                    <button 
                      onClick={() => router.push('/profile')}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Профиль
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button 
  onClick={() => router.push('/login')}
  className="text-white hover:text-gray-300 transition-colors"
>
  Вход
</button>
                    <button 
                      onClick={() => handleAuthAction('login')}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Регистрация
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>


        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              Найди свой путь
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              Пройди тест на профориентацию и получи персональный план развития карьеры
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button 
  onClick={() => router.push('/tests')}
  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105"
>
  Начать тестирование
</button>
            </motion.div>
          </div>
        </section>

        {/* Featured Tests */}
        {!loading && featuredTests.length > 0 && (
          <section className="py-16 px-6">
            <div className="container mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-white mb-12 text-center"
              >
                Популярные тесты
              </motion.h2>

              <div className="grid md:grid-cols-3 gap-8">
                {featuredTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <GlassCard 
                      className="p-6 h-full cursor-pointer"
                      onClick={() => handleStartTest(test.id)}
                    >
                      <div className="text-4xl mb-4">{test.icon}</div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {test.title}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        {test.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          {test.duration} мин
                        </span>
                        <span className="text-sm text-gray-400">
                          {test.completed_count || 0} прошли
                        </span>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section id="features" className="py-16 px-6">
          <div className="container mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-12 text-center"
            >
              Возможности платформы
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 text-center h-full">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {feature.description}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto text-center">
            <GlassCard className="p-12 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-6">
                Готов начать свой путь к карьере мечты?
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Присоединяйтесь к тысячам пользователей, которые уже нашли свое призвание
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => router.push('/tests')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Пройти тест
                </button>
                {!user && (
                  <button 
                    onClick={() => handleAuthAction('login')}
                    className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Зарегистрироваться
                  </button>
                )}
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 py-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-white font-semibold mb-4 md:mb-0">
                CareerPath © 2024
              </div>
              <div className="flex space-x-6 text-gray-300">
                <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
                <a href="#" className="hover:text-white transition-colors">Условия использования</a>
                <a href="#" className="hover:text-white transition-colors">Поддержка</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

