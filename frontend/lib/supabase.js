// frontend/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Утилиты для работы с профилями
export const createUserProfile = async (user) => {
  try {
    console.log('Creating profile for user:', user.id)
    
    const profileData = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating profile:', error)
      // Если профиль уже существует, попробуем его получить
      if (error.code === '23505') {
        return await getUserProfile(user.id)
      }
      throw error
    }
    
    console.log('Profile created successfully')
    return data
  } catch (error) {
    console.error('Create profile error:', error)
    throw error
  }
}

export const getUserProfile = async (userId) => {
  try {
    console.log('Getting profile for user:', userId)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Profile not found')
        return null
      }
      throw error
    }
    
    console.log('Profile found:', data.name || 'No name')
    return data
  } catch (error) {
    console.error('Get profile error:', error)
    return null
  }
}

export const updateUserProfile = async (userId, updates) => {
  try {
    console.log('Updating profile for user:', userId, updates)
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }
    
    console.log('Profile updated successfully')
    return data
  } catch (error) {
    console.error('Update profile error:', error)
    throw error
  }
}