// src/app/polls/[id]/voteHandler-after.ts
export type PollOption = { id: string; label: string; votes: number };

/**
 * Immutable vote tallying function that increments the vote count for a specific option.
 * 
 * @param options - Array of poll options to process
 * @param optionId - ID of the option to increment votes for
 * @returns New array with the specified option's vote count incremented by 1
 * @throws {Error} When optionId is not found in the options array
 * 
 * @example
 * ```typescript
 * const options = [{ id: '1', label: 'Yes', votes: 5 }];
 * const result = tallyVoteBefore(options, '1');
 * // result: [{ id: '1', label: 'Yes', votes: 6 }]
 * ```
 */
export function tallyVoteBefore(
  options: readonly PollOption[],
  optionId: string,
): PollOption[] {
  // Find target index first to minimize allocations
  const targetIndex = options.findIndex(option => option.id === optionId);
  
  if (targetIndex === -1) {
    throw new Error('Invalid option id');
  }
  
  // Create new array with single allocation, copying references where possible
  const result = new Array<PollOption>(options.length);
  
  for (let i = 0; i < options.length; i++) {
    if (i === targetIndex) {
      // Only create new object for the modified option
      // Ensure votes is a number and fallback to 0 if not (including NaN)
      const currentVotes = typeof options[i].votes === 'number' && !isNaN(options[i].votes) ? options[i].votes : 0;
      result[i] = {
        ...options[i],
        votes: currentVotes + 1
      };
    } else {
      // Reuse existing object reference for unchanged options
      result[i] = options[i];
    }
  }
  
  return result;
}