import { bench, describe } from 'vitest';
import { tallyVoteBefore as tallyVoteAfter } from '../voteHandler-after';
import { tallyVoteBefore } from '../voteHandler-before';
import type { PollOption } from '../voteHandler-after';

// Create test data with varying sizes
const createTestData = (size: number): PollOption[] => {
  return Array.from({ length: size }, (_, i) => ({
    id: `option-${i}`,
    label: `Option ${i}`,
    votes: Math.floor(Math.random() * 100)
  }));
};

// Test data sets
const smallData = createTestData(10);     // 10 options
const mediumData = createTestData(100);   // 100 options
const largeData = createTestData(1000);   // 1000 options

describe('tallyVote Performance Benchmarks', () => {
  describe('Small dataset (10 options)', () => {
    const targetId = 'option-5'; // middle option
    
    bench('tallyVoteBefore (mutative)', () => {
      // Create fresh copy for each iteration since it mutates
      const data = JSON.parse(JSON.stringify(smallData));
      tallyVoteBefore(data, targetId);
    });
    
    bench('tallyVoteAfter (immutable)', () => {
      tallyVoteAfter(smallData, targetId);
    });
  });
  
  describe('Medium dataset (100 options)', () => {
    const targetId = 'option-50'; // middle option
    
    bench('tallyVoteBefore (mutative)', () => {
      const data = JSON.parse(JSON.stringify(mediumData));
      tallyVoteBefore(data, targetId);
    });
    
    bench('tallyVoteAfter (immutable)', () => {
      tallyVoteAfter(mediumData, targetId);
    });
  });
  
  describe('Large dataset (1000 options)', () => {
    const targetId = 'option-500'; // middle option
    
    bench('tallyVoteBefore (mutative)', () => {
      const data = JSON.parse(JSON.stringify(largeData));
      tallyVoteBefore(data, targetId);
    });
    
    bench('tallyVoteAfter (immutable)', () => {
      tallyVoteAfter(largeData, targetId);
    });
  });
  
  describe('Best case scenario (first option)', () => {
    const targetId = 'option-0'; // first option
    
    bench('tallyVoteBefore (mutative) - first option', () => {
      const data = JSON.parse(JSON.stringify(mediumData));
      tallyVoteBefore(data, targetId);
    });
    
    bench('tallyVoteAfter (immutable) - first option', () => {
      tallyVoteAfter(mediumData, targetId);
    });
  });
  
  describe('Worst case scenario (last option)', () => {
    const targetId = 'option-99'; // last option
    
    bench('tallyVoteBefore (mutative) - last option', () => {
      const data = JSON.parse(JSON.stringify(mediumData));
      tallyVoteBefore(data, targetId);
    });
    
    bench('tallyVoteAfter (immutable) - last option', () => {
      tallyVoteAfter(mediumData, targetId);
    });
  });
  
  describe('Memory allocation patterns', () => {
    const targetId = 'option-25';
    
    bench('tallyVoteBefore with deep clone overhead', () => {
      // Simulate real-world usage where you need to clone to avoid mutation
      const data = JSON.parse(JSON.stringify(mediumData));
      tallyVoteBefore(data, targetId);
    });
    
    bench('tallyVoteAfter direct usage', () => {
      // Can use original data directly due to immutability
      tallyVoteAfter(mediumData, targetId);
    });
  });
});

// Additional benchmark for edge cases
describe('Edge case benchmarks', () => {
  const edgeCaseData: PollOption[] = [
    { id: '1', label: 'Option 1', votes: NaN as any },
    { id: '2', label: 'Option 2', votes: 'invalid' as any },
    { id: '3', label: 'Option 3', votes: null as any },
    { id: '4', label: 'Option 4', votes: undefined as any },
    { id: '5', label: 'Option 5', votes: 42 }
  ];
  
  bench('tallyVoteAfter with invalid vote values', () => {
    tallyVoteAfter(edgeCaseData, '1'); // NaN case
    tallyVoteAfter(edgeCaseData, '2'); // string case
    tallyVoteAfter(edgeCaseData, '3'); // null case
    tallyVoteAfter(edgeCaseData, '4'); // undefined case
    tallyVoteAfter(edgeCaseData, '5'); // valid case
  });
});