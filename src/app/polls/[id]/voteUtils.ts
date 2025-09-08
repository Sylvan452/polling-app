// src/app/polls/[id]/voteHandler-before.ts
export type PollOption = { id: string; label: string; votes: number };

/**
 * Mutative and not optimized example
 * This shows a common pattern to replace.
 */
export function tallyVoteBefore(
  options: PollOption[],
  optionId: string,
): PollOption[] {
  // naive loop that mutates original array
  for (let i = 0; i < options.length; i++) {
    if (options[i].id === optionId) {
      options[i].votes = options[i].votes + 1;
      return options;
    }
  }
  throw new Error('Invalid option id');
}
