import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import GlassCard from '../Common/GlassCard'
import { useAuth } from '../../hooks/useAuth'

const RegisterForm = ({ onSwitch }) => {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const { signUp } = useAuth()
  const router = useRouter()
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { error } = await signUp(data.email, data.password, data.name)
      if (!error) {
        // Пользователь должен подтвердить email
        router.push('/login?message=check-email')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="p-8 max-w-md w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Регистрация</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('name', { 
                required: 'Имя обязательно',
                minLength: {
                  value: 2,
                  message: 'Минимум 2 символа'
                }
              })}
              type="text"
              placeholder="Имя"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('email', { 
                required: 'Email обязателен',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Неверный формат email'
                }
              })}
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('password', { 
                required: 'Пароль обязателен',
                minLength: {
                  value: 6,
                  message: 'Минимум 6 символов'
                }
              })}
              type="password"
              placeholder="Пароль"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('confirmPassword', { 
                required: 'Подтверждение пароля обязательно',
                validate: value => value === password || 'Пароли не совпадают'
              })}
              type="password"
              placeholder="Подтвердите пароль"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onSwitch}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Уже есть аккаунт? Войти
          </button>
        </div>
      </motion.div>
    </GlassCard>
  )
}