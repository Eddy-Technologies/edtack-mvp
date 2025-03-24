import {useGenAi} from './useGenAi.js'
import {SchemaType} from "@google/generative-ai";

export const useOpenRouterModelGP = async (prompt) => {
    const schema = {
        type: SchemaType.ARRAY,
        items: {
            type: SchemaType.OBJECT,
            properties: {
                id: {
                    name: "id",
                    type: SchemaType.STRING,
                    description: "Question Number",
                    nullable: false,
                },
                title: {
                    name: "title",
                    type: SchemaType.STRING,
                    description: "Question",
                    nullable: false,
                },
                options: {
                    name: "options",
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                        description: "Question option"
                    },
                    description: "Question options with correct answer of question",
                    nullable: false,
                },
                correctAnswer: {
                    name: "correctAnswer",
                    type: SchemaType.STRING,
                    description: "Correct answer of question",
                    nullable: false,
                },
                explanation: {
                    name: "explanation",
                    type: SchemaType.STRING,
                    description: "Detailed steps to achieve the correct answer",
                    nullable: false,
                }
            },
            required: ["id", "title", "options", "correctAnswer"],
        },
    };
    const OPENROUTER_API_KEY = "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";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "google/gemma-3-27b-it:free",
            "messages": [
                { "role": "user", "content": prompt }
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "question",
                    "strict": true,
                    "schema": schema
                }
            }
        })
    });

    // Wait for the JSON response
    const json = await response.json();

    // Check if choices exist
    if (!json.choices || json.choices.length === 0) {
        throw new Error("Invalid response format: 'choices' is missing.");
    }

    const content = json.choices[0].message.content;

    const jsonMatch = content.match(/```json\n([\s\S]*?)\n``/);
    if (jsonMatch && jsonMatch[1]) {
        try {
            return JSON.parse(jsonMatch[1]).questions;
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }

}

