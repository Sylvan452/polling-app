'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SupabaseExample() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'error'
  >('error');

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        setIsLoading(true);
        const supabase = createClientComponentClient();

        // Simple health check - just to verify connection works
        // In a real app, you would query actual tables
        const { data, error } = await supabase.from('polls').select('count');

        if (error) throw error;

        setConnectionStatus('connected');
      } catch (err) {
        console.error('Supabase connection error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to connect to Supabase',
        );
        setConnectionStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    checkSupabaseConnection();
  }, []);

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-2">Supabase Connection Status</h2>

      {isLoading ? (
        <p>Checking connection...</p>
      ) : connectionStatus === 'connected' ? (
        <div className="text-green-600 flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Connected to Supabase</span>
        </div>
      ) : (
        <div className="text-red-600">
          <p className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span>Failed to connect to Supabase</span>
          </p>
          {error && <p className="text-sm mt-1">{error}</p>}
          <div className="mt-2 text-sm">
            <p>Make sure you have:</p>
            <ol className="list-decimal ml-5 mt-1">
              <li>Created a Supabase project</li>
              <li>Added your Supabase URL and anon key to .env.local</li>
              <li>Created the necessary database tables</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
