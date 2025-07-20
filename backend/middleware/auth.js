// backend/middleware/auth.js
const { getUserFromToken } = require('../lib/supabase');

// Middleware для проверки авторизации
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : req.headers.apikey;

    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Authorization header with Bearer token is required'
      });
    }

    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    // Добавляем пользователя в request
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Unable to authenticate the request'
    });
  }
};

// Middleware для опциональной авторизации
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : req.headers.apikey;

    if (token) {
      const user = await getUserFromToken(token);
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // Игнорируем ошибки в опциональной авторизации
    next();
  }
};

// Middleware для проверки роли администратора
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }

  // Проверяем роль пользователя (можно расширить логику)
  const isAdmin = req.user.email?.endsWith('@admin.com') || 
                  req.user.user_metadata?.role === 'admin' ||
                  req.user.app_metadata?.role === 'admin';

  if (!isAdmin) {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'You do not have permission to access this resource'
    });
  }

  next();
};

// Middleware для проверки владельца ресурса
const resourceOwner = (userIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required'
      });
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (resourceUserId && resourceUserId !== req.userId) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

// Middleware для валидации данных
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Middleware для логирования запросов
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.userId || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      console.error('Request error:', logData);
    } else {
      console.log('Request:', logData);
    }
  });
  
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminOnly,
  resourceOwner,
  validateBody,
  requestLogger
};