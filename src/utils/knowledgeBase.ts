import { workLogsApi } from '@/services/api';
import type { IssueSuggestionDto, CauseSuggestionDto } from '@/types/data';

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    return new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        resolve(func(...args));
      }, wait);
    });
  };
}

/**
 * Search issues by text using API
 * GET /api/issues/suggestions
 */
export async function searchIssues(query: string): Promise<IssueSuggestionDto[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const results = await workLogsApi.getIssueSuggestions(query);
    return results.slice(0, 10); // Limit to top 10 results
  } catch (error) {
    console.error('Error searching issues:', error);
    return [];
  }
}

// Debounced search
export const searchIssuesDebounced = debounce(searchIssues, 300);

/**
 * Get causes for a specific issue using API
 * GET /api/causes/suggestions?issId={issueId}
 */
export async function getCausesForIssue(issueId: number): Promise<CauseSuggestionDto[]> {
  try {
    const results = await workLogsApi.getCauseSuggestions(issueId);
    return results;
  } catch (error) {
    console.error('Error fetching causes for issue:', error);
    return [];
  }
}

/**
 * Search causes by text using API
 * GET /api/causes/suggestions?search={query}&issId={issueId}
 */
export async function searchCauses(query: string, issueId?: number): Promise<CauseSuggestionDto[]> {
  try {
    const results = await workLogsApi.getCauseSuggestions(issueId, query);
    return results.slice(0, 10);
  } catch (error) {
    console.error('Error searching causes:', error);
    return [];
  }
}

// Debounced search for causes
export const searchCausesDebounced = debounce(searchCauses, 300);

/**
 * Find exact issue match
 */
export async function findExactIssueMatch(text: string): Promise<IssueSuggestionDto | null> {
  const lowerText = text.toLowerCase().trim();

  try {
    const results = await searchIssues(text);
    const exactMatch = results.find(
      issue => issue.name.toLowerCase() === lowerText
    );
    return exactMatch || null;
  } catch (error) {
    console.error('Error finding exact issue match:', error);
    return null;
  }
}

/**
 * Find exact cause match
 */
export async function findExactCauseMatch(text: string, issueId?: number): Promise<CauseSuggestionDto | null> {
  const lowerText = text.toLowerCase().trim();

  try {
    const results = await searchCauses(text, issueId);
    const exactMatch = results.find(
      cause => cause.name.toLowerCase() === lowerText
    );
    return exactMatch || null;
  } catch (error) {
    console.error('Error finding exact cause match:', error);
    return null;
  }
}

// Note: recordIssueUsage and recordCauseUsage are handled automatically by the API
// when creating/updating IssueLogs with linked KB items
