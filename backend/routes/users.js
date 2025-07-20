
// backend/routes/users.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { 
  getUserProfile,
  upsertUserProfile,
  getUserResults,
  getUserLearningPlan,
  saveLearningPlan,
  supabaseAdmin
} = require('../lib/supabase');
const { authMiddleware, resourceOwner, validateBody } = require('../middleware/auth');

// Схемы валидации
const profileSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  bio: Joi.string().max(500).allow(''),
  age: Joi.number().integer().min(13).max(120),
  education: Joi.string().max(200).allow(''),
  experience: Joi.string().max(500).allow(''),
  avatar_url: Joi.string().uri().allow('')
});

const learningPlanSchema = Joi.object({
  strengths: Joi.array().items(Joi.object()),
  improvements: Joi.array().items(Joi.object()),
  recommendations: Joi.array().items(Joi.object()),
  status: Joi.string().valid('active', 'completed', 'paused').default('active')
});

// GET /api/users/profile - Получить профиль текущего пользователя
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await getUserProfile(req.userId);
    
    if (!profile) {
      // Создаем базовый профиль если его нет
      const newProfile = await upsertUserProfile(req.userId, {
        email: req.user.email,
        name: req.user.user_metadata?.name || '',
        created_at: new Date().toISOString()
      });
      return res.json(newProfile);
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/users/profile - Обновить профиль пользователя
router.put('/profile', authMiddleware, validateBody(profileSchema), async (req, res) => {
  try {
    const updatedProfile = await upsertUserProfile(req.userId, req.body);
    
    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// GET /api/users/results - Получить результаты тестов пользователя
router.get('/results', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0, test_id } = req.query;
    
    let results = await getUserResults(req.userId, parseInt(limit) + parseInt(offset));
    
    // Фильтрация по тесту если указан
    if (test_id) {
      results = results.filter(result => result.test_id === test_id);
    }
    
    // Пагинация
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = results.slice(startIndex, endIndex);
    
    res.json({
      results: paginatedResults,
      pagination: {
        total: results.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: endIndex < results.length
      }
    });
  } catch (error) {
    console.error('Error fetching user results:', error);
    res.status(500).json({ error: 'Failed to fetch user results' });
  }
});

// GET /api/users/results/:id - Получить конкретный результат теста
router.get('/results/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select('*, tests(title, description, icon)')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Result not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching test result:', error);
    res.status(500).json({ error: 'Failed to fetch test result' });
  }
});

// DELETE /api/users/results/:id - Удалить результат теста
router.delete('/results/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabaseAdmin
      .from('test_results')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Result not found' });
      }
      throw error;
    }
    
    res.json({ message: 'Test result deleted successfully' });
  } catch (error) {
    console.error('Error deleting test result:', error);
    res.status(500).json({ error: 'Failed to delete test result' });
  }
});

