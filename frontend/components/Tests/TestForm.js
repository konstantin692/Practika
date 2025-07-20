// components/Tests/TestForm.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../Common/GlassCard';
import { toast } from 'react-hot-toast';

const TestForm = ({ test, onComplete, onExit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(test.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answerId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        answerId,
        value,
        questionType: test.questions[currentQuestion].type
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const result = {
        answers,
        timeTaken: (test.duration * 60) - timeLeft
      };
      await onComplete(result);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Ошибка при сохранении результатов');
      setIsSubmitting(false);
    }
  };

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const isAnswered = answers[question.id];

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ошибка загрузки вопроса</h2>
          <button
            onClick={onExit}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Выйти из теста
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onExit}
            className="text-gray-300 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            ← Выйти
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{test.title}</h2>
            <p className="text-gray-300">
              Вопрос {currentQuestion + 1} из {test.questions.length}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-white font-semibold">{formatTime(timeLeft)}</div>
            <div className="text-gray-300 text-sm">Осталось</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-8 mb-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                {question.question}
              </h3>

              <div className="space-y-4">
                {question.type === 'multiple_choice' && (
                  <div className="space-y-3">
                    {question.answers?.map((answer) => (
                      <button
                        key={answer.id}
                        onClick={() => handleAnswer(question.id, answer.id, answer.text)}
                        disabled={isSubmitting}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 disabled:opacity-50 ${
                          answers[question.id]?.answerId === answer.id
                            ? 'border-blue-500 bg-blue-500/20 text-white'
                            : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {answer.text}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'scale' && (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{question.scaleLabels?.min || 'Не согласен'}</span>
                      <span>{question.scaleLabels?.max || 'Полностью согласен'}</span>
                    </div>
                    <div className="flex justify-between">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleAnswer(question.id, value, value)}
                          disabled={isSubmitting}
                          className={`w-12 h-12 rounded-full border-2 transition-all duration-200 disabled:opacity-50 ${
                            answers[question.id]?.answerId === value
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-white/20 text-gray-300 hover:border-white/40'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {question.type === 'text' && (
                  <textarea
                    value={answers[question.id]?.value || ''}
                    onChange={(e) => handleAnswer(question.id, 'text', e.target.value)}
                    placeholder="Ваш ответ..."
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] disabled:opacity-50"
                  />
                )}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0 || isSubmitting}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Назад
          </button>

          <button
            onClick={handleNext}
            disabled={!isAnswered || isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 flex items-center space-x-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>
              {isSubmitting ? 'Сохранение...' : 
               currentQuestion === test.questions.length - 1 ? 'Завершить' : 'Далее'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestForm;