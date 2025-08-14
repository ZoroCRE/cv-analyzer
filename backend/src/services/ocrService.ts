import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { recognize } from 'tesseract.js';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

/**
 * Extracts text from a file based on its extension.
 * Supports PDF, DOCX, and common image formats.
 * @param localPath The local path to the file.
 * @returns The extracted raw text.
 */
export async function extractTextFromFile(localPath: string): Promise<string> {
    const extension = path.extname(localPath).toLowerCase();
    logger.info(`Extracting text from file: ${localPath} (type: ${extension})`);

    try {
        const fileBuffer = await fs.readFile(localPath);

        switch (extension) {
            case '.pdf':
                const pdfData = await pdf(fileBuffer);
                return pdfData.text;

            case '.docx':
                const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
                return docxResult.value;

            case '.png':
            case '.jpg':
            case '.jpeg':
            case '.bmp':
            case '.webp':
                const { data: { text } } = await recognize(fileBuffer, 'eng', { logger: m => logger.debug(m) });
                return text;

            default:
                logger.warn(`Unsupported file type for OCR: ${extension}`);
                throw new Error(`Unsupported file type: ${extension}`);
        }
    } catch (error) {
        logger.error(`Error during text extraction for ${localPath}:`, error);
        throw new Error(`Failed to extract text from file.`);
    }
}