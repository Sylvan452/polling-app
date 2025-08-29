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
  }
];

export function getPollById(id: string): Poll | null {
  return mockPolls.find(poll => poll.id === id) || null;
}

export function getAllPolls(): Poll[] {
  return mockPolls;
}