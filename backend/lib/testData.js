// lib/testData.js
export const tests = [
  {
    id: 'career_orientation_basic',
    title: 'Базовая профориентация',
    description: 'Определите свои основные склонности и интересы в различных сферах деятельности',
    icon: '🎯',
    duration: 15,
    questionsCount: 10,
    difficulty: 'Легкий',
    completedCount: 1250,
    category: 'orientation',
    questions: [
      {
        id: 'q1',
        question: 'Что вас больше привлекает в работе?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Работа с людьми и командой',
            score: 5,
            categories: ['social', 'leadership']
          },
          {
            id: 'a2',
            text: 'Решение технических задач',
            score: 5,
            categories: ['technical', 'analytical']
          },
          {
            id: 'a3',
            text: 'Творческие проекты',
            score: 5,
            categories: ['creative']
          },
          {
            id: 'a4',
            text: 'Анализ данных и исследования',
            score: 5,
            categories: ['analytical']
          }
        ]
      },
      {
        id: 'q2',
        question: 'Оцените, насколько вам нравится работать в команде (от 1 до 5)',
        type: 'scale',
        scaleLabels: {
          min: 'Предпочитаю работать один',
          max: 'Обожаю командную работу'
        },
        categories: ['social', 'leadership']
      },
      {
        id: 'q3',
        question: 'Какие задачи вам интереснее всего решать?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Логические головоломки',
            score: 4,
            categories: ['analytical']
          },
          {
            id: 'a2',
            text: 'Планирование мероприятий',
            score: 4,
            categories: ['leadership', 'social']
          },
          {
            id: 'a3',
            text: 'Создание дизайна',
            score: 4,
            categories: ['creative']
          },
          {
            id: 'a4',
            text: 'Программирование',
            score: 4,
            categories: ['technical']
          }
        ]
      },
      {
        id: 'q4',
        question: 'Как вы предпочитаете получать новую информацию?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Читая книги и статьи',
            score: 3,
            categories: ['analytical']
          },
          {
            id: 'a2',
            text: 'Смотря видео и презентации',
            score: 3,
            categories: ['creative']
          },
          {
            id: 'a3',
            text: 'Практикуясь и экспериментируя',
            score: 4,
            categories: ['technical']
          },
          {
            id: 'a4',
            text: 'Обсуждая с другими людьми',
            score: 4,
            categories: ['social']
          }
        ]
      },
      {
        id: 'q5',
        question: 'Что мотивирует вас больше всего в работе?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Помощь другим людям',
            score: 5,
            categories: ['social']
          },
          {
            id: 'a2',
            text: 'Создание чего-то нового',
            score: 5,
            categories: ['creative']
          },
          {
            id: 'a3',
            text: 'Решение сложных задач',
            score: 5,
            categories: ['analytical', 'technical']
          },
          {
            id: 'a4',
            text: 'Руководство проектами',
            score: 5,
            categories: ['leadership']
          }
        ]
      },
      {
        id: 'q6',
        question: 'Оцените свою склонность к риску (от 1 до 5)',
        type: 'scale',
        scaleLabels: {
          min: 'Избегаю рисков',
          max: 'Люблю рисковать'
        },
        categories: ['leadership', 'creative']
      },
      {
        id: 'q7',
        question: 'В какой обстановке вы работаете продуктивнее?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'В тихом офисе в одиночестве',
            score: 3,
            categories: ['analytical', 'technical']
          },
          {
            id: 'a2',
            text: 'В шумном коллективе',
            score: 4,
            categories: ['social']
          },
          {
            id: 'a3',
            text: 'В творческом пространстве',
            score: 4,
            categories: ['creative']
          },
          {
            id: 'a4',
            text: 'Везде, где есть вызов',
            score: 5,
            categories: ['leadership']
          }
        ]
      },
      {
        id: 'q8',
        question: 'Какой стиль работы вам ближе?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Четкий план и последовательность',
            score: 4,
            categories: ['analytical']
          },
          {
            id: 'a2',
            text: 'Гибкость и адаптация',
            score: 4,
            categories: ['creative', 'social']
          },
          {
            id: 'a3',
            text: 'Системный подход',
            score: 5,
            categories: ['technical']
          },
          {
            id: 'a4',
            text: 'Инициатива и лидерство',
            score: 5,
            categories: ['leadership']
          }
        ]
      },
      {
        id: 'q9',
        question: 'Оцените важность стабильности в работе (от 1 до 5)',
        type: 'scale',
        scaleLabels: {
          min: 'Нужны перемены',
          max: 'Важна стабильность'
        },
        categories: ['analytical', 'technical']
      },
      {
        id: 'q10',
        question: 'Что вы считаете своей главной сильной стороной?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Умение находить общий язык с людьми',
            score: 5,
            categories: ['social']
          },
          {
            id: 'a2',
            text: 'Креативность и нестандартное мышление',
            score: 5,
            categories: ['creative']
          },
          {
            id: 'a3',
            text: 'Логическое мышление и анализ',
            score: 5,
            categories: ['analytical']
          },
          {
            id: 'a4',
            text: 'Технические навыки',
            score: 5,
            categories: ['technical']
          },
          {
            id: 'a5',
            text: 'Способность руководить',
            score: 5,
            categories: ['leadership']
          }
        ]
      }
    ]
  },
  {
    id: 'it_skills_assessment',
    title: 'Оценка IT навыков',
    description: 'Узнайте, какая область IT подходит вам больше всего',
    icon: '💻',
    duration: 20,
    questionsCount: 8,
    difficulty: 'Средний',
    completedCount: 850,
    category: 'technical',
    questions: [
      {
        id: 'q1',
        question: 'Какой тип IT-задач вам больше нравится?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Создание пользовательских интерфейсов',
            score: 5,
            categories: ['frontend', 'design']
          },
          {
            id: 'a2',
            text: 'Работа с базами данных и серверами',
            score: 5,
            categories: ['backend', 'database']
          },
          {
            id: 'a3',
            text: 'Анализ больших данных',
            score: 5,
            categories: ['data_science', 'analytics']
          },
          {
            id: 'a4',
            text: 'Обеспечение безопасности систем',
            score: 5,
            categories: ['security', 'infrastructure']
          }
        ]
      },
      {
        id: 'q2',
        question: 'Оцените свой интерес к программированию (от 1 до 5)',
        type: 'scale',
        scaleLabels: {
          min: 'Не интересно',
          max: 'Очень интересно'
        },
        categories: ['programming']
      },
      {
        id: 'q3',
        question: 'Какие технологии вас больше привлекают?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'JavaScript, React, Vue.js',
            score: 4,
            categories: ['frontend', 'web']
          },
          {
            id: 'a2',
            text: 'Python, Java, C#',
            score: 4,
            categories: ['backend', 'programming']
          },
          {
            id: 'a3',
            text: 'SQL, MongoDB, Redis',
            score: 4,
            categories: ['database', 'backend']
          },
          {
            id: 'a4',
            text: 'Machine Learning, AI',
            score: 5,
            categories: ['data_science', 'ai']
          }
        ]
      },
      {
        id: 'q4',
        question: 'Как вы относитесь к работе с пользователями?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Люблю понимать потребности пользователей',
            score: 5,
            categories: ['frontend', 'ux']
          },
          {
            id: 'a2',
            text: 'Предпочитаю техническую сторону',
            score: 4,
            categories: ['backend', 'infrastructure']
          },
          {
            id: 'a3',
            text: 'Интересна аналитика поведения',
            score: 4,
            categories: ['analytics', 'data_science']
          },
          {
            id: 'a4',
            text: 'Важна безопасность данных',
            score: 4,
            categories: ['security']
          }
        ]
      },
      {
        id: 'q5',
        question: 'Оцените склонность к изучению новых технологий (от 1 до 5)',
        type: 'scale',
        scaleLabels: {
          min: 'Предпочитаю стабильность',
          max: 'Постоянно изучаю новое'
        },
        categories: ['learning', 'adaptation']
      },
      {
        id: 'q6',
        question: 'Какой тип проектов вас вдохновляет?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Красивые и удобные приложения',
            score: 5,
            categories: ['frontend', 'design']
          },
          {
            id: 'a2',
            text: 'Высоконагруженные системы',
            score: 5,
            categories: ['backend', 'infrastructure']
          },
          {
            id: 'a3',
            text: 'Прогнозирование и аналитика',
            score: 5,
            categories: ['data_science']
          },
          {
            id: 'a4',
            text: 'Защита и безопасность',
            score: 5,
            categories: ['security']
          }
        ]
      },
      {
        id: 'q7',
        question: 'Как вы предпочитаете решать сложные задачи?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Разбиваю на простые части',
            score: 4,
            categories: ['backend', 'programming']
          },
          {
            id: 'a2',
            text: 'Ищу креативные решения',
            score: 4,
            categories: ['frontend', 'design']
          },
          {
            id: 'a3',
            text: 'Анализирую данные и паттерны',
            score: 5,
            categories: ['data_science', 'analytics']
          },
          {
            id: 'a4',
            text: 'Изучаю возможные уязвимости',
            score: 4,
            categories: ['security']
          }
        ]
      },
      {
        id: 'q8',
        question: 'Оцените важность визуальной составляющей в IT (от 1 до 5)',
        type: 'scale',
        scaleLabels: {
          min: 'Функциональность важнее',
          max: 'Дизайн очень важен'
        },
        categories: ['design', 'frontend']
      }
    ]
  },
  {
    id: 'leadership_potential',
    title: 'Лидерский потенциал',
    description: 'Оцените свои управленческие способности и склонность к лидерству',
    icon: '👑',
    duration: 18,
    questionsCount: 8,
    difficulty: 'Средний',
    completedCount: 620,
    category: 'leadership',
    questions: [
      {
        id: 'q1',
        question: 'Как вы ведете себя в конфликтных ситуациях?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Стараюсь найти компромисс',
            score: 4,
            categories: ['mediation', 'social']
          },
          {
            id: 'a2',
            text: 'Избегаю конфликтов',
            score: 1,
            categories: ['passive']
          },
          {
            id: 'a3',
            text: 'Отстаиваю свою позицию',
            score: 3,
            categories: ['assertive']
          },
          {
            id: 'a4',
            text: 'Ищу решение, выгодное всем',
            score: 5,
            categories: ['leadership', 'strategic']
          }
        ]
      },
      {
        id: 'q2',
        question: 'Оцените вашу готовность брать ответственность (от 1 до 5)',
        type: 'scale',
        scaleLabels: {
          min: 'Предпочитаю следовать',
          max: 'Готов вести за собой'
        },
        categories: ['responsibility', 'leadership']
      },
      {
        id: 'q3',
        question: 'Как вы мотивируете других людей?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Личным примером',
            score: 5,
            categories: ['leading_by_example']
          },
          {
            id: 'a2',
            text: 'Словами поддержки',
            score: 4,
            categories: ['emotional_leadership']
          },
          {
            id: 'a3',
            text: 'Четкими целями и планами',
            score: 4,
            categories: ['strategic', 'planning']
          },
          {
            id: 'a4',
            text: 'Признанием достижений',
            score: 4,
            categories: ['team_building']
          }
        ]
      },
      {
        id: 'q4',
        question: 'Как вы принимаете важные решения?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Анализирую все факты',
            score: 4,
            categories: ['analytical', 'strategic']
          },
          {
            id: 'a2',
            text: 'Советуюсь с командой',
            score: 4,
            categories: ['collaborative']
          },
          {
            id: 'a3',
            text: 'Полагаюсь на интуицию',
            score: 3,
            categories: ['intuitive']
          },
          {
            id: 'a4',
            text: 'Быстро, основываясь на опыте',
            score: 5,
            categories: ['decisive', 'experienced']
          }
        ]
      },
      {
        id: 'q5',
        question: 'Оцените вашу коммуникабельность (от 1 до 5)',
        type: 'scale',
        scaleLabels: {
          min: 'Замкнутый',
          max: 'Очень общительный'
        },
        categories: ['communication', 'social']
      },
      {
        id: 'q6',
        question: 'Как вы реагируете на критику?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Принимаю и работаю над ошибками',
            score: 5,
            categories: ['growth_mindset', 'learning']
          },
          {
            id: 'a2',
            text: 'Защищаюсь и объясняю',
            score: 2,
            categories: ['defensive']
          },
          {
            id: 'a3',
            text: 'Анализирую обоснованность',
            score: 4,
            categories: ['analytical']
          },
          {
            id: 'a4',
            text: 'Использую как мотивацию',
            score: 5,
            categories: ['resilient', 'motivated']
          }
        ]
      },
      {
        id: 'q7',
        question: 'Какой стиль управления вам ближе?',
        type: 'multiple_choice',
        answers: [
          {
            id: 'a1',
            text: 'Демократичный, с учетом мнений',
            score: 4,
            categories: ['democratic', 'inclusive']
          },
          {
            id: 'a2',
            text: 'Директивный, четкие указания',
            score: 3,
            categories: ['directive']
          },
          {
            id: 'a3',
            text: 'Коучинговый, развитие людей',
            score: 5,
            categories: ['coaching', 'developing']
          },
          {
            id: 'a4',
            text: 'Визионерский, вдохновляющий',
            score: 5,
            categories: ['visionary', 'inspiring']
          }
        ]
      },
      {
        id: 'q8',
        question: 'Оцените вашу способность видеть общую картину (от 1 до 5)',
        type: 'scale',
        scaleLabels: {
          min: 'Фокусируюсь на деталях',
          max: 'Мыслю стратегически'
        },
        categories: ['strategic', 'vision']
      }
    ]
  }
]

