// components/Tests/TestResults.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../Common/GlassCard';
import { toast } from 'react-hot-toast';

const TestResults = ({ result, test, onClose, onShare }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getResultLevel = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return { level: 'Отлично', color: 'text-green-400', emoji: '🏆' };
    if (percentage >= 60) return { level: 'Хорошо', color: 'text-blue-400', emoji: '👍' };
    if (percentage >= 40) return { level: 'Средне', color: 'text-yellow-400', emoji: '👌' };
    return { level: 'Требует развития', color: 'text-red-400', emoji: '💪' };
  };

  const getProfessionRecommendations = (categoryScores) => {
    if (!categoryScores || Object.keys(categoryScores).length === 0) {
      return ['Пройдите больше тестов для получения рекомендаций'];
    }

    const sortedCategories = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const recommendations = {
      'analytical': ['Аналитик данных', 'Исследователь', 'Финансовый аналитик'],
      'creative': ['Дизайнер', 'Маркетолог', 'Копирайтер'],
      'social': ['HR-менеджер', 'Психолог', 'Учитель'],
      'technical': ['Программист', 'Инженер', 'Архитектор'],
      'leadership': ['Менеджер проекта', 'Руководитель', 'Предприниматель'],
      'frontend': ['Frontend разработчик', 'UI/UX дизайнер', 'Веб-дизайнер'],
      'backend': ['Backend разработчик', 'DevOps инженер', 'Системный администратор'],
      'data_science': ['Data Scientist', 'ML Engineer', 'Аналитик данных'],
      'security': ['Специалист по кибербезопасности', 'Пентестер', 'Security Engineer']
    };

    return sortedCategories.map(([category]) => 
      recommendations[category] || ['Универсальные профессии']
    ).flat().slice(0, 6);
  };

  const handleShare = async () => {
    try {
      await onShare(result);
    } catch (error) {
      console.error('Error sharing result:', error);
    }
  };

  // Вычисляем максимальный возможный балл
  const maxScore = test.questions.reduce((sum, q) => {
    if (q.type === 'multiple_choice') {
      return sum + Math.max(...q.answers.map(a => a.score || 0));
    } else if (q.type === 'scale') {
      return sum + 5; // Максимальный балл для scale вопроса
    }
    return sum + 5; // Дефолтный максимум
  }, 0);

  const resultLevel = getResultLevel(result.totalScore, maxScore);
  const professionRecommendations = getProfessionRecommendations(result.categoryScores);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-4"
          >
            {resultLevel.emoji}
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Тест завершен!
          </h1>
          <p className="text-gray-300">
            {test.title}
          </p>
        </div>

        {/* Main Results */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-3">
              Общий результат
            </h3>
            <div className="text-3xl font-bold text-white mb-2">
              {result.totalScore}/{maxScore}
            </div>
            <div className={`text-lg ${resultLevel.color}`}>
              {resultLevel.level}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {Math.round((result.totalScore / maxScore) * 100)}%
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-3">
              Время выполнения
            </h3>
            <div className="text-3xl font-bold text-white mb-2">
              {formatTime(result.timeTaken)}
            </div>
            <div className="text-gray-300">
              из {test.duration} минут
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {result.timeTaken < test.duration * 60 * 0.5 ? 'Быстро!' : 
               result.timeTaken < test.duration * 60 * 0.8 ? 'В норме' : 'Не торопясь'}
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-3">
              Точность
            </h3>
            <div className="text-3xl font-bold text-white mb-2">
              {test.questions.length}/{test.questions.length}
            </div>
            <div className="text-gray-300">
              ответов дано
            </div>
            <div className="text-sm text-green-400 mt-2">
              100% завершение
            </div>
          </GlassCard>
        </div>

        {/* Category Scores */}
        {result.categoryScores && Object.keys(result.categoryScores).length > 0 && (
          <GlassCard className="p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              Результаты по категориям
            </h3>
            <div className="space-y-4">
              {Object.entries(result.categoryScores)
                .sort(([,a], [,b]) => b - a)
                .map(([category, score]) => {
                  const maxCategoryScore = Math.max(...Object.values(result.categoryScores));
                  const percentage = (score / maxCategoryScore) * 100;
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize font-medium min-w-[120px]">
                        {category.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                          />
                        </div>
                        <span className="text-white font-semibold min-w-[40px] text-right">
                          {score}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </GlassCard>
        )}

        {/* Profession Recommendations */}
        <GlassCard className="p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">
            Рекомендуемые профессии
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionRecommendations.map((profession, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-colors"
              >
                <div className="text-white font-semibold">{profession}</div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Learning Plan */}
        <GlassCard className="p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">
            Рекомендации по развитию
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-400 text-xl">📚</div>
              <div>
                <div className="text-white font-semibold">Изучите основы</div>
                <div className="text-gray-300">
                  Начните с базовых курсов в выбранной области
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-green-400 text-xl">🎯</div>
              <div>
                <div className="text-white font-semibold">Практические проекты</div>
                <div className="text-gray-300">
                  Создайте портфолио с реальными проектами
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-purple-400 text-xl">🌟</div>
              <div>
                <div className="text-white font-semibold">Получите сертификацию</div>
                <div className="text-gray-300">
                  Подтвердите свои навыки официальными сертификатами
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-orange-400 text-xl">👥</div>
              <div>
                <div className="text-white font-semibold">Найдите наставника</div>
                <div className="text-gray-300">
                  Общайтесь с опытными специалистами в выбранной области
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleShare}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>📤</span>
            <span>Поделиться результатом</span>
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>{showDetails ? '👁️‍🗨️' : '👁️'}</span>
            <span>{showDetails ? 'Скрыть детали' : 'Показать детали'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>👤</span>
            <span>Перейти в профиль</span>
          </button>
        </div>

        {/* Detailed Results */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Детальные результаты
              </h3>
              <div className="space-y-6">
                {test.questions.map((question, index) => {
                  const userAnswer = result.answers?.[question.id];
                  
                  return (
                    <div key={question.id} className="border-b border-white/10 pb-4 last:border-b-0">
                      <div className="text-white font-semibold mb-3">
                        {index + 1}. {question.question}
                      </div>
                      
                      <div className="ml-4 space-y-2">
                        <div className="text-gray-300">
                          <span className="font-medium">Ваш ответ: </span>
                          {userAnswer ? (
                            <span className="text-blue-400">
                              {question.type === 'scale' 
                                ? `${userAnswer.value}/5`
                                : userAnswer.value || 'Не отвечено'
                              }
                            </span>
                          ) : (
                            <span className="text-red-400">Не отвечено</span>
                          )}
                        </div>
                        
                        {question.type === 'multiple_choice' && userAnswer && (
                          <div className="text-sm text-gray-400">
                            {(() => {
                              const selectedAnswer = question.answers.find(a => a.id === userAnswer.answerId);
                              return selectedAnswer ? (
                                <div>
                                  <span>Баллы: {selectedAnswer.score || 0}</span>
                                  {selectedAnswer.categories && (
                                    <span className="ml-4">
                                      Категории: {selectedAnswer.categories.join(', ')}
                                    </span>
                                  )}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                        
                        {question.type === 'scale' && userAnswer && (
                          <div className="text-sm text-gray-400">
                            <span>Баллы: {userAnswer.value}</span>
                            {question.categories && (
                              <span className="ml-4">
                                Категории: {question.categories.join(', ')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TestResults;