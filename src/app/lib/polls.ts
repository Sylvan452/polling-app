// This is a placeholder for poll-related functions
// In a real app, you would implement proper data fetching from an API or database

import { Poll, PollOption } from '../types';

// Mock polls for development
const mockPolls: Poll[] = [
  {
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
  },
  {
    id: 2,
    title: 'Best Frontend Framework',
    options: [
      { id: 1, text: 'React', votes: 40 },
      { id: 2, text: 'Vue', votes: 25 },
      { id: 3, text: 'Angular', votes: 15 },
      { id: 4, text: 'Svelte', votes: 5 },
    ],
    totalVotes: 85,
    createdAt: '2023-08-20',
  },
  {
    id: 3,
    title: 'Most Used Database',
    options: [
      { id: 1, text: 'PostgreSQL', votes: 25 },
      { id: 2, text: 'MySQL', votes: 20 },
      { id: 3, text: 'MongoDB', votes: 15 },
      { id: 4, text: 'SQLite', votes: 4 },
    ],
    totalVotes: 64,
    createdAt: '2023-08-25',
  },
];

export const getPolls = async (): Promise<Poll[]> => {
  // In a real app, you would fetch polls from an API or database
  return mockPolls;
};

export const getPollById = async (id: number): Promise<Poll | null> => {
  // In a real app, you would fetch a specific poll from an API or database
  const poll = mockPolls.find(p => p.id === id);
  return poll || null;
};

export const createPoll = async (title: string, options: string[]): Promise<Poll> => {
  // In a real app, you would create a new poll in the database
  const newPoll: Poll = {
    id: mockPolls.length + 1,
    title,
    options: options.map((text, index) => ({
      id: index + 1,
      text,
      votes: 0,
    })),
    totalVotes: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };
  
  return newPoll;
};

export const votePoll = async (pollId: number, optionId: number): Promise<Poll | null> => {
  // In a real app, you would update the poll in the database
  const poll = await getPollById(pollId);
  
  if (!poll) return null;
  
  const updatedOptions = poll.options.map(option => {
    if (option.id === optionId) {
      return { ...option, votes: option.votes + 1 };
    }
    return option;
  });
  
  const updatedPoll: Poll = {
    ...poll,
    options: updatedOptions,
    totalVotes: poll.totalVotes + 1,
  };
  
  return updatedPoll;
};