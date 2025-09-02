// Mock data for testing flattenedPlaybackUnits
const mockMessageStream = [
  {
    type: 'text',
    text: 'give me a quiz on white blood',
    isUser: true,
    playable: false
  },
  {
    status: 'user_message',
    timestamp: 1756212689.443799,
    message: 'I\'ve prepared the quiz for chapter: Chapter 6: Transport in Humans. Ready to start learning!'
  },
  {
    status: 'user_message',
    timestamp: 1756212721.252019,
    message: 'Great! I\'ve prepared a comprehensive lesson for you on your chosen topic. It contains 5 sections/slides. You can now review the materials or ask me to start teaching.',
    slides: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        syllabus_id: 'biology_o_level_white_blood_cells',
        parent_id: null,
        order: 1,
        part_label: 'Q1',
        type: 'question',
        question_type: 'mcq',
        title: 'White Blood Cell Function Slide 1',
        content: 'Which white blood cell type is primarily responsible for producing antibodies?',
        speech_to_text_content: 'Which white blood cell type produces antibodies?',
        answer: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            question_id: '550e8400-e29b-41d4-a716-446655440001',
            option_id: '550e8400-e29b-41d4-a716-446655440003',
            answer_text: null,
            answer_boolean: null,
            answer_draw_file: null,
            order_index: 1
          }
        ],
        options: [
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            option_text: 'Lymphocytes',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440004',
            option_text: 'Phagocytes',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440005',
            option_text: 'Neutrophils',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440006',
            option_text: 'Monocytes',
            imageUrl: null
          }
        ],
        explanation: 'Lymphocytes are responsible for producing antibodies, which recognize and neutralize foreign antigens in the immune system.',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        source_timestamp: '2024-01-15T10:30:00Z',
        notes_url: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        syllabus_id: 'biology_o_level_white_blood_cells',
        parent_id: null,
        order: 2,
        part_label: 'Q2',
        type: 'question',
        question_type: 'mcq',
        title: 'White Blood Cell Defense Mechanism',
        content: 'What process do phagocytes use to destroy foreign particles?',
        speech_to_text_content: 'How do phagocytes destroy foreign particles?',
        answer: [
          {
            id: '550e8400-e29b-41d4-a716-446655440008',
            question_id: '550e8400-e29b-41d4-a716-446655440007',
            option_id: '550e8400-e29b-41d4-a716-446655440009',
            answer_text: null,
            answer_boolean: null,
            answer_draw_file: null,
            order_index: 1
          }
        ],
        options: [
          {
            id: '550e8400-e29b-41d4-a716-446655440009',
            option_text: 'Phagocytosis',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440010',
            option_text: 'Antibody formation',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440011',
            option_text: 'Clotting',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440012',
            option_text: 'Agglutination',
            imageUrl: null
          }
        ],
        explanation: 'Phagocytosis is the process where phagocytes engulf and destroy foreign particles like bacteria and dead cells.',
        created_at: '2024-01-15T10:31:00Z',
        updated_at: '2024-01-15T10:31:00Z',
        source_timestamp: '2024-01-15T10:31:00Z',
        notes_url: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        syllabus_id: 'biology_o_level_white_blood_cells',
        parent_id: null,
        order: 3,
        part_label: 'Q3',
        type: 'question',
        question_type: 'boolean',
        title: 'White Blood Cell Structure',
        content: 'White blood cells have a nucleus that helps them perform their immune defense functions.',
        speech_to_text_content: 'Do white blood cells have a nucleus that helps them perform immune defense functions?',
        answer: [
          {
            id: '550e8400-e29b-41d4-a716-446655440014',
            question_id: '550e8400-e29b-41d4-a716-446655440013',
            option_id: null,
            answer_text: null,
            answer_boolean: true,
            answer_draw_file: null,
            order_index: 1
          }
        ],
        options: [],
        explanation: 'Unlike red blood cells which lose their nucleus, white blood cells retain their nucleus, which is crucial for their immune defense functions like producing antibodies and performing phagocytosis.',
        created_at: '2024-01-15T10:32:00Z',
        updated_at: '2024-01-15T10:32:00Z',
        source_timestamp: '2024-01-15T10:32:00Z',
        notes_url: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        syllabus_id: 'biology_o_level_white_blood_cells',
        parent_id: null,
        order: 4,
        part_label: 'Q4',
        type: 'question',
        question_type: 'open',
        title: 'White Blood Cell Types',
        content: 'Describe the two main types of white blood cells and their specific functions in the immune system.',
        speech_to_text_content: 'Explain the two main types of white blood cells and what they do.',
        answer: [
          {
            id: '550e8400-e29b-41d4-a716-446655440016',
            question_id: '550e8400-e29b-41d4-a716-446655440015',
            option_id: null,
            answer_text: 'The two main types of white blood cells are phagocytes and lymphocytes. Phagocytes perform phagocytosis by engulfing and destroying foreign particles like bacteria and dead cells. Lymphocytes produce antibodies that recognize and neutralize foreign antigens, helping to defend the body against infections.',
            answer_boolean: null,
            answer_draw_file: null,
            order_index: 1
          }
        ],
        options: [],
        explanation: 'A comprehensive answer should discuss both phagocytes and lymphocytes, explaining their unique roles in the immune defense system.',
        created_at: '2024-01-15T10:33:00Z',
        updated_at: '2024-01-15T10:33:00Z',
        source_timestamp: '2024-01-15T10:33:00Z',
        notes_url: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440017',
        syllabus_id: 'biology_o_level_white_blood_cells',
        parent_id: null,
        order: 5,
        part_label: 'Q5',
        type: 'question',
        question_type: 'mcq',
        title: 'Antibody Function',
        content: 'What do antibodies do when they recognize a foreign antigen?',
        speech_to_text_content: 'What happens when antibodies recognize a foreign antigen?',
        answer: [
          {
            id: '550e8400-e29b-41d4-a716-446655440018',
            question_id: '550e8400-e29b-41d4-a716-446655440017',
            option_id: '550e8400-e29b-41d4-a716-446655440019',
            answer_text: null,
            answer_boolean: null,
            answer_draw_file: null,
            order_index: 1
          }
        ],
        options: [
          {
            id: '550e8400-e29b-41d4-a716-446655440019',
            option_text: 'Cause bacteria to clump together and neutralize toxins',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440020',
            option_text: 'Produce more red blood cells',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440021',
            option_text: 'Increase blood pressure',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440022',
            option_text: 'Generate heat in the body',
            imageUrl: null
          }
        ],
        explanation: 'Antibodies cause bacteria to clump together (agglutination) and neutralize toxins produced by pathogens, helping to defend the body against infections.',
        created_at: '2024-01-15T10:34:00Z',
        updated_at: '2024-01-15T10:34:00Z',
        source_timestamp: '2024-01-15T10:34:00Z',
        notes_url: null
      }
    ]
  },
  {
    type: 'text',
    text: 'Antibodies cause bacteria to clump together (agglutination) and neutralize toxins produced by pathogens, helping to defend the body against infections. elaborate more on this',
    isUser: true,
    playable: false
  },
  {
    status: 'user_message',
    timestamp: 1756212816.02612,
    message: 'Let me break this down for you in a clear, educational way! \n\nAntibodies are specialized proteins produced by the immune system\'s B lymphocytes (white blood cells) that play a crucial defensive role. When bacteria or pathogens enter the body, antibodies have two key mechanisms of action:\n\n1. Agglutination: Antibodies cause bacteria to clump together, which makes it easier for other immune cells like phagocytes to identify and destroy these clustered bacteria. This clumping prevents bacteria from spreading and makes them more vulnerable to immune system attacks.\n\n2. Toxin Neutralization: Antibodies can bind directly to toxins produced by pathogens, effectively blocking their harmful effects. By attaching to these toxins, antibodies prevent them from interacting with and damaging the body\'s cells.\n\nThese processes are part of the body\'s adaptive immune response, which is specific and targeted. Each type of antibody is uniquely designed to recognize and combat a particular pathogen, providing a sophisticated defense mechanism that helps protect us from infections.\n\nWould you like to explore more about how the immune system works? I\'m excited to help you understand these fascinating biological processes! 🦁📘'
  },
  {
    status: 'user_message',
    timestamp: 1756212816.0327659,
    message: 'Great! I\'ve prepared a comprehensive lesson for you on your chosen topic. It contains 5 sections/slides. You can now review the materials or ask me to start teaching.',
    slides: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        syllabus_id: 'biology_o_level_white_blood_cells',
        parent_id: null,
        order: 1,
        part_label: 'Q1',
        type: 'question',
        question_type: 'mcq',
        title: 'White Blood Cell Function slide 2',
        content: 'Which white blood cell type is primarily responsible for producing antibodies?',
        speech_to_text_content: 'Which white blood cell type produces antibodies?',
        answer: [
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            question_id: '550e8400-e29b-41d4-a716-446655440001',
            option_id: '550e8400-e29b-41d4-a716-446655440003',
            answer_text: null,
            answer_boolean: null,
            answer_draw_file: null,
            order_index: 1
          }
        ],
        options: [
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            option_text: 'Lymphocytes',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440004',
            option_text: 'Phagocytes',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440005',
            option_text: 'Neutrophils',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440006',
            option_text: 'Monocytes',
            imageUrl: null
          }
        ],
        explanation: 'Lymphocytes are responsible for producing antibodies, which recognize and neutralize foreign antigens in the immune system.',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        source_timestamp: '2024-01-15T10:30:00Z',
        notes_url: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        syllabus_id: 'biology_o_level_white_blood_cells',
        parent_id: null,
        order: 2,
        part_label: 'Q2',
        type: 'question',
        question_type: 'mcq',
        title: 'White Blood Cell Defense Mechanism',
        content: 'What process do phagocytes use to destroy foreign particles?',
        speech_to_text_content: 'How do phagocytes destroy foreign particles?',
        answer: [
          {
            id: '550e8400-e29b-41d4-a716-446655440008',
            question_id: '550e8400-e29b-41d4-a716-446655440007',
            option_id: '550e8400-e29b-41d4-a716-446655440009',
            answer_text: null,
            answer_boolean: null,
            answer_draw_file: null,
            order_index: 1
          }
        ],
        options: [
          {
            id: '550e8400-e29b-41d4-a716-446655440009',
            option_text: 'Phagocytosis',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440010',
            option_text: 'Antibody formation',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440011',
            option_text: 'Clotting',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440012',
            option_text: 'Agglutination',
            imageUrl: null
          }
        ],
        explanation: 'Phagocytosis is the process where phagocytes engulf and destroy foreign particles like bacteria and dead cells.',
        created_at: '2024-01-15T10:31:00Z',
        updated_at: '2024-01-15T10:31:00Z',
        source_timestamp: '2024-01-15T10:31:00Z',
        notes_url: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        syllabus_id: 'biology_o_level_white_blood_cells',
        parent_id: null,
        order: 3,
        part_label: 'Q3',
        type: 'question',
        question_type: 'boolean',
        title: 'White Blood Cell Structure',
        content: 'White blood cells have a nucleus that helps them perform their immune defense functions.',
        speech_to_text_content: 'Do white blood cells have a nucleus that helps them perform immune defense functions?',
        answer: [
          {
            id: '550e8400-e29b-41d4-a716-446655440014',
            question_id: '550e8400-e29b-41d4-a716-446655440013',
            option_id: null,
            answer_text: null,
            answer_boolean: true,
            answer_draw_file: null,
            order_index: 1
          }
        ],
        options: [],
        explanation: 'Unlike red blood cells which lose their nucleus, white blood cells retain their nucleus, which is crucial for their immune defense functions like producing antibodies and performing phagocytosis.',
        created_at: '2024-01-15T10:32:00Z',
        updated_at: '2024-01-15T10:32:00Z',
        source_timestamp: '2024-01-15T10:32:00Z',
        notes_url: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        syllabus_id: 'biology_o_level_white_blood_cells',
        parent_id: null,
        order: 4,
        part_label: 'Q4',
        type: 'question',
        question_type: 'open',
        title: 'White Blood Cell Types',
        content: 'Describe the two main types of white blood cells and their specific functions in the immune system.',
        speech_to_text_content: 'Explain the two main types of white blood cells and what they do.',
        answer: [
          {
            id: '550e8400-e29b-41d4-a716-446655440016',
            question_id: '550e8400-e29b-41d4-a716-446655440015',
            option_id: null,
            answer_text: 'The two main types of white blood cells are phagocytes and lymphocytes. Phagocytes perform phagocytosis by engulfing and destroying foreign particles like bacteria and dead cells. Lymphocytes produce antibodies that recognize and neutralize foreign antigens, helping to defend the body against infections.',
            answer_boolean: null,
            answer_draw_file: null,
            order_index: 1
          }
        ],
        options: [],
        explanation: 'A comprehensive answer should discuss both phagocytes and lymphocytes, explaining their unique roles in the immune defense system.',
        created_at: '2024-01-15T10:33:00Z',
        updated_at: '2024-01-15T10:33:00Z',
        source_timestamp: '2024-01-15T10:33:00Z',
        notes_url: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440017',
        syllabus_id: 'biology_o_level_white_blood_cells',
        parent_id: null,
        order: 5,
        part_label: 'Q5',
        type: 'question',
        question_type: 'mcq',
        title: 'Antibody Function',
        content: 'What do antibodies do when they recognize a foreign antigen?',
        speech_to_text_content: 'What happens when antibodies recognize a foreign antigen?',
        answer: [
          {
            id: '550e8400-e29b-41d4-a716-446655440018',
            question_id: '550e8400-e29b-41d4-a716-446655440017',
            option_id: '550e8400-e29b-41d4-a716-446655440019',
            answer_text: null,
            answer_boolean: null,
            answer_draw_file: null,
            order_index: 1
          }
        ],
        options: [
          {
            id: '550e8400-e29b-41d4-a716-446655440019',
            option_text: 'Cause bacteria to clump together and neutralize toxins',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440020',
            option_text: 'Produce more red blood cells',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440021',
            option_text: 'Increase blood pressure',
            imageUrl: null
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440022',
            option_text: 'Generate heat in the body',
            imageUrl: null
          }
        ],
        explanation: 'Antibodies cause bacteria to clump together (agglutination) and neutralize toxins produced by pathogens, helping to defend the body against infections.',
        created_at: '2024-01-15T10:34:00Z',
        updated_at: '2024-01-15T10:34:00Z',
        source_timestamp: '2024-01-15T10:34:00Z',
        notes_url: null
      }
    ]
  }
];

export default mockMessageStream;
