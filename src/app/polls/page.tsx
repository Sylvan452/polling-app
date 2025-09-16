'use client';

import Link from 'next/link';
import { getAllPolls } from '../lib/mockData';

export default function PollsPage() {
  const polls = getAllPolls();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Active Polls</h1>
          <p className="text-xl text-gray-600">
            Choose a poll below to cast your vote and see the results
          </p>
        </div>

        {/* Polls Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 max-w-3xl mx-auto">
          {polls.map((poll) => {
            const mostPopularOption = poll.options.reduce((prev, current) => 
              prev.votes > current.votes ? prev : current
            );
            const leadingPercentage = poll.totalVotes > 0 
              ? Math.round((mostPopularOption.votes / poll.totalVotes) * 100) 
              : 0;

            return (
              <Link
                key={poll.id}
                href={`/polls/${poll.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 hover:border-blue-300"
              >
                <div className="flex flex-col h-full">
                  {/* Poll Question */}
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {poll.question}
                  </h2>
                  
                  {/* Poll Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {poll.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {poll.totalVotes} votes
                    </span>
                  </div>
                  
                  {/* Leading Option Preview */}
                  <div className="flex-grow">
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Leading: {mostPopularOption.text}
                        </span>
                        <span className="text-sm text-gray-600">
                          {leadingPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${leadingPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Options Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {poll.options.length} options available
                    </span>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span className="text-sm mr-1">Vote now</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {polls.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No polls available</h3>
            <p className="text-gray-600">Check back later for new polls to participate in.</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Want to create your own poll?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create engaging polls, gather opinions, and see real-time results with our easy-to-use poll builder.
            </p>
            <Link
              href="/polls/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Get started here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}