// Профессиональные рекомендации на основе результатов
export const careerRecommendations = {
  social: {
    title: 'Социальные профессии',
    careers: [
      'HR-менеджер',
      'Психолог',
      'Учитель',
      'Социальный работник',
      'PR-менеджер',
      'Консультант по продажам'
    ]
  },
  technical: {
    title: 'Технические профессии',
    careers: [
      'Программист',
      'Системный администратор',
      'DevOps-инженер',
      'QA-инженер',
      'Технический писатель',
      'IT-архитектор'
    ]
  },
  creative: {
    title: 'Творческие профессии',
    careers: [
      'UI/UX дизайнер',
      'Графический дизайнер',
      'Копирайтер',
      'Маркетолог',
      'Арт-директор',
      'Content-менеджер'
    ]
  },
  analytical: {
    title: 'Аналитические профессии',
    careers: [
      'Бизнес-аналитик',
      'Аналитик данных',
      'Исследователь',
      'Финансовый аналитик',
      'Консультант',
      'Аудитор'
    ]
  },
  leadership: {
    title: 'Управленческие профессии',
    careers: [
      'Менеджер проекта',
      'Team Lead',
      'Руководитель отдела',
      'Предприниматель',
      'Консультант по управлению',
      'Директор'
    ]
  }
}