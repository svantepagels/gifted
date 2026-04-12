/**
 * Safe JSON parsing utility with comprehensive error handling
 * 
 * Handles edge cases that cause "Unexpected end of JSON input":
 * - Empty response bodies
 * - Non-JSON responses (plain text, HTML errors)
 * - Malformed JSON
 * - Network timeout/incomplete responses
 */

export async function safeJsonParse<T>(
  response: Response,
  context: string
): Promise<T> {
  // 1. Check content-type header
  const contentType = response.headers.get('content-type');
  
  // Accept JSON or Reloadly's custom JSON content-type
  const isJsonResponse = contentType && 
    (contentType.includes('application/json') || 
     contentType.includes('application/com.reloadly.giftcards-v1+json'));
  
  if (!isJsonResponse) {
    const text = await response.text();
    console.error(`[${context}] Non-JSON response (${contentType}):`, text.substring(0, 200));
    
    // If response is HTML (likely an error page), extract text
    if (contentType?.includes('text/html')) {
      throw new Error('Server returned an error page instead of data');
    }
    
    throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
  }
  
  // 2. Read response body as text first
  const text = await response.text();
  
  // 3. Check for empty body (common cause of JSON parse errors)
  if (!text || text.trim().length === 0) {
    console.error(`[${context}] Empty response body from ${response.url}`);
    throw new Error('Server returned empty response');
  }
  
  // 4. Attempt JSON parsing with detailed error handling
  try {
    const parsed = JSON.parse(text) as T;
    return parsed;
  } catch (error) {
    console.error(`[${context}] JSON parse error:`, error);
    console.error(`[${context}] Response status: ${response.status}`);
    console.error(`[${context}] Response text (first 500 chars):`, text.substring(0, 500));
    
    // Provide helpful error message based on common issues
    if (text.startsWith('<')) {
      throw new Error('Server returned HTML instead of JSON data');
    }
    
    if (text.includes('<!DOCTYPE')) {
      throw new Error('Server error - received error page instead of data');
    }
    
    throw new Error(
      `Invalid JSON response: ${error instanceof Error ? error.message : 'Parse failed'}`
    );
  }
}

/**
 * Safe JSON parsing for fetch responses with optional fallback
 * Useful when you want to handle errors gracefully
 */
export async function tryJsonParse<T>(
  response: Response,
  context: string,
  fallback: T
): Promise<T> {
  try {
    return await safeJsonParse<T>(response, context);
  } catch (error) {
    console.warn(`[${context}] JSON parse failed, using fallback:`, error);
    return fallback;
  }
}
