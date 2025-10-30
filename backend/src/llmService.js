/**
 * LLM Service
 * Handles OpenAI API and compatible APIs (MiniMax, etc.) interactions
 */

import OpenAI from 'openai';

/**
 * Create OpenAI-compatible client
 * @param {string} apiKey - API key or JWT token
 * @param {string} baseURL - Custom API base URL (optional)
 * @returns {OpenAI} OpenAI client instance
 */
function createClient(apiKey, baseURL = null) {
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  const config = {
    apiKey: apiKey
  };
  
  // Support custom API endpoints (like MiniMax)
  if (baseURL) {
    config.baseURL = baseURL;
  }
  
  return new OpenAI(config);
}

/**
 * Call OpenAI-compatible API with a prompt
 * @param {string} apiKey - API key or JWT token
 * @param {string} systemMessage - System message for the assistant
 * @param {string} userPrompt - User prompt
 * @param {string} model - Model to use (default: gpt-4-turbo-preview)
 * @param {string} baseURL - Custom API base URL (optional)
 * @returns {Promise<string>} API response content
 */
export async function callLLM(apiKey, systemMessage, userPrompt, model = 'gpt-4-turbo-preview', baseURL = null) {
  const client = createClient(apiKey, baseURL);
  
  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent JSON output
      max_tokens: 8000  // Increased to avoid truncation of JSON responses
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('LLM API Error:', error);
    throw new Error(`LLM API call failed: ${error.message}`);
  }
}

/**
 * Parse JSON response from LLM
 * @param {string} response - LLM response
 * @returns {object} Parsed JSON object
 */
export function parseJSONResponse(response) {
  if (!response || typeof response !== 'string') {
    throw new Error('Invalid response: must be a non-empty string');
  }

  try {
    let jsonStr = response;
    
    // Step 1: Remove <think> tags (MiniMax thinking process)
    // Handle both complete and incomplete think tags
    jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // Remove incomplete opening think tags
    if (jsonStr.includes('<think>')) {
      const thinkIndex = jsonStr.indexOf('<think>');
      const afterThink = jsonStr.substring(thinkIndex);
      const nextJsonStart = Math.max(
        afterThink.indexOf('{'),
        afterThink.indexOf('[')
      );
      if (nextJsonStart > 0) {
        jsonStr = jsonStr.substring(0, thinkIndex) + afterThink.substring(nextJsonStart);
      } else {
        // No JSON found after think tag, remove everything from think onwards
        jsonStr = jsonStr.substring(0, thinkIndex);
      }
    }
    
    // Step 2: Try to extract JSON from markdown code blocks if present
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    }
    
    // Step 3: Clean up any remaining whitespace and control characters
    jsonStr = jsonStr.trim();
    
    // Step 4: Try to extract JSON object/array if there's extra text
    // Look for the first { or [ and last } or ]
    const firstBrace = jsonStr.indexOf('{');
    const firstBracket = jsonStr.indexOf('[');
    const lastBrace = jsonStr.lastIndexOf('}');
    const lastBracket = jsonStr.lastIndexOf(']');
    
    let start = -1;
    let end = -1;
    
    if (firstBrace !== -1 && firstBracket !== -1) {
      start = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
      start = firstBrace;
    } else if (firstBracket !== -1) {
      start = firstBracket;
    }
    
    if (start !== -1) {
      // Determine which closing bracket to use
      if (jsonStr[start] === '{') {
        end = lastBrace;
      } else {
        end = lastBracket;
      }
      
      if (end !== -1 && end > start) {
        jsonStr = jsonStr.substring(start, end + 1);
      }
    }
    
    // Step 5: Final trim
    jsonStr = jsonStr.trim();
    
    if (!jsonStr) {
      throw new Error('No JSON content found in response');
    }
    
    // Step 6: Parse JSON
    return JSON.parse(jsonStr);
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ JSON Parse Error:', error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('📄 Full Response:');
    console.error(response);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Try to provide more helpful error message
    if (response.includes('<think>')) {
      throw new Error('Failed to parse LLM response as JSON. Response contains <think> tags which may indicate incomplete output. Try using a different model or increasing max_tokens.');
    }
    
    throw new Error(`Failed to parse LLM response as JSON: ${error.message}`);
  }
}

/**
 * Call LLM and parse JSON response with retry logic
 * @param {string} apiKey - API key or JWT token
 * @param {string} systemMessage - System message
 * @param {string} userPrompt - User prompt
 * @param {string} model - Model to use
 * @param {string} baseURL - Custom API base URL (optional)
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @returns {Promise<object>} Parsed JSON response
 */
export async function callLLMForJSON(apiKey, systemMessage, userPrompt, model = 'gpt-4-turbo-preview', baseURL = null, maxRetries = 3) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 LLM call attempt ${attempt}/${maxRetries}...`);
      
      const response = await callLLM(apiKey, systemMessage, userPrompt, model, baseURL);
      const parsed = parseJSONResponse(response);
      
      if (attempt > 1) {
        console.log(`✅ Success on attempt ${attempt}`);
      }
      
      return parsed;
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s, 6s...
        console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // All retries failed
  console.error(`💥 All ${maxRetries} attempts failed`);
  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

