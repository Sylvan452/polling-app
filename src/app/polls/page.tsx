import Link from 'next/link';

// Mock data for polls
const mockPolls = [
  { id: 1, title: 'Favorite Programming Language', votes: 120, createdAt: '2023-08-15' },
  { id: 2, title: 'Best Frontend Framework', votes: 85, createdAt: '2023-08-20' },
  { id: 3, title: 'Most Used Database', votes: 64, createdAt: '2023-08-25' },
];

export default function PollsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Polls</h1>
        <Link 
          href="/polls/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Poll
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPolls.map((poll) => (
          <Link key={poll.id} href={`/polls/${poll.id}`}>
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">{poll.title}</h2>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{poll.votes} votes</span>
                <span>Created: {poll.createdAt}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}