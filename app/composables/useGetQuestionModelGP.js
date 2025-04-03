import {useGenAi} from './useGenAi.js'
import {SchemaType} from "@google/generative-ai";

export const useGetQuestionModelGP = async (prompt) => {
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
                explanation: {
                    type: SchemaType.STRING,
                    description: "Detailed steps to achieve the correct answer",
                    nullable: false,
                }
            },
            required: ["id", "title", "explanation"],
        },
    };
    const model = await useGenAi(schema);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}
