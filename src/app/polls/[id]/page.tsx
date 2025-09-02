'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Poll, getPollById } from '../../lib/mockData';
import VoteForm from '../../components/VoteForm';

interface PollPageProps {
  params: Promise<{ id: string }>;
}

export default function PollPage({ params }: PollPageProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPoll() {
      try {
        const resolvedParams = await params;
        const pollData = getPollById(resolvedParams.id);
        
        if (!pollData) {
          notFound();
          return;
        }
        
        setPoll(pollData);
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
    
    // Update the poll data with the new vote
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{poll.question}</h1>
          <p className="text-gray-600">
            Created on {poll.createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Vote Form */}
        <VoteForm poll={poll} onVote={handleVote} />

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link 
            href="/polls" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all polls
          </Link>
        </div>
      </div>
    </div>
  );
}