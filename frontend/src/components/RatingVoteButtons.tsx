import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface RatingVoteButtonsProps {
  ratingId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: 1 | -1 | null;
  disabled?: boolean;
}

export default function RatingVoteButtons({
  ratingId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  disabled = false,
}: RatingVoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (voteType: 1 | -1) => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    const previousVote = userVote;
    const previousUpvotes = upvotes;
    const previousDownvotes = downvotes;

    try {
      // Optimistic update
      if (userVote === voteType) {
        // Toggling off
        setUserVote(null);
        if (voteType === 1) {
          setUpvotes(upvotes - 1);
        } else {
          setDownvotes(downvotes - 1);
        }
      } else {
        // Changing vote or new vote
        if (previousVote === 1) setUpvotes(upvotes - 1);
        if (previousVote === -1) setDownvotes(downvotes - 1);

        if (voteType === 1) setUpvotes(upvotes + 1);
        if (voteType === -1) setDownvotes(downvotes + 1);

        setUserVote(voteType);
      }

      await api.voteRating(ratingId, voteType);
    } catch (error: any) {
      // Revert on error
      setUserVote(previousVote);
      setUpvotes(previousUpvotes);
      setDownvotes(previousDownvotes);
      
      const message = error.response?.data?.message || 'Failed to vote';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote(1)}
        disabled={disabled || isLoading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
          userVote === 1
            ? 'bg-green-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
        } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title="Helpful"
      >
        <ThumbsUp size={16} className={userVote === 1 ? 'fill-current' : ''} />
        <span className="text-sm font-medium">{upvotes}</span>
      </button>

      <button
        onClick={() => handleVote(-1)}
        disabled={disabled || isLoading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
          userVote === -1
            ? 'bg-red-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
        } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title="Not helpful"
      >
        <ThumbsDown size={16} className={userVote === -1 ? 'fill-current' : ''} />
        <span className="text-sm font-medium">{downvotes}</span>
      </button>
    </div>
  );
}
