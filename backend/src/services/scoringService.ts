import { logger } from '../utils/logger';

// --- Normalization & Helper Functions ---

/**
 * Normalizes a string token for comparison.
 * Lowercases, removes punctuation, and collapses whitespace.
 */
function normalizeToken(token: string): string {
    if (!token) return '';
    return token
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * A very simple fuzzy match check.
 * Checks if tokenB is a substring of tokenA.
 * A more robust solution might use Levenshtein distance, but this is a start.
 */
function fuzzyMatch(tokenA: string, tokenB: string): boolean {
    return normalizeToken(tokenA).includes(normalizeToken(tokenB));
}


// --- Scoring Functions ---

/**
 * Calculates the technical ATS score based on structural elements of the CV.
 * @param text The full extracted text of the CV.
 * @returns A score between 0 and 100.
 */
export function calculateTechnicalATSScore(text: string): number {
    let score = 0;
    const lowerText = text.toLowerCase();

    // +20 if contact info present (email + phone)
    const hasEmail = lowerText.match(/[\w.-]+@[\w.-]+\.\w+/);
    const hasPhone = lowerText.match(/(\+?\d{1,3})?[\s-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    if (hasEmail && hasPhone) {
        score += 20;
    }

    // +15 if clear experience section with dates
    if (lowerText.includes('experience') || lowerText.includes('work history') || lowerText.includes('employment')) {
        score += 15;
    }

    // +15 if education section present
    if (lowerText.includes('education') || lowerText.includes('academic')) {
        score += 15;
    }

    // +20 if skills section present
    if (lowerText.includes('skills') || lowerText.includes('technologies') || lowerText.includes('competencies')) {
        score += 20;
    }

    // +10 if achievements/metrics (numbers %, €, $, years) present
    if (text.match(/(\d+%|\$\d+|\€\d+|\d+\s?years)/)) {
        score += 10;
    }

    // +10 layout/readability heuristics (presence of bullet points)
    if (text.includes('•') || text.includes('* ') || text.includes('- ')) {
        score += 10;
    }

    // +10 presence of action verbs at start of lines (indicative of achievement-oriented bullets)
    const actionVerbs = ['managed', 'led', 'developed', 'created', 'implemented', 'increased', 'reduced', 'achieved'];
    if (actionVerbs.some(verb => lowerText.includes(verb))) {
        score += 10; // Simple check, could be improved.
    }
    
    logger.info(`Calculated Technical ATS Score: ${Math.min(100, score)}`);
    return Math.min(100, score); // Clamp score to 100
}


/**
 * Calculates the keyword match score.
 * @param normalizedCvTokens A list of normalized tokens from the CV (from AI or heuristic).
 * @param keywords The list of target keywords.
 * @returns A score between 0 and 100.
 */
export function calculateKeywordMatchScore(normalizedCvTokens: string[], keywords: string[]): number {
    if (keywords.length === 0) {
        logger.info("Keyword score is 0 because no keywords were provided.");
        return 0;
    }
    
    const uniqueKeywords = [...new Set(keywords.map(k => normalizeToken(k)))];
    let matchedKeywords = 0;
    const cvTextCorpus = normalizedCvTokens.join(' ');

    for (const keyword of uniqueKeywords) {
        if (fuzzyMatch(cvTextCorpus, keyword)) {
            matchedKeywords++;
        }
    }
    
    const score = Math.round((matchedKeywords / uniqueKeywords.length) * 100);
    logger.info(`Calculated Keyword Score: ${score} (${matchedKeywords}/${uniqueKeywords.length})`);
    return score;
}

/**
 * Calculates the final, weighted ATS score.
 * @param technicalScore The technical score.
 * @param keywordScore The keyword score.
 * @returns A weighted score between 0 and 100.
 */
export function calculateFinalATSScore(technicalScore: number, keywordScore: number): number {
    const weightTechnical = parseFloat(process.env.SCORE_WEIGHT_TECHNICAL || '0.4');
    const weightKeyword = parseFloat(process.env.SCORE_WEIGHT_KEYWORD || '0.6');
    
    const finalScore = Math.round((technicalScore * weightTechnical) + (keywordScore * weightKeyword));
    logger.info(`Calculated Final ATS Score: ${finalScore} (Weights T:${weightTechnical}, K:${weightKeyword})`);
    return finalScore;
}