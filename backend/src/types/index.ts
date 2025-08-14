import { z } from 'zod';

// Zod schema for validating Gemini's JSON output
export const GeminiResponseSchema = z.object({
  name: z.string().nullable(),
  emails: z.array(z.string().email()),
  phones: z.array(z.string()),
  skills: z.array(z.string()),
  experiences: z.array(z.object({
    title: z.string().nullable(),
    company: z.string().nullable(),
    start_date: z.string().nullable(),
    end_date: z.string().nullable(),
    description: z.string().nullable(),
  })),
  educations: z.array(z.object({
    institution: z.string().nullable(),
    degree: z.string().nullable(),
    start_date: z.string().nullable(), // Changed from year to string to be more flexible
    end_date: z.string().nullable(),   // Changed from year to string
  })),
  normalized_tokens: z.array(z.string()),
  notes: z.string().optional().nullable(),
});

export type GeminiResponse = z.infer<typeof GeminiResponseSchema>;

// Type for the job payload in the queue
export interface ProcessCvJobPayload {
  cvId: number;
  userId: string;
  submissionId: number;
  storagePath: string;
  keywords: string[];
}