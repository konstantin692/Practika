// backend/lib/supabase.js
const { createClient } = require('@supabase/supabase-js');

// Admin client для серверных операций
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Обычный client для проверки пользователей
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Утилиты для работы с пользователями
const getUserFromToken = async (token) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

// Получение профиля пользователя
const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Создание/обновление профиля
const upsertUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting user profile:', error);
    throw error;
  }
};

// Получение всех тестов
const getAllTests = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    console.log('Found tests:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error getting tests:', error);
    return [];
  }
};

// Получение теста по ID
const getTestById = async (testId) => {
  try {
    console.log('Getting test by ID from database:', testId);
    
    const { data, error } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('id', testId)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      if (error.code === 'PGRST116') {
        console.log('Test not found in database');
        return null;
      }
      throw error;
    }
    
    console.log('Test found in database:', data?.title);
    return data;
  } catch (error) {
    console.error('Error getting test by ID:', error);
    return null;
  }
};

// Сохранение результата теста
const saveTestResult = async (resultData) => {
  try {
    console.log('Saving test result to database:', resultData);
    
    const { data, error } = await supabaseAdmin
      .from('test_results')
      .insert(resultData)
      .select()
      .single();
    
    if (error) {
      console.error('Error saving test result:', error);
      throw error;
    }
    
    // Увеличиваем счетчик прохождений теста
    try {
      await supabaseAdmin.rpc('increment_test_completed_count', {
        test_id: resultData.test_id
      });
    } catch (rpcError) {
      console.error('Error incrementing test count:', rpcError);
      // Не прерываем выполнение, если RPC функция не работает
    }
    
    console.log('Test result saved successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Error saving test result:', error);
    throw error;
  }
};

// Получение результатов пользователя
const getUserResults = async (userId, limit = 50) => {
  try {
    console.log('Getting user results for:', userId);
    
    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    console.log('Found user results:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error getting user results:', error);
    return [];
  }
};

// Получение плана обучения
const getUserLearningPlan = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('learning_plans')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error getting learning plan:', error);
    return null;
  }
};

// Сохранение плана обучения
const saveLearningPlan = async (planData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('learning_plans')
      .upsert(planData, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving learning plan:', error);
    throw error;
  }
};

// Получение статистики для аналитики
const getAnalyticsData = async () => {
  try {
    // Общая статистика
    const [
      { count: totalUsers },
      { count: totalTests },
      { count: totalResults },
      topTests
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('tests').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('test_results').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('tests')
        .select('id, title, completed_count')
        .order('completed_count', { ascending: false })
        .limit(5)
    ]);

    return {
      totalUsers: totalUsers || 0,
      totalTests: totalTests || 0,
      totalResults: totalResults || 0,
      topTests: topTests.data || [],
      averageResultsPerUser: totalUsers > 0 ? Math.round((totalResults || 0) / totalUsers) : 0
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return {
      totalUsers: 0,
      totalTests: 0,
      totalResults: 0,
      topTests: [],
      averageResultsPerUser: 0
    };
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  getUserFromToken,
  getUserProfile,
  upsertUserProfile,
  getAllTests,
  getTestById,
  saveTestResult,
  getUserResults,
  getUserLearningPlan,
  saveLearningPlan,
  getAnalyticsData
};