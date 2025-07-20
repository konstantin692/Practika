// components/Tests/TestCard.js
import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../Common/GlassCard';

const TestCard = ({ test, onStart }) => {
  const difficultyColors = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400'
  };

  const difficultyLabels = {
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный'
  };

  return (
    <GlassCard className="p-6 h-full" onClick={() => onStart(test.id)}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="h-full flex flex-col"
      >
        <div className="text-4xl mb-4">{test.icon}</div>
        
        <h3 className="text-xl font-semibold text-white mb-3">
          {test.title}
        </h3>
        
        <p className="text-gray-300 mb-4 flex-grow">
          {test.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Время:</span>
            <span className="text-white">{test.duration} мин</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Вопросов:</span>
            <span className="text-white">{test.questions_count}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Сложность:</span>
            <span className={difficultyColors[test.difficulty]}>
              {difficultyLabels[test.difficulty]}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Прошли:</span>
            <span className="text-white">{test.completed_count || 0} чел.</span>
          </div>
        </div>

        <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
          Начать тест
        </button>
      </motion.div>
    </GlassCard>
  );
};

export default TestCard;