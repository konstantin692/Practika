// pages/profile.js
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import UserProfile from '../components/Profile/UserProfile'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Если загрузка завершена и пользователя нет - перенаправляем на логин
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Показываем загрузку пока проверяем авторизацию
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

  // Если пользователя нет после завершения загрузки - показываем заглушку
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Требуется авторизация
          </h1>
          <p className="text-gray-300 mb-8">
            Войдите в систему для доступа к профилю
          </p>
          
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 mr-4"
          >
            Войти
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            На главную
          </button>
        </div>
      </div>
    )
  }

  // Если пользователь авторизован - показываем профиль
  return (
    <>
      <Head>
        <title>Профиль | CareerPath</title>
        <meta name="description" content="Управление профилем и просмотр результатов тестов" />
      </Head>
      <UserProfile />
    </>
  )
}