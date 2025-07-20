// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { getUserFromToken, getUserProfile, supabaseAdmin } = require('../lib/supabase');
const { authMiddleware, validateBody } = require('../middleware/auth');

// Схемы валидации
const tokenSchema = Joi.object({
  token: Joi.string().required()
});

// POST /api/auth/verify - Проверить токен
router.post('/verify', validateBody(tokenSchema), async (req, res) => {
  try {
    const { token } = req.body;
    
    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ 
        valid: false, 
        error: 'Invalid or expired token' 
      });
    }
    
    res.json({ 
      valid: true, 
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_confirmed_at ? true : false,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      valid: false, 
      error: 'Token verification failed' 
    });
  }
});

// GET /api/auth/me - Получить информацию о текущем пользователе
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Получаем профиль пользователя из базы данных
    const profile = await getUserProfile(req.userId);
    
    const userInfo = {
      id: req.user.id,
      email: req.user.email,
      email_verified: req.user.email_confirmed_at ? true : false,
      created_at: req.user.created_at,
      last_sign_in: req.user.last_sign_in_at,
      // Данные из профиля
      name: profile?.name || '',
      bio: profile?.bio || '',
      age: profile?.age,
      education: profile?.education || '',
      experience: profile?.experience || '',
      avatar_url: profile?.avatar_url || ''
    };
    
    res.json(userInfo);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

// POST /api/auth/refresh - Обновить токен (если нужно)
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    // В Supabase токены обновляются автоматически на клиенте
    // Этот endpoint может использоваться для проверки валидности токена
    res.json({
      message: 'Token is valid',
      user_id: req.userId,
      expires_at: req.user.exp ? new Date(req.user.exp * 1000).toISOString() : null
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// POST /api/auth/logout - Выход из системы
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // В Supabase выход происходит на клиенте
    // Здесь можем логировать выход или делать cleanup
    
    // Логируем выход пользователя
    console.log(`User ${req.userId} logged out at ${new Date().toISOString()}`);
    
    res.json({ 
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// GET /api/auth/sessions - Получить активные сессии (для будущего функционала)
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    // В текущей версии Supabase нет прямого API для получения всех сессий
    // Возвращаем информацию о текущей сессии
    res.json({
      current_session: {
        user_id: req.userId,
        created_at: req.user.created_at,
        last_activity: new Date().toISOString(),
        user_agent: req.get('User-Agent'),
        ip_address: req.ip || req.connection.remoteAddress
      },
      message: 'Multiple session management not yet implemented'
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// POST /api/auth/change-password - Смена пароля (инициация через email)
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { new_password } = req.body;
    
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }
    
    // Обновляем пароль через Supabase Admin API
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      req.userId,
      { password: new_password }
    );
    
    if (error) throw error;
    
    res.json({ 
      message: 'Password updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// POST /api/auth/request-password-reset - Запрос сброса пароля
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Отправляем email для сброса пароля
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      }
    });
    
    if (error) {
      console.error('Password reset error:', error);
      // Не показываем конкретную ошибку из соображений безопасности
    }
    
    // Всегда возвращаем успех, чтобы не раскрывать существование email
    res.json({ 
      message: 'If the email exists, a password reset link has been sent',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ error: 'Failed to request password reset' });
  }
});

// DELETE /api/auth/account - Удаление аккаунта
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const { confirm_deletion } = req.body;
    
    if (!confirm_deletion) {
      return res.status(400).json({ 
        error: 'Account deletion must be confirmed',
        message: 'Send { "confirm_deletion": true } to confirm'
      });
    }
    
    const userId = req.userId;
    
    // Удаляем связанные данные пользователя
    await Promise.all([
      // Удаляем результаты тестов
      supabaseAdmin
        .from('test_results')
        .delete()
        .eq('user_id', userId),
      
      // Удаляем планы обучения
      supabaseAdmin
        .from('learning_plans')
        .delete()
        .eq('user_id', userId),
      
      // Удаляем профиль
      supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId)
    ]);
    
    // Удаляем пользователя из auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) throw error;
    
    res.json({ 
      message: 'Account deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// GET /api/auth/check-email - Проверить доступность email
router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
    
    // Проверяем существование пользователя с таким email
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;
    
    const emailExists = data.users.some(user => user.email === email);
    
    res.json({ 
      email,
      exists: emailExists,
      available: !emailExists
    });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Failed to check email availability' });
  }
});

module.exports = router;