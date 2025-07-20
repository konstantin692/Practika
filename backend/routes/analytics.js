// backend/routes/analytics.js
const express = require('express');
const router = express.Router();
const { getAnalyticsData, supabaseAdmin } = require('../lib/supabase');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /api/analytics/overview - Общая аналитика платформы
router.get('/overview', authMiddleware, adminOnly, async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();
    
    // Дополнительная статистика
    const { data: recentActivity } = await supabaseAdmin
      .from('test_results')
      .select('created_at, test_title')
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Активность по дням за последний месяц
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: dailyActivity } = await supabaseAdmin
      .from('test_results')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    // Группируем по дням
    const dailyStats = {};
    dailyActivity?.forEach(result => {
      const day = new Date(result.created_at).toISOString().split('T')[0];
      dailyStats[day] = (dailyStats[day] || 0) + 1;
    });
    
    const dailyActivityChart = Object.entries(dailyStats)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    res.json({
      ...analyticsData,
      recent_activity: recentActivity || [],
      daily_activity: dailyActivityChart
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// GET /api/analytics/tests - Аналитика по тестам
router.get('/tests', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: testStats, error } = await supabaseAdmin
      .from('tests')
      .select(`
        id,
        title,
        category,
        difficulty,
        completed_count,
        created_at,
        test_results(total_score, time_taken, created_at)
      `);
    
    if (error) throw error;
    
    const testAnalytics = testStats.map(test => {
      const results = test.test_results || [];
      const totalAttempts = results.length;
      
      if (totalAttempts === 0) {
        return {
          id: test.id,
          title: test.title,
          category: test.category,
          difficulty: test.difficulty,
          total_attempts: 0,
          average_score: 0,
          average_time: 0,
          completion_rate: 0,
          last_attempt: null
        };
      }
      
      const averageScore = Math.round(
        results.reduce((sum, r) => sum + r.total_score, 0) / totalAttempts
      );
      
      const averageTime = Math.round(
        results.reduce((sum, r) => sum + r.time_taken, 0) / totalAttempts
      );
      
      const lastAttempt = results
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at;
      
      return {
        id: test.id,
        title: test.title,
        category: test.category,
        difficulty: test.difficulty,
        total_attempts: totalAttempts,
        average_score: averageScore,
        average_time: averageTime,
        completion_rate: Math.round((totalAttempts / (test.completed_count || 1)) * 100),
        last_attempt: lastAttempt
      };
    });
    
    res.json({
      tests: testAnalytics,
      summary: {
        total_tests: testStats.length,
        most_popular: testAnalytics.sort((a, b) => b.total_attempts - a.total_attempts)[0],
        highest_scoring: testAnalytics.sort((a, b) => b.average_score - a.average_score)[0]
      }
    });
  } catch (error) {
    console.error('Error fetching test analytics:', error);
    res.status(500).json({ error: 'Failed to fetch test analytics' });
  }
});

