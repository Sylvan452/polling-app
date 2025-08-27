import { Poll, PollOption } from '@/app/types';
import { createServerSupabaseClient } from './server';

/**
 * Server-side poll functions
 */
export const serverPoll = {
  /**
   * Get a poll by ID (server-side)
   */
  getPollById: async (id: number): Promise<Poll | null> => {
    const supabase = await createServerSupabaseClient();

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
      id: option.id,
      text: option.text,
      votes: option.votes,
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
};