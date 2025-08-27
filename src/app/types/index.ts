// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Poll related types
export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Poll {
  id: number;
  title: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
  createdBy?: string; // User ID
}

// Vote related types
export interface Vote {
  id: string;
  pollId: number;
  optionId: number;
  userId?: string; // Optional if anonymous voting is allowed
  createdAt: string;
}