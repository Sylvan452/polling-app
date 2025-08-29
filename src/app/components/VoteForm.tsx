'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Poll, PollOption } from '../lib/mockData';

interface VoteFormProps {
  poll: Poll;
  onVote?: (optionId: string) => void;
}

interface FormData {
  selectedOption: string;
}

interface OptionListProps {
  options: PollOption[];
  register: any;
  isSubmitting: boolean;
}

function OptionList({ options, register, isSubmitting }: OptionListProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Choose an option</legend>
      {options.map((option) => (
        <label
          key={option.id}
          className={`flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer transition-colors ${
            isSubmitting 
              ? 'bg-gray-50 cursor-not-allowed opacity-60' 
              : 'hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            value={option.id}
            disabled={isSubmitting}
            {...register('selectedOption', {
              required: 'Please select an option before submitting'
            })}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
          />
          <span className="ml-3 text-gray-900 font-medium">
            {option.text}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

export default function VoteForm({ poll, onVote }: VoteFormProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [votedOptionLabel, setVotedOptionLabel] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>();
  
  const selectedOption = watch('selectedOption');
  const isSubmitDisabled = !selectedOption || isSubmitting;

  const onSubmit = async (data: FormData) => {
    // Prevent double submissions
    if (hasVoted || isSubmitting) return;
    
    // Find the selected option label
    const selectedOptionData = poll.options.find(option => option.id === data.selectedOption);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setVotedOptionId(data.selectedOption);
    setVotedOptionLabel(selectedOptionData?.text || '');
    setHasVoted(true);
    
    if (onVote) {
      onVote(data.selectedOption);
    }
  };



  if (hasVoted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Vote Submitted Successfully!</h2>
          <div className="bg-white border border-green-300 rounded-lg p-4 mb-4">
            <p className="text-green-700 font-medium">You voted for: <span className="font-bold">{votedOptionLabel}</span></p>
          </div>
          <p className="text-green-600">Results will be displayed here once the poll closes.</p>
        </div>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cast your vote</h2>
          
          <OptionList 
            options={poll.options} 
            register={register} 
            isSubmitting={isSubmitting} 
          />
          
          {errors.selectedOption && (
            <p className="mt-2 text-sm text-red-600">
              {errors.selectedOption.message}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
            isSubmitDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting…
            </span>
          ) : (
            'Submit Vote'
          )}
        </button>
      </form>
    </div>
  );
}