// GET /api/users/stats - Получить статистику пользователя
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const results = await getUserResults(req.userId);
    
    if (results.length === 0) {
      return res.json({
        tests_completed: 0,
        average_score: 0,
        total_time_spent: 0,
        favorite_category: null,
        strongest_skill: null,
        improvement_areas: [],
        recent_activity: []
      });
    }
    
    // Вычисляем статистику
    const totalScore = results.reduce((sum, result) => sum + result.total_score, 0);
    const averageScore = Math.round(totalScore / results.length);
    const totalTimeSpent = results.reduce((sum, result) => sum + result.time_taken, 0);
    
    // Категории по частоте
    const categoryCount = {};
    results.forEach(result => {
      if (result.test_category) {
        categoryCount[result.test_category] = (categoryCount[result.test_category] || 0) + 1;
      }
    });
    
    const favoriteCategory = Object.keys(categoryCount).length > 0
      ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b)
      : null;
    
    // Анализ навыков
    const skillScores = {};
    results.forEach(result => {
      if (result.category_scores) {
        Object.entries(result.category_scores).forEach(([skill, score]) => {
          if (!skillScores[skill]) skillScores[skill] = [];
          skillScores[skill].push(score);
        });
      }
    });
    
    const averageSkillScores = {};
    Object.keys(skillScores).forEach(skill => {
      const scores = skillScores[skill];
      averageSkillScores[skill] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });
    
    const strongestSkill = Object.keys(averageSkillScores).length > 0
      ? Object.keys(averageSkillScores).reduce((a, b) => 
          averageSkillScores[a] > averageSkillScores[b] ? a : b)
      : null;
    
    const improvementAreas = Object.entries(averageSkillScores)
      .filter(([, score]) => score < 3)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3)
      .map(([skill]) => skill);
    
    // Последняя активность
    const recentActivity = results
      .slice(0, 5)
      .map(result => ({
        test_title: result.test_title,
        score: result.total_score,
        completed_at: result.created_at
      }));
    
    res.json({
      tests_completed: results.length,
      average_score: averageScore,
      total_time_spent: Math.round(totalTimeSpent / 60), // в минутах
      favorite_category: favoriteCategory,
      strongest_skill: strongestSkill,
      improvement_areas: improvementAreas,
      recent_activity: recentActivity,
      skill_breakdown: averageSkillScores
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// GET /api/users/learning-plan - Получить план обучения
router.get('/learning-plan', authMiddleware, async (req, res) => {
  try {
    const learningPlan = await getUserLearningPlan(req.userId);
    
    if (!learningPlan) {
      return res.status(404).json({ 
        error: 'Learning plan not found',
        message: 'Complete some tests to generate a learning plan'
      });
    }
    
    res.json(learningPlan);
  } catch (error) {
    console.error('Error fetching learning plan:', error);
    res.status(500).json({ error: 'Failed to fetch learning plan' });
  }
});

// POST /api/users/learning-plan/generate - Сгенерировать план обучения
router.post('/learning-plan/generate', authMiddleware, async (req, res) => {
  try {
    const results = await getUserResults(req.userId);
    
    if (results.length === 0) {
      return res.status(400).json({ 
        error: 'No test results available',
        message: 'Complete at least one test to generate a learning plan'
      });
    }
    
    // Анализируем результаты для создания плана
    const categoryAnalysis = {};
    results.forEach(result => {
      if (result.category_scores) {
        Object.entries(result.category_scores).forEach(([category, score]) => {
          if (!categoryAnalysis[category]) {
            categoryAnalysis[category] = [];
          }
          categoryAnalysis[category].push(score);
        });
      }
    });
    
    // Вычисляем средние баллы
    const averageScores = {};
    Object.entries(categoryAnalysis).forEach(([category, scores]) => {
      averageScores[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });
    
    // Создаем рекомендации
    const recommendations = [];
    const strengths = [];
    const improvements = [];
    
    Object.entries(averageScores).forEach(([category, score]) => {
      if (score >= 4) {
        strengths.push({ category, score });
        recommendations.push({
          type: 'strength',
          category,
          title: `Развитие сильной стороны: ${category}`,
          description: `У вас отличные результаты в ${category}. Продолжайте развиваться в этом направлении`,
          priority: 'medium',
          estimated_time: '2-3 месяца',
          resources: [
            'Продвинутые курсы',
            'Специализированные проекты',
            'Менторство'
          ]
        });
      } else if (score < 3) {
        improvements.push({ category, score });
        recommendations.push({
          type: 'improvement',
          category,
          title: `Развитие навыков: ${category}`,
          description: `Рекомендуется уделить больше внимания развитию навыков в области ${category}`,
          priority: 'high',
          estimated_time: '3-6 месяцев',
          resources: [
            'Базовые курсы',
            'Практические задания',
            'Обучающие материалы'
          ]
        });
      }
    });
    
    const learningPlanData = {
      user_id: req.userId,
      strengths: strengths.sort((a, b) => b.score - a.score),
      improvements: improvements.sort((a, b) => a.score - b.score),
      recommendations,
      status: 'active',
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const savedPlan = await saveLearningPlan(learningPlanData);
    
    res.status(201).json({
      message: 'Learning plan generated successfully',
      learning_plan: savedPlan
    });
  } catch (error) {
    console.error('Error generating learning plan:', error);
    res.status(500).json({ error: 'Failed to generate learning plan' });
  }
});

// PUT /api/users/learning-plan - Обновить план обучения
router.put('/learning-plan', authMiddleware, validateBody(learningPlanSchema), async (req, res) => {
  try {
    const updatedPlanData = {
      user_id: req.userId,
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    const updatedPlan = await saveLearningPlan(updatedPlanData);
    
    res.json({
      message: 'Learning plan updated successfully',
      learning_plan: updatedPlan
    });
  } catch (error) {
    console.error('Error updating learning plan:', error);
    res.status(500).json({ error: 'Failed to update learning plan' });
  }
});

// POST /api/users/results/:id/share - Поделиться результатом теста
router.post('/results/:id/share', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_shared = true } = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('test_results')
      .update({ is_shared })
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Result not found' });
      }
      throw error;
    }
    
    const shareUrl = `${process.env.FRONTEND_URL}/shared-results/${id}`;
    
    res.json({
      message: is_shared ? 'Result shared successfully' : 'Result sharing disabled',
      result: data,
      share_url: is_shared ? shareUrl : null
    });
  } catch (error) {
    console.error('Error sharing result:', error);
    res.status(500).json({ error: 'Failed to share result' });
  }
});

module.exports = router;