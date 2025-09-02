import { describe, it, expect } from 'vitest';
import { getPollById, tallyVote, mockPolls, PollOption } from '../mockData';

describe('getPollById', () => {
  it('should return the correct poll when given a valid ID', () => {
    const poll = getPollById('1');
    
    expect(poll).toBeDefined();
    expect(poll?.id).toBe('1');
    expect(poll?.question).toBe("What's your favorite programming language?");
    expect(poll?.options).toHaveLength(4);
    expect(poll?.totalVotes).toBe(130);
  });

  it('should return the correct poll for ID "2"', () => {
    const poll = getPollById('2');
    
    expect(poll).toBeDefined();
    expect(poll?.id).toBe('2');
    expect(poll?.question).toBe('Which frontend framework do you prefer?');
    expect(poll?.options).toHaveLength(4);
    expect(poll?.totalVotes).toBe(120);
  });

  it('should return the correct poll for ID "3"', () => {
    const poll = getPollById('3');
    
    expect(poll).toBeDefined();
    expect(poll?.id).toBe('3');
    expect(poll?.question).toBe("What's your favourite database tool?");
    expect(poll?.options).toHaveLength(5);
    expect(poll?.totalVotes).toBe(145);
  });

  it('should return null when given an invalid ID', () => {
    const poll = getPollById('999');
    expect(poll).toBeNull();
  });

  it('should return null when given an empty string ID', () => {
    const poll = getPollById('');
    expect(poll).toBeNull();
  });

  it('should return null when given a non-existent ID', () => {
    const poll = getPollById('nonexistent');
    expect(poll).toBeNull();
  });

  it('should return null when given undefined as ID', () => {
    const poll = getPollById(undefined as any);
    expect(poll).toBeNull();
  });

  it('should return null when given null as ID', () => {
    const poll = getPollById(null as any);
    expect(poll).toBeNull();
  });

  it('should return the poll with correct structure and types', () => {
    const poll = getPollById('1');
    
    expect(poll).toBeDefined();
    expect(typeof poll?.id).toBe('string');
    expect(typeof poll?.question).toBe('string');
    expect(Array.isArray(poll?.options)).toBe(true);
    expect(poll?.createdAt).toBeInstanceOf(Date);
    expect(typeof poll?.totalVotes).toBe('number');
    
    // Check option structure
    poll?.options.forEach(option => {
      expect(typeof option.id).toBe('string');
      expect(typeof option.text).toBe('string');
      expect(typeof option.votes).toBe('number');
    });
  });
});

describe('tallyVote', () => {
  const sampleOptions: PollOption[] = [
    { id: '1a', text: 'Option A', votes: 10 },
    { id: '1b', text: 'Option B', votes: 5 },
    { id: '1c', text: 'Option C', votes: 8 }
  ];

  it('should increment vote count for the correct option', () => {
    const result = tallyVote(sampleOptions, '1a');
    
    expect(result).toHaveLength(3);
    expect(result[0].votes).toBe(11); // incremented from 10
    expect(result[1].votes).toBe(5);  // unchanged
    expect(result[2].votes).toBe(8);  // unchanged
  });

  it('should increment vote count for the middle option', () => {
    const result = tallyVote(sampleOptions, '1b');
    
    expect(result[0].votes).toBe(10); // unchanged
    expect(result[1].votes).toBe(6);  // incremented from 5
    expect(result[2].votes).toBe(8);  // unchanged
  });

  it('should increment vote count for the last option', () => {
    const result = tallyVote(sampleOptions, '1c');
    
    expect(result[0].votes).toBe(10); // unchanged
    expect(result[1].votes).toBe(5);  // unchanged
    expect(result[2].votes).toBe(9);  // incremented from 8
  });

  it('should return unchanged array when option ID is not found', () => {
    const result = tallyVote(sampleOptions, 'invalid-id');
    
    expect(result).toHaveLength(3);
    expect(result[0].votes).toBe(10); // unchanged
    expect(result[1].votes).toBe(5);  // unchanged
    expect(result[2].votes).toBe(8);  // unchanged
  });

  it('should not mutate the original array (immutability test)', () => {
    const originalOptions = [...sampleOptions];
    const result = tallyVote(sampleOptions, '1a');
    
    // Original array should be unchanged
    expect(sampleOptions[0].votes).toBe(10);
    expect(sampleOptions[1].votes).toBe(5);
    expect(sampleOptions[2].votes).toBe(8);
    
    // Result should be different
    expect(result[0].votes).toBe(11);
    expect(result).not.toBe(sampleOptions); // Different array reference
  });

  it('should handle empty array', () => {
    const result = tallyVote([], 'any-id');
    expect(result).toEqual([]);
  });

  it('should handle empty string option ID', () => {
    const result = tallyVote(sampleOptions, '');
    
    expect(result[0].votes).toBe(10); // unchanged
    expect(result[1].votes).toBe(5);  // unchanged
    expect(result[2].votes).toBe(8);  // unchanged
  });

  it('should handle null option ID', () => {
    const result = tallyVote(sampleOptions, null as any);
    
    expect(result[0].votes).toBe(10); // unchanged
    expect(result[1].votes).toBe(5);  // unchanged
    expect(result[2].votes).toBe(8);  // unchanged
  });

  it('should handle undefined option ID', () => {
    const result = tallyVote(sampleOptions, undefined as any);
    
    expect(result[0].votes).toBe(10); // unchanged
    expect(result[1].votes).toBe(5);  // unchanged
    expect(result[2].votes).toBe(8);  // unchanged
  });

  it('should work with real poll data', () => {
    const poll = mockPolls[0]; // First poll
    const originalVotes = poll.options[0].votes;
    
    const result = tallyVote(poll.options, poll.options[0].id);
    
    expect(result[0].votes).toBe(originalVotes + 1);
    expect(poll.options[0].votes).toBe(originalVotes); // Original unchanged
  });

  it('should preserve all option properties except votes', () => {
    const result = tallyVote(sampleOptions, '1a');
    
    expect(result[0].id).toBe('1a');
    expect(result[0].text).toBe('Option A');
    expect(result[0].votes).toBe(11);
    
    // Other options should be completely unchanged
    expect(result[1]).toEqual(sampleOptions[1]);
    expect(result[2]).toEqual(sampleOptions[2]);
  });
});