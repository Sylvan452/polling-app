export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: Date;
  totalVotes: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export const mockPolls: Poll[] = [
  {
    id: "1",
    question: "What's your favorite programming language?",
    options: [
      { id: "1a", text: "JavaScript", votes: 45 },
      { id: "1b", text: "Python", votes: 38 },
      { id: "1c", text: "TypeScript", votes: 32 },
      { id: "1d", text: "Go", votes: 15 }
    ],
    createdAt: new Date("2024-01-15"),
    totalVotes: 130
  },
  {
    id: "2",
    question: "Which frontend framework do you prefer?",
    options: [
      { id: "2a", text: "React", votes: 67 },
      { id: "2b", text: "Vue.js", votes: 23 },
      { id: "2c", text: "Angular", votes: 18 },
      { id: "2d", text: "Svelte", votes: 12 }
    ],
    createdAt: new Date("2024-01-20"),
    totalVotes: 120
  },
  {
    id: "3",
    question: "What's your favourite database tool?",
    options: [
      { id: "3a", text: "PostgreSQL", votes: 42 },
      { id: "3b", text: "MongoDB", votes: 35 },
      { id: "3c", text: "MySQL", votes: 28 },
      { id: "3d", text: "Redis", votes: 22 },
      { id: "3e", text: "SQLite", votes: 18 }
    ],
    createdAt: new Date("2024-01-25"),
    totalVotes: 145
  }
];

export function getPollById(id: string): Poll | null {
  return mockPolls.find(poll => poll.id === id) || null;
}

export function getAllPolls(): Poll[] {
  return mockPolls;
}

/**
 * Pure and immutable function to tally a vote for a specific option
 * Returns a new array of options with the vote count updated
 * @param options - Array of poll options
 * @param optionId - ID of the option to vote for
 * @returns New array with updated vote count, or original array if option not found
 */
export function tallyVote(options: PollOption[], optionId: string): PollOption[] {
  return options.map(option => 
    option.id === optionId 
      ? { ...option, votes: option.votes + 1 }
      : option
  );
}