// GET /api/analytics/users - Аналитика по пользователям
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    // Получаем данные о пользователях и их активности
    const { data: userStats, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        name,
        email,
        created_at,
        test_results(total_score, created_at, test_category)
      `);
    
    if (error) throw error;
    
    const userAnalytics = userStats.map(user => {
      const results = user.test_results || [];
      const totalTests = results.length;
      
      if (totalTests === 0) {
        return {
          id: user.id,
          name: user.name || 'Anonymous',
          email: user.email,
          joined_at: user.created_at,
          total_tests: 0,
          average_score: 0,
          last_activity: null,
          favorite_category: null
        };
      }
      
      const averageScore = Math.round(
        results.reduce((sum, r) => sum + r.total_score, 0) / totalTests
      );
      
      const lastActivity = results
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at;
      
      // Наиболее частая категория
      const categoryCount = {};
      results.forEach(result => {
        const category = result.test_category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      
      const favoriteCategory = Object.keys(categoryCount).length > 0
        ? Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b)
        : null;
      
      return {
        id: user.id,
        name: user.name || 'Anonymous',
        email: user.email,
        joined_at: user.created_at,
        total_tests: totalTests,
        average_score: averageScore,
        last_activity: lastActivity,
        favorite_category: favoriteCategory
      };
    });
    
    // Статистика активности
    const now = new Date();
    const activeUsers = userAnalytics.filter(user => {
      if (!user.last_activity) return false;
      const lastActivity = new Date(user.last_activity);
      const daysDiff = (now - lastActivity) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    }).length;
    
    const newUsersThisMonth = userAnalytics.filter(user => {
      const joinDate = new Date(user.joined_at);
      return joinDate.getMonth() === now.getMonth() && 
             joinDate.getFullYear() === now.getFullYear();
    }).length;
    
    res.json({
      users: userAnalytics,
      summary: {
        total_users: userStats.length,
        active_users_30d: activeUsers,
        new_users_this_month: newUsersThisMonth,
        average_tests_per_user: Math.round(
          userAnalytics.reduce((sum, u) => sum + u.total_tests, 0) / userStats.length
        )
      }
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// GET /api/analytics/performance - Аналитика производительности
router.get('/performance', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Получаем данные за указанный период
    const { data: results, error } = await supabaseAdmin
      .from('test_results')
      .select('total_score, time_taken, created_at, test_category')
      .gte('created_at', startDate.toISOString());
    
    if (error) throw error;
    
    // Группируем по дням
    const dailyPerformance = {};
    results.forEach(result => {
      const day = new Date(result.created_at).toISOString().split('T')[0];
      if (!dailyPerformance[day]) {
        dailyPerformance[day] = {
          attempts: 0,
          total_score: 0,
          total_time: 0
        };
      }
      dailyPerformance[day].attempts++;
      dailyPerformance[day].total_score += result.total_score;
      dailyPerformance[day].total_time += result.time_taken;
    });
    
    const performanceChart = Object.entries(dailyPerformance)
      .map(([date, data]) => ({
        date,
        attempts: data.attempts,
        average_score: Math.round(data.total_score / data.attempts),
        average_time: Math.round(data.total_time / data.attempts)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Производительность по категориям
    const categoryPerformance = {};
    results.forEach(result => {
      const category = result.test_category;
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = {
          attempts: 0,
          total_score: 0,
          total_time: 0
        };
      }
      categoryPerformance[category].attempts++;
      categoryPerformance[category].total_score += result.total_score;
      categoryPerformance[category].total_time += result.time_taken;
    });
    
    const categoryStats = Object.entries(categoryPerformance)
      .map(([category, data]) => ({
        category,
        attempts: data.attempts,
        average_score: Math.round(data.total_score / data.attempts),
        average_time: Math.round(data.total_time / data.attempts)
      }));
    
    res.json({
      period_days: parseInt(days),
      daily_performance: performanceChart,
      category_performance: categoryStats,
      summary: {
        total_attempts: results.length,
        overall_average_score: results.length > 0 
          ? Math.round(results.reduce((sum, r) => sum + r.total_score, 0) / results.length)
          : 0,
        overall_average_time: results.length > 0
          ? Math.round(results.reduce((sum, r) => sum + r.time_taken, 0) / results.length)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ error: 'Failed to fetch performance analytics' });
  }
});

// GET /api/analytics/export - Экспорт аналитики в CSV
router.get('/export', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { type = 'results', format = 'csv' } = req.query;
    
    let data;
    let headers;
    
    switch (type) {
      case 'results':
        const { data: results } = await supabaseAdmin
          .from('test_results')
          .select(`
            id,
            total_score,
            time_taken,
            created_at,
            test_title,
            test_category,
            profiles(name, email)
          `)
          .order('created_at', { ascending: false });
        
        data = results.map(r => ({
          id: r.id,
          user_name: r.profiles?.name || 'Anonymous',
          user_email: r.profiles?.email || 'N/A',
          test_title: r.test_title,
          test_category: r.test_category,
          total_score: r.total_score,
          time_taken: r.time_taken,
          completed_at: r.created_at
        }));
        
        headers = [
          'ID', 'User Name', 'User Email', 'Test Title', 
          'Category', 'Score', 'Time (seconds)', 'Completed At'
        ];
        break;
        
      case 'users':
        const { data: users } = await supabaseAdmin
          .from('profiles')
          .select(`
            id,
            name,
            email,
            created_at,
            test_results(id)
          `);
        
        data = users.map(u => ({
          id: u.id,
          name: u.name || 'Anonymous',
          email: u.email,
          tests_completed: u.test_results?.length || 0,
          joined_at: u.created_at
        }));
        
        headers = ['ID', 'Name', 'Email', 'Tests Completed', 'Joined At'];
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }
    
    if (format === 'csv') {
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const key = header.toLowerCase().replace(/ /g, '_').replace(/[()]/g, '');
            const value = row[Object.keys(row).find(k => 
              k.toLowerCase().replace(/ /g, '_').replace(/[()]/g, '') === key
            )];
            return `"${value || ''}"`;
          }).join(',')
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      res.json({ data, exported_at: new Date().toISOString() });
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ error: 'Failed to export analytics' });
  }
});

module.exports = router;