import { SchemaType } from '@google/generative-ai';
import { useGenAi } from '../utils/useGenAi.js';

const levels = ['Primary', 'Secondary', 'Junior College'];
const primaryLvls = [1, 2, 3, 4, 5, 6];
const secondaryLvls = [1, 2, 3, 4];
const jcLvls = [1, 2];
const primarySubjects = ['Math', 'Science', 'English'];
const secondarySubjects = ['Elementary Mathematics', 'Additional Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Social Studies'];
const jcSubjects = ['H1 Math', 'H2 Math', 'H1 Physics', 'H2 Physics', 'H1 Chemistry', 'H2 Chemistry', 'H1 Biology', 'H2 Biology', 'H1 General Paper', 'H1 History', 'H2 History', 'H1 Geography', 'H2 Geography', 'H1 Economics', 'H2 Economics'];

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body) {
    throw new Error('No body provided');
  }

  const numberInput = body.numberInput;
  const selectedLevel = body.selectedLevel;
  const selectedInnerLevel = body.selectedInnerLevel;
  const selectedTopic = body.selectedTopic;
  const selectedSubject = body.selectedSubject;
  if (!numberInput || !selectedLevel || !selectedInnerLevel || !selectedSubject) {
    throw new Error('Missing required parameters');
  }
  if (numberInput < 1 || numberInput > 10) {
    throw new Error('Number of questions must be between 1 and 10');
  }
  if (!levels.includes(selectedLevel)) {
    throw new Error('Invalid level selected');
  }
  if (selectedLevel === 'Primary' && !primaryLvls.includes(selectedInnerLevel)) {
    throw new Error('Invalid inner level for Primary');
  }
  if (selectedLevel === 'Secondary' && !secondaryLvls.includes(selectedInnerLevel)) {
    throw new Error('Invalid inner level for Secondary');
  }
  if (selectedLevel === 'Junior College' && !jcLvls.includes(selectedInnerLevel)) {
    throw new Error('Invalid inner level for Junior College');
  }
  if (selectedLevel === 'Primary' && !primarySubjects.includes(selectedSubject)) {
    throw new Error('Invalid subject for Primary');
  }
  if (selectedLevel === 'Secondary' && !secondarySubjects.includes(selectedSubject)) {
    throw new Error('Invalid subject for Secondary');
  }
  if (selectedLevel === 'Junior College' && !jcSubjects.includes(selectedSubject)) {
    throw new Error('Invalid subject for Junior College');
  }

  const questionPrompt = createPrompt(numberInput, selectedLevel, selectedInnerLevel, selectedSubject, selectedTopic);
  const result = await useGetQuestionModelGP(questionPrompt);
  const optionPrompt = `With this JSON result ${result},
    Copy the correct answer in the explanation and insert it into the options array.
    Ensure that the correct answer is based on the explanation.
    Ensure that the correct answer is also one of the options.
    Do not use $...$ delimiters for math equations.
    Always use Katex format $$...$$ as delimiters for all math and scientific equations for all questions.
    Always use Katex format $$...$$ as delimiters for all math and scientific equations for options.
    Ensure that there is no error in the question and the options.
    Ensure that there is only one correct answer for correctAnswer.
    Ensure that the correct answer is the value of the option and not using alphabets.
    Ensure that the response only contains the json schema`;
  const quiz = await useGetOptionModelGP(optionPrompt);
  if (quiz === null || quiz === undefined || quiz.length < 0) {
    throw new Error(`Exceeded limit ${questionPrompt} ${JSON.stringify(quiz)}`, quiz);
  }

  return {
    questionPrompt: questionPrompt,
    optionsPrompt: optionPrompt,
    questions: quiz
  };
});

const createPrompt = (numberInput: number, selectedLevel: string, selectedInnerLevel: number, selectedSubject: string, selectedTopic: string) => {
  return `From the Singapore syllabus, how would you as an examiner create ${numberInput} multiple choice questions
    of the ${selectedLevel} ${selectedInnerLevel} ${selectedSubject} ${selectedTopic} topic with varying difficulties.
    Provide a JSON of just what is declared in the schema, which is the question, explanation and the id without the question options.
    Generate questions of a mixture of topics and difficulties from the syllabus but do not include image related questions.
    Generate a fresh batch of questions that is different from the previous batch.
    Ensure there is no error in the question.
    Provide the most accurate and precise explanation to solve the question and then
    provide a concise summary on the steps to achieve the correct solution.
    Do not use $...$ delimiters for math equations.
    Always use Katex format $$...$$ as delimiters for all math equations.`;
};

export const useGetOptionModelGP = async (prompt: string) => {
  const schema = {
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        id: {
          type: SchemaType.STRING,
          description: 'Question Number',
          nullable: false,
        },
        title: {
          type: SchemaType.STRING,
          description: 'Question',
          nullable: false,
        },
        options: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
            description: 'Question option'
          },
          description: 'Question options with correct answer of question',
          nullable: false,
        },
        correctAnswer: {
          type: SchemaType.STRING,
          description: 'Correct answer of question',
          nullable: false,
        },
        explanation: {
          type: SchemaType.STRING,
          description: 'Detailed steps to achieve the correct answer',
          nullable: false,
        }
      },
      required: ['id', 'title', 'options', 'correctAnswer'],
    },
  };
  const model = await useGenAi(schema);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};

const useGetQuestionModelGP = async (prompt: string) => {
  const schema = {
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        id: {
          type: SchemaType.STRING,
          description: 'Question Number',
          nullable: false,
        },
        title: {
          type: SchemaType.STRING,
          description: 'Question',
          nullable: false,
        },
        explanation: {
          type: SchemaType.STRING,
          description: 'Detailed steps to achieve the correct answer',
          nullable: false,
        }
      },
      required: ['id', 'title', 'explanation'],
    },
  };
  const model = await useGenAi(schema);
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
};
