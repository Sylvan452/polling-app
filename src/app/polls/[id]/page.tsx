'use client';

import { useState } from 'react';

// Mock data for a single poll
const mockPoll = {
  id: 1,
  title: 'Favorite Programming Language',
  options: [
    { id: 1, text: 'JavaScript', votes: 45 },
    { id: 2, text: 'Python', votes: 35 },
    { id: 3, text: 'Java', votes: 20 },
    { id: 4, text: 'C#', votes: 15 },
    { id: 5, text: 'Go', votes: 5 },
  ],
  totalVotes: 120,
  createdAt: '2023-08-15',
};

export default function PollPage({ params }: { params: { id: string } }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [poll, setPoll] = useState(mockPoll);

  // In a real app, you would fetch the poll data based on params.id
  // useEffect(() => {
  //   const fetchPoll = async () => {
  //     const response = await fetch(`/api/polls/${params.id}`);
  //     const data = await response.json();
  //     setPoll(data);
  //   };
  //   fetchPoll();
  // }, [params.id]);

  const handleVote = async () => {
    if (selectedOption === null) return;

    // In a real app, you would send the vote to the API
    // await fetch(`/api/polls/${params.id}/vote`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ optionId: selectedOption }),
    // });

    // For now, just update the UI
    const updatedOptions = poll.options.map(option => {
      if (option.id === selectedOption) {
        return { ...option, votes: option.votes + 1 };
      }
      return option;
    });

    setPoll({
      ...poll,
      options: updatedOptions,
      totalVotes: poll.totalVotes + 1,
    });

    setHasVoted(true);
  };

  const calculatePercentage = (votes: number) => {
    return Math.round((votes / poll.totalVotes) * 100) || 0;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">{poll.title}</h1>
      <p className="text-gray-500 mb-8">Created on {poll.createdAt} • {poll.totalVotes} votes</p>

      <div className="space-y-4">
        {poll.options.map((option) => (
          <div key={option.id} className="border rounded-lg p-4">
            <div className="flex items-center mb-2">
              {!hasVoted ? (
                <input
                  type="radio"
                  id={`option-${option.id}`}
                  name="poll-option"
                  className="mr-3"
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                />
              ) : null}
              <label 
                htmlFor={`option-${option.id}`}
                className={`flex-grow ${hasVoted ? 'font-medium' : ''}`}
              >
                {option.text}
              </label>
              {hasVoted && (
                <span className="text-gray-500">{calculatePercentage(option.votes)}%</span>
              )}
            </div>
            
            {hasVoted && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${calculatePercentage(option.votes)}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!hasVoted && (
        <button
          onClick={handleVote}
          disabled={selectedOption === null}
          className={`mt-6 px-4 py-2 rounded-md ${selectedOption === null ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          Submit Vote
        </button>
      )}
    </div>
  );
}