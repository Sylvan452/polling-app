import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Poll, PollOption } from '@/app/types';

/**
 * Poll-related functions using Supabase
 */
export const supabasePoll = {
  /**
   * Get a poll by ID
   */
  getPollById: async (id: number): Promise<Poll | null> => {
    const supabase = createClientComponentClient();

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, title, created_at, created_by')
      .eq('id', id)
      .single();

    if (pollError) {
      console.error(`Error fetching poll ${id}:`, pollError.message);
      return null;
    }

    const { data: optionsData, error: optionsError } = await supabase
      .from('poll_options')
      .select('id, text, votes')
      .eq('poll_id', id);

    if (optionsError) {
      console.error(
        `Error fetching options for poll ${id}:`,
        optionsError.message,
      );
      return null;
    }

    const options: PollOption[] = optionsData.map((option) => ({
      id: option.id as number,
      text: option.text as string,
      votes: option.votes as number,
    }));

    const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);

    return {
      id: poll.id,
      title: poll.title,
      options,
      totalVotes,
      createdAt: poll.created_at,
      createdBy: poll.created_by,
    };
  },

  /**
   * Vote on a poll option
   */
  votePoll: async (
    pollId: number,
    optionId: number,
    userId?: string,
  ): Promise<boolean> => {
    const supabase = createClientComponentClient();

    // Insert vote record
    const { error: voteError } = await supabase.from('votes').insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId || null,
    });

    if (voteError) {
      console.error('Error recording vote:', voteError.message);
      return false;
    }

    // Increment the vote count for the option
    const { error: updateError } = await supabase.rpc('increment_vote', {
      option_id: optionId,
    });

    if (updateError) {
      console.error('Error incrementing vote count:', updateError.message);
      return false;
    }

    return true;
  },
};
