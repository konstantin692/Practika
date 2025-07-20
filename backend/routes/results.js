// backend/routes/results.js
const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

// GET /api/results/shared/:id - Получить публичный результат теста
router.get('/shared/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select(`
        id,
        test_title,
        test_category,
        total_score,
        category_scores,
        time_taken,
        created_at,
        is_shared,
        profiles(name)
      `)
      .eq('id', id)
      .eq('is_shared', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Shared result not found' });
      }
      throw error;
    }
    
    // Убираем чувствительную информацию
    const publicResult = {
      id: data.id,
      test_title: data.test_title,
      test_category: data.test_category,
      total_score: data.total_score,
      category_scores: data.category_scores,
      time_taken: data.time_taken,
      completed_at: data.created_at,
      user_name: data.profiles?.name || 'Анонимный пользователь'
    };
    
    res.json(publicResult);
  } catch (error) {
    console.error('Error fetching shared result:', error);
    res.status(500).json({ error: 'Failed to fetch shared result' });
  }
});

// GET /api/results/leaderboard/:testId - Получить таблицу лидеров для теста
router.get('/leaderboard/:testId', optionalAuth, async (req, res) => {
  try {
    const { testId } = req.params;
    const { limit = 10 } = req.query;
    
    // Получаем лучшие результаты для теста
    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select(`
        id,
        total_score,
        time_taken,
        created_at,
        profiles(name)
      `)
      .eq('test_id', testId)
      .eq('is_shared', true)
      .order('total_score', { ascending: false })
      .order('time_taken', { ascending: true })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    // Формируем таблицу лидеров
    const leaderboard = data.map((result, index) => ({
      rank: index + 1,
      user_name: result.profiles?.name || 'Анонимный пользователь',
      score: result.total_score,
      time_taken: result.time_taken,
      completed_at: result.created_at
    }));
    
    res.json({
      test_id: testId,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/results/analytics/category/:category - Аналитика по категории
router.get('/analytics/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select('total_score, time_taken, created_at')
      .eq('test_category', category);
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.json({
        category,
        total_attempts: 0,
        average_score: 0,
        average_time: 0,
        score_distribution: {},
        trends: []
      });
    }
    
    // Вычисляем статистику
    const totalAttempts = data.length;
    const averageScore = Math.round(
      data.reduce((sum, result) => sum + result.total_score, 0) / totalAttempts
    );
    const averageTime = Math.round(
      data.reduce((sum, result) => sum + result.time_taken, 0) / totalAttempts
    );
    
    // Распределение баллов
    const scoreDistribution = {};
    data.forEach(result => {
      const scoreRange = Math.floor(result.total_score / 10) * 10;
      const key = `${scoreRange}-${scoreRange + 9}`;
      scoreDistribution[key] = (scoreDistribution[key] || 0) + 1;
    });
    
    // Тренды по времени (группировка по месяцам)
    const monthlyData = {};
    data.forEach(result => {
      const month = new Date(result.created_at).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, totalScore: 0 };
      }
      monthlyData[month].count++;
      monthlyData[month].totalScore += result.total_score;
    });
    
    const trends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        attempts: data.count,
        average_score: Math.round(data.totalScore / data.count)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    res.json({
      category,
      total_attempts: totalAttempts,
      average_score: averageScore,
      average_time: averageTime,
      score_distribution: scoreDistribution,
      trends
    });
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    res.status(500).json({ error: 'Failed to fetch category analytics' });
  }
});

// GET /api/results/compare/:testId - Сравнить свой результат с другими
router.get('/compare/:testId', authMiddleware, async (req, res) => {
  try {
    const { testId } = req.params;
    
    // Получаем результаты пользователя для этого теста
    const { data: userResults, error: userError } = await supabaseAdmin
      .from('test_results')
      .select('total_score, time_taken, category_scores')
      .eq('test_id', testId)
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });
    
    if (userError) throw userError;
    
    if (userResults.length === 0) {
      return res.status(404).json({ 
        error: 'No results found',
        message: 'You have not completed this test yet'
      });
    }
    
    const userBestResult = userResults[0];
    
    // Получаем статистику всех результатов для сравнения
    const { data: allResults, error: allError } = await supabaseAdmin
      .from('test_results')
      .select('total_score, time_taken, category_scores')
      .eq('test_id', testId);
    
    if (allError) throw allError;
    
    if (allResults.length === 0) {
      return res.json({
        user_score: userBestResult.total_score,
        percentile: 100,
        comparison: 'No other results to compare with'
      });
    }
    
    // Вычисляем позицию пользователя
    const betterResults = allResults.filter(
      result => result.total_score > userBestResult.total_score
    ).length;
    
    const percentile = Math.round(
      ((allResults.length - betterResults) / allResults.length) * 100
    );
    
    // Статистика по категориям
    const categoryComparison = {};
    if (userBestResult.category_scores) {
      Object.entries(userBestResult.category_scores).forEach(([category, userScore]) => {
        const categoryScores = allResults
          .map(result => result.category_scores?.[category])
          .filter(score => score !== undefined);
        
        if (categoryScores.length > 0) {
          const averageScore = categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length;
          const betterThanAverage = userScore > averageScore;
          
          categoryComparison[category] = {
            user_score: userScore,
            average_score: Math.round(averageScore * 100) / 100,
            better_than_average: betterThanAverage,
            percentile: Math.round(
              (categoryScores.filter(score => score <= userScore).length / categoryScores.length) * 100
            )
          };
        }
      });
    }
    
    res.json({
      user_score: userBestResult.total_score,
      user_time: userBestResult.time_taken,
      percentile,
      total_participants: allResults.length,
      average_score: Math.round(
        allResults.reduce((sum, result) => sum + result.total_score, 0) / allResults.length
      ),
      average_time: Math.round(
        allResults.reduce((sum, result) => sum + result.time_taken, 0) / allResults.length
      ),
      category_comparison: categoryComparison
    });
  } catch (error) {
    console.error('Error comparing results:', error);
    res.status(500).json({ error: 'Failed to compare results' });
  }
});

// POST /api/results/:id/feedback - Оставить отзыв о результате
router.post('/:id/feedback', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // Проверяем валидность данных
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Проверяем, что пользователь владеет результатом
    const { data: result, error: resultError } = await supabaseAdmin
      .from('test_results')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (resultError || result.user_id !== req.userId) {
      return res.status(404).json({ error: 'Result not found' });
    }
    
    // Сохраняем отзыв (создаем таблицу feedback если нужно)
    const { data, error } = await supabaseAdmin
      .from('result_feedback')
      .upsert({
        result_id: id,
        user_id: req.userId,
        rating,
        comment: comment || '',
        created_at: new Date().toISOString()
      }, {
        onConflict: 'result_id,user_id'
      })
      .select()
      .single();
    
    if (error) {
      // Если таблица не существует, создаем её
      if (error.code === '42P01') {
        await supabaseAdmin.rpc('create_feedback_table');
        // Повторяем запрос
        const { data: retryData, error: retryError } = await supabaseAdmin
          .from('result_feedback')
          .insert({
            result_id: id,
            user_id: req.userId,
            rating,
            comment: comment || '',
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (retryError) throw retryError;
        return res.status(201).json({
          message: 'Feedback saved successfully',
          feedback: retryData
        });
      }
      throw error;
    }
    
    res.status(201).json({
      message: 'Feedback saved successfully',
      feedback: data
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

module.exports = router;