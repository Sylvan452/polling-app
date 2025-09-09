'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Poll, getPollById } from '../../lib/mockData';
import VoteForm from '../../components/VoteForm';

interface PollPageProps {
  params: { id: string };
}

export default function PollPage({ params }: PollPageProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPoll = async () => {
      try {
        const pollData = getPollById(params.id);

        if (!pollData) {
          notFound();
          return;
        }

        if (isMounted) {
          setPoll(pollData);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load poll. Please try again later.');
        }
        console.error('Poll load error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPoll();
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleVote = (optionId: string): void => {
    if (!poll) return;

    const updatedPoll: Poll = {
      ...poll,
      options: poll.options.map((option) =>
        option.id === optionId
          ? { ...option, votes: option.votes + 1 }
          : option,
      ),
      totalVotes: poll.totalVotes + 1,
    };

    setPoll(updatedPoll);
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} />;
  if (!poll) return notFound();

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {poll.question}
          </h1>
          <p className="text-gray-600">
            Created on{' '}
            {poll.createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </header>

        {/* Vote Form */}
        <VoteForm poll={poll} onVote={handleVote} />

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            href="/polls"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <BackIcon />
            Back to all polls
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Reusable Components ---------------- */

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded mt-6"></div>
        </div>
      </div>
    </div>
  );
}
