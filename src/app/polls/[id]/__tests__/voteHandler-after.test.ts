import { describe, it, expect } from 'vitest';
import { tallyVoteBefore, type PollOption } from '../voteHandler-after';

describe('tallyVoteBefore', () => {
  it('should increment votes correctly for valid option id (happy path)', () => {
    // Arrange
    const options: PollOption[] = [
      { id: '1', label: 'Option A', votes: 5 },
      { id: '2', label: 'Option B', votes: 3 },
      { id: '3', label: 'Option C', votes: 0 }
    ];
    const optionId = '2';

    // Act
    const result = tallyVoteBefore(options, optionId);

    // Assert
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ id: '1', label: 'Option A', votes: 5 });
    expect(result[1]).toEqual({ id: '2', label: 'Option B', votes: 4 }); // incremented
    expect(result[2]).toEqual({ id: '3', label: 'Option C', votes: 0 });
    
    // Verify immutability - original array should be unchanged
    expect(options[1].votes).toBe(3);
    
    // Verify object references are preserved for unchanged items
    expect(result[0]).toBe(options[0]);
    expect(result[2]).toBe(options[2]);
    expect(result[1]).not.toBe(options[1]); // modified item should be new object
  });

  it('should throw error for invalid option id', () => {
    // Arrange
    const options: PollOption[] = [
      { id: '1', label: 'Option A', votes: 5 },
      { id: '2', label: 'Option B', votes: 3 }
    ];
    const invalidOptionId = 'nonexistent';

    // Act & Assert
    expect(() => {
      tallyVoteBefore(options, invalidOptionId);
    }).toThrow('Invalid option id');
  });

  it('should handle non-number votes by falling back to 0', () => {
    // Arrange
    const options: PollOption[] = [
      { id: '1', label: 'Option A', votes: NaN as any },
      { id: '2', label: 'Option B', votes: 'invalid' as any },
      { id: '3', label: 'Option C', votes: null as any }
    ];

    // Act
    const result1 = tallyVoteBefore(options, '1');
    const result2 = tallyVoteBefore(options, '2');
    const result3 = tallyVoteBefore(options, '3');

    // Assert - all should fallback to 0 and increment to 1
    expect(result1[0].votes).toBe(1);
    expect(result2[1].votes).toBe(1);
    expect(result3[2].votes).toBe(1);
  });
});