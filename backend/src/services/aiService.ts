import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiResponse, GeminiResponseSchema } from '../types';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const MAX_RETRIES = 2;

function buildPrompt(text: string, keywords: string[]): string {
    return `You are an expert HR Information Extraction system. Your task is to analyze the provided CV text and extract structured information.
Respond strictly with a JSON object. Do not include any commentary, markdown formatting, or any text outside of the JSON object.

The input consists of the raw text from a CV and a list of relevant keywords.
Input: {
  "text": "${text.replace(/"/g, '\\"')}",
  "keyword_list": ${JSON.stringify(keywords)}
}

Based on the input, return a JSON object with the following schema:
{
  "name": "Full Name or null if not found",
  "emails": ["email1@example.com", "email2@example.com"] or [],
  "phones": ["+1-555-123-4567"] or [],
  "skills": ["Normalized Skill 1", "Skill 2", ...],
  "experiences": [
    { "title": "Job Title", "company": "Company Name", "start_date":"YYYY-MM", "end_date":"YYYY-MM or Present", "description": "Key responsibilities and achievements..." }
  ],
  "educations": [
    { "institution":"University Name", "degree":"Degree Name", "start_date":"YYYY-MM", "end_date":"YYYY-MM" }
  ],
  "normalized_tokens": ["token1", "token2"],
  "notes": "Optional brief notes on data quality or missing sections."
}

Ensure all date fields are formatted as YYYY-MM or are null. For 'end_date', 'Present' is an acceptable value.
The 'normalized_tokens' should be a cleaned-up, lowercased list of important terms and technologies found in the text, useful for keyword matching.
`;
}


export async function analyzeCvWithAI(text: string, keywords: string[]): Promise<GeminiResponse> {
    const prompt = buildPrompt(text, keywords);

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
        try {
            logger.info(`Attempt ${attempt}: Calling Gemini API for CV analysis.`);
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Clean the response text to ensure it's valid JSON
            const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonResponse = JSON.parse(cleanedText);

            // Validate the response against the Zod schema
            const validationResult = GeminiResponseSchema.safeParse(jsonResponse);

            if (validationResult.success) {
                logger.info("Gemini response parsed and validated successfully.");
                return validationResult.data;
            } else {
                logger.warn("Gemini response failed Zod validation.", validationResult.error.issues);
                // Continue to retry if validation fails
                if (attempt > MAX_RETRIES) {
                    throw new ApiError(500, "AI service returned invalid data format after multiple retries.");
                }
            }

        } catch (error) {
            logger.error(`Error in Gemini API call on attempt ${attempt}:`, error);
            if (attempt > MAX_RETRIES) {
                throw new ApiError(500, `Failed to get valid response from AI service: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            // Exponential backoff
            const delay = 1000 * Math.pow(2, attempt -1);
            logger.info(`Retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    // This line should be unreachable, but it's here for type safety
    throw new ApiError(500, "AI analysis failed after all retries.");
}