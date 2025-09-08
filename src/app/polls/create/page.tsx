'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { Poll } from '@/types/poll';


function CreatePollPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setError('A poll must have at least 2 options');
      return;
    }
    
    setError('');
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim()) {
      setError('Please enter a poll title');
      return;
    }
    
    if (options.filter(opt => opt.trim()).length < 2) {
      setError('Please provide at least 2 non-empty options');
      return;
    }
    
    // TODO: Implement poll creation logic
    console.log('Creating poll:', { title, options });
    
    // Redirect to polls page after creation
    router.push('/polls');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create a New Poll</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Poll Question
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What is your favorite programming language?"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Options
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Option ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addOption}
            className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            + Add Option
          </button>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Poll
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreatePollPageWrapper() {
  return (
    <ProtectedRoute>
      <CreatePollPage />
    </ProtectedRoute>
  );
}