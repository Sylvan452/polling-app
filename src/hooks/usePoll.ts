'use client';

import { useEffect, useState } from 'react';
import { Poll } from '../types/poll';
import { getPollById } from '../lib/mockData';

interface PollParams {
  id: string;
}

export function usePoll(params: Promise<PollParams>) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPoll() {
      try {
        const resolvedParams = await params;
        const pollData = getPollById(resolvedParams.id);
        
        if (pollData) {
          setPoll(pollData);
        }
      } catch (err) {
        setError('Failed to load poll');
      } finally {
        setLoading(false);
      }
    }

    loadPoll();
  }, [params]);

  const handleVote = (optionId: string) => {
    if (!poll) return;
    
    const updatedPoll = {
      ...poll,
      options: poll.options.map(option => 
        option.id === optionId 
          ? { ...option, votes: option.votes + 1 }
          : option
      ),
      totalVotes: poll.totalVotes + 1
    };
    
    setPoll(updatedPoll);
  };

  return { poll, loading, error, handleVote };
}