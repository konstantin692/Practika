// hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react'
import { supabase, createUserProfile, getUserProfile, updateUserProfile } from '../lib/supabase'
import { toast } from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Получаем текущую сессию
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Current session:', session?.user?.email || 'No session')
        
        if (error) {
          console.error('Session error:', error)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        if (session?.user && mounted) {
          console.log('User logged in:', session.user.email)
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else if (mounted) {
          console.log('No active session')
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user')
        
        if (!mounted) return

        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      console.log('Loading profile for user:', userId)
      const userProfile = await getUserProfile(userId)
      
      if (userProfile) {
        console.log('Profile loaded:', userProfile.name || 'No name')
        setProfile(userProfile)
      } else {
        console.log('No profile found, creating one...')
        // Если профиля нет, создаем базовый
        const newProfile = await createUserProfile({ id: userId })
        setProfile(newProfile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    }
  }

  const signUp = async (email, password, name) => {
    try {
      setLoading(true)
      console.log('Signing up user:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      if (error) throw error

      if (data.user) {
        console.log('User signed up:', data.user.email)
        toast.success('Регистрация успешна! Проверьте email для подтверждения.')
      }

      return { data, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error.message)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      console.log('Signing in user:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      
      console.log('User signed in successfully:', data.user?.email)
      toast.success('Успешный вход!')
      return { data, error: null }
    } catch (error) {
      console.error('Signin error:', error)
      toast.error('Неверный email или пароль')
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out user')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      toast.success('Вы вышли из системы')
    } catch (error) {
      console.error('Signout error:', error)
      toast.error('Ошибка при выходе')
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      console.log('Updating profile:', updates)
      const updatedProfile = await updateUserProfile(user.id, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      setProfile(updatedProfile)
      toast.success('Профиль обновлен!')
      return updatedProfile
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Ошибка обновления профиля')
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}