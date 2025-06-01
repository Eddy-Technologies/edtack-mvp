import { Mistral } from '@mistralai/mistralai';
import { z } from 'zod';

const mistral = new Mistral({
  apiKey: '', // Replace with your API key
});
const QuestionSchema = z.object({
  id: z.number(),
  explanation: z.string(),
  title: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
});

// You can't directly infer types in JavaScript like in TypeScript,
// but you can use the schema for validation.

const QuizSchema = z.array(QuestionSchema);

export const useOpenRouterModelGP = async (prompt) => {
  // const OPENROUTER_API_KEY = "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";
  const chatResponse = await mistral.chat.parse({
    model: 'mistral-small-latest', // Use the desired Mistral model
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    responseFormat: QuizSchema,
  });
  // Wait for the JSON response
  const json = JSON.parse(chatResponse.choices[0].message.content);

  // Check if choices exist
  if (!json) {
    throw new Error('Unable to get json');
  }
  return json;
  /*
    //const jsonMatch = json.match(/```json\n([\s\S]*?)\n``/);
    if (jsonMatch && jsonMatch[1]) {
        try {
            return JSON.parse(jsonMatch[1]);
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }
     */
};
