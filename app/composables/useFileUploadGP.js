import { GoogleGenAI } from "@google/genai";
import { Buffer } from 'buffer';

export const useFileUploadGP = async (file) => {
    return new Promise((resolve, reject) => {
        const config = useRuntimeConfig()
        console.log(config.public);
        const ai = new GoogleGenAI({apiKey: config.public.NUXT_GOOGLE_AI_STUDIO_API_KEY});
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const base64Pdf = Buffer.from(event.target.result).toString("base64");

                const prompt = `Analyze the content of the following PDF syllabus and return a detailed JSON object with the syllabus topics for each primary level (P1 to P6).
         The JSON structure should be an object where each key is the primary level (e.g., "P1", "P2", etc.)
         and the value is an array of strings representing really detailed topics for that level.
         The PDF content is provided as base64 encoded data:${base64Pdf}`;

                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [{ text: prompt }],
                });

                const generatedText = response.text.substring(8,response.text.length-3);

                try {
                    resolve(JSON.parse(generatedText));
                } catch (error) {
                    console.error("Failed to parse JSON from Gemini:", error);
                    console.error("Raw response text:", generatedText);
                    resolve({ error: "Failed to parse JSON response from Gemini." });
                }

            } catch (error) {
                console.error("Error processing PDF:", error);
                resolve({ error: "Failed to process the PDF." });
            }
        };

        reader.onerror = () => {
            reject({ error: "Failed to read the PDF file." });
        };

        reader.readAsArrayBuffer(file);
    });
};
