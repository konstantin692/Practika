// backend/routes/tests.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { 
  getAllTests, 
  getTestById, 
  saveTestResult,
  getUserResults 
} = require('../lib/supabase');
const { authMiddleware, optionalAuth, adminOnly, validateBody } = require('../middleware/auth');

// Схемы валидации
const testSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(500),
  icon: Joi.string().default('🎯'),
  duration: Joi.number().integer().min(5).max(120).default(15),
  questions_count: Joi.number().integer().min(1).max(100).default(10),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('easy'),
  category: Joi.string().required().min(3).max(50),
  questions: Joi.array().items(Joi.object()).required().min(1)
});

const resultSchema = Joi.object({
  test_id: Joi.string().required(), // Изменили с uuid на string
  test_title: Joi.string().required(),
  test_category: Joi.string().required(),
  total_score: Joi.number().integer().min(0).required(),
  category_scores: Joi.object().default({}),
  answers: Joi.object().required(),
  time_taken: Joi.number().integer().min(0).required()
});

// GET /api/tests - Получить все активные тесты
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, difficulty, limit = 50, offset = 0 } = req.query;
    
    let tests = await getAllTests();
    
    // Фильтрация
    if (category) {
      tests = tests.filter(test => test.category === category);
    }
    
    if (difficulty) {
      tests = tests.filter(test => test.difficulty === difficulty);
    }
    
    // Пагинация
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTests = tests.slice(startIndex, endIndex);
    
    // Убираем вопросы из списка (только для детального просмотра)
    const testsWithoutQuestions = paginatedTests.map(test => ({
      ...test,
      questions: undefined,
      questions_preview: test.questions?.slice(0, 1) || []
    }));
    
    res.json({
      tests: testsWithoutQuestions,
      pagination: {
        total: tests.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: endIndex < tests.length
      }
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// GET /api/tests/categories - Получить список категорий
router.get('/categories', async (req, res) => {
  try {
    const tests = await getAllTests();
    const categories = [...new Set(tests.map(test => test.category))];
    
    const categoriesWithCounts = categories.map(category => ({
      name: category,
      count: tests.filter(test => test.category === category).length
    }));
    
    res.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/tests/stats - Получить статистику тестов
router.get('/stats', async (req, res) => {
  try {
    const tests = await getAllTests();
    
    const stats = {
      total_tests: tests.length,
      by_difficulty: {
        easy: tests.filter(t => t.difficulty === 'easy').length,
        medium: tests.filter(t => t.difficulty === 'medium').length,
        hard: tests.filter(t => t.difficulty === 'hard').length
      },
      by_category: {},
      total_completions: tests.reduce((sum, test) => sum + (test.completed_count || 0), 0),
      most_popular: tests
        .sort((a, b) => (b.completed_count || 0) - (a.completed_count || 0))
        .slice(0, 5)
        .map(test => ({
          id: test.id,
          title: test.title,
          completed_count: test.completed_count || 0
        }))
    };
    
    // Группировка по категориям
    tests.forEach(test => {
      stats.by_category[test.category] = (stats.by_category[test.category] || 0) + 1;
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching test stats:', error);
    res.status(500).json({ error: 'Failed to fetch test statistics' });
  }
});

// GET /api/tests/:id - Получить конкретный тест с вопросами
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Убираем проверку UUID формата, так как у нас строковые ID
    console.log('Getting test with ID:', id);
    
    const test = await getTestById(id);
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    // Если пользователь авторизован, добавляем информацию о прохождении
    if (req.user) {
      const userResults = await getUserResults(req.userId);
      const hasCompleted = userResults.some(result => result.test_id === id);
      test.user_completed = hasCompleted;
      test.user_attempts = userResults.filter(result => result.test_id === id).length;
    }
    
    console.log('Test found:', test.title);
    res.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
});

// POST /api/tests - Создать новый тест (только для админов)
router.post('/', authMiddleware, adminOnly, validateBody(testSchema), async (req, res) => {
  try {
    const testData = {
      ...req.body,
      created_at: new Date().toISOString(),
      is_active: true
    };
    
    const { data, error } = await supabaseAdmin
      .from('tests')
      .insert(testData)
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      message: 'Test created successfully',
      test: data
    });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
});

// PUT /api/tests/:id - Обновить тест (только для админов)
router.put('/:id', authMiddleware, adminOnly, validateBody(testSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabaseAdmin
      .from('tests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Test not found' });
      }
      throw error;
    }
    
    res.json({
      message: 'Test updated successfully',
      test: data
    });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
});

// DELETE /api/tests/:id - Деактивировать тест (только для админов)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('tests')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Test not found' });
      }
      throw error;
    }
    
    res.json({
      message: 'Test deactivated successfully',
      test: data
    });
  } catch (error) {
    console.error('Error deactivating test:', error);
    res.status(500).json({ error: 'Failed to deactivate test' });
  }
});

// POST /api/tests/:id/submit - Отправить результат теста
router.post('/:id/submit', authMiddleware, validateBody(resultSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, что тест существует
    const test = await getTestById(id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    // Проверяем, что test_id в теле запроса совпадает с ID в URL
    if (req.body.test_id !== id) {
      return res.status(400).json({ error: 'Test ID mismatch' });
    }
    
    const resultData = {
      ...req.body,
      user_id: req.userId,
      created_at: new Date().toISOString()
    };
    
    console.log('Saving test result:', resultData);
    const savedResult = await saveTestResult(resultData);
    
    res.status(201).json({
      message: 'Test result saved successfully',
      result: {
        id: savedResult.id,
        total_score: savedResult.total_score,
        category_scores: savedResult.category_scores,
        created_at: savedResult.created_at
      }
    });
  } catch (error) {
    console.error('Error submitting test result:', error);
    res.status(500).json({ error: 'Failed to submit test result' });
  }
});

// GET /api/tests/:id/results - Получить результаты теста (только для админов)
router.get('/:id/results', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const { data, error, count } = await supabaseAdmin
      .from('test_results')
      .select('*, profiles(name, email)', { count: 'exact' })
      .eq('test_id', id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (error) throw error;
    /*
    res.json({
      results: data || [],
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: parseInt(offset) + parseInt(limit) < count
      }
    });*/
    res.json(data)
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
});

module.exports = router;