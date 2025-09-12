/**
 * Client-side API functions for poll operations
 */

import { getSessionToken } from '../supabase'

// Helper types
interface VoteRequest {
  option_id: number;
}

interface VoteResponse {
  id: number;
  user_id: number;
  option_id: number;
  created_at: string;
}

interface PollOption {
  optionId: string;
  label?: string;
  votes: number;
}

interface ApiError {
  error?: string;
  message?: string;
}

/**
 * Casts a vote for a specific option in a poll
 * 
 * @param pollId - The ID of the poll to vote on
 * @param optionId - The ID of the option to vote for
 * @returns Promise<VoteResponse> - The response from the server
 * @throws Error if the request fails or returns non-200 status
 */
export async function castVote(pollId: string, optionId: number): Promise<VoteResponse> {
  const url = `/api/polls/${pollId}/vote`;
  
  const requestBody: VoteRequest = {
    option_id: optionId
  };

  // Get authentication token
  const token = await getSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.ok) {
      return data as VoteResponse;
    }

    // Handle non-200 responses
    const errorData = data as ApiError;
    let errorMessage = errorData.error || errorData.message || response.statusText;
    
    // Include validation details for 400 errors
    if (response.status === 400 && (errorData as any)?.details) {
      errorMessage += ` - Details: ${JSON.stringify((errorData as any).details)}`;
    }
    
    throw new Error(`Failed to cast vote: ${errorMessage}`);
    
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to cast vote');
  }
}

/**
 * Retrieves poll results with normalized option data
 * 
 * @param pollId - The ID of the poll to get results for
 * @returns Promise<PollOption[]> - Array of normalized poll options with vote counts
 * @throws Error if both endpoints fail or return invalid data
 */
export async function getPollResults(pollId: string): Promise<PollOption[]> {
  // Try results endpoint first
  const resultsUrl = `/api/polls/${pollId}/results`;
  const pollUrl = `/api/polls/${pollId}`;

  // Get authentication token
  const token = await getSessionToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // First attempt: dedicated results endpoint
    const resultsResponse = await fetch(resultsUrl, {
      method: 'GET',
      headers,
      credentials: 'same-origin'
    });

    if (resultsResponse.ok) {
      const data = await resultsResponse.json();
      return normalizeResults(data);
    }
  } catch (error) {
    // Continue to fallback if results endpoint fails
  }

  try {
    // Fallback: general poll endpoint
    const pollResponse = await fetch(pollUrl, {
      method: 'GET',
      headers,
      credentials: 'same-origin'
    });

    if (pollResponse.ok) {
      const data = await pollResponse.json();
      return normalizeResults(data);
    }

    // Handle non-200 response from fallback
    const errorData = await pollResponse.json().catch(() => ({})) as ApiError;
    let errorMessage = errorData.error || errorData.message || pollResponse.statusText;
    
    // Include validation details for 400 errors
    if (pollResponse.status === 400 && (errorData as any)?.details) {
      errorMessage += ` - Details: ${JSON.stringify((errorData as any).details)}`;
    }
    
    throw new Error(`Failed to get poll results: ${errorMessage}`);
    
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get poll results');
  }
}

/**
 * Normalizes poll data to consistent PollOption format
 * 
 * @param data - Raw poll data from API
 * @returns PollOption[] - Normalized array of poll options
 */
function normalizeResults(data: any): PollOption[] {
  // Handle different possible response formats
  let options: any[] = [];
  
  if (Array.isArray(data)) {
    options = data;
  } else if (data.options && Array.isArray(data.options)) {
    options = data.options;
  } else if (data.poll && data.poll.options && Array.isArray(data.poll.options)) {
    options = data.poll.options;
  } else {
    // Provide more context about the unexpected shape
    const dataType = typeof data;
    const hasKeys = data && typeof data === 'object' ? Object.keys(data).join(', ') : 'none';
    throw new Error(`Invalid poll data format - Expected array or object with options property. Received ${dataType} with keys: ${hasKeys}`);
  }

  return options.map((option: any, index: number): PollOption => {
    // Defensive check for missing votes - coerce to 0
    const votes = option.votes ?? option.vote_count ?? 0;
    const normalizedVotes = Number(votes);
    
    return {
      optionId: option.id || option.optionId || option.option_id || '',
      label: option.text || option.label || option.name,
      votes: isNaN(normalizedVotes) ? 0 : normalizedVotes
    };
  });
}