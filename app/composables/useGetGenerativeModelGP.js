import {useGenAi} from './useGenAi.js'
import {SchemaType} from "@google/generative-ai";

export const useGetGenerativeModelGP = async (prompt) => {
    const schema = {
        type: SchemaType.ARRAY,
        items: {
            type: SchemaType.OBJECT,
            properties: {
                id: {
                    type: SchemaType.STRING,
                    description: "Question Number",
                    nullable: false,
                },
                title: {
                    type: SchemaType.STRING,
                    description: "Question",
                    nullable: false,
                },
                options: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.STRING,
                      description: "Question option"
                    },
                    description: "Question options",
                    nullable: false,
                },
                correctAnswer: {
                    type: SchemaType.STRING,
                    description: "Correct answer of question",
                    nullable: false,
                },
                explanation: {
                    type: SchemaType.STRING,
                    description: "Detailed steps to achieve the correct answer",
                    nullable: false,
                }
            },
            required: ["id", "title", "options", "correctAnswer"],
        },
    };
    const model = await useGenAi('gemini-1.5-flash', schema);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log(JSON.parse(response.text()));
    return JSON.parse(response.text());
}
