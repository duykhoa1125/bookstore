import prisma from '../../config/database';

export class RatingVoteService {
    /**
     * Vote on a rating (upvote or downvote)
     * If user has already voted, update the vote
     * If user votes the same way, remove the vote
     */
    async voteRating(userId: string, ratingId: string, voteType: number) {
        // Check if rating exists
        const rating = await prisma.rating.findUnique({
            where: { id: ratingId },
        });

        if (!rating) {
            throw new Error('Rating not found');
        }

        // Prevent users from voting on their own ratings
        if (rating.userId === userId) {
            throw new Error('You cannot vote on your own rating');
        }

        // Check if user has already voted
        const existingVote = await prisma.ratingVote.findUnique({
            where: {
                ratingId_userId: {
                    ratingId,
                    userId,
                },
            },
        });

        // If user votes the same way, remove the vote (toggle off)
        if (existingVote && existingVote.voteType === voteType) {
            await prisma.ratingVote.delete({
                where: {
                    id: existingVote.id,
                },
            });

            return { message: 'Vote removed successfully' };
        }

        // If user has voted differently, update the vote
        if (existingVote) {
            await prisma.ratingVote.update({
                where: {
                    id: existingVote.id,
                },
                data: {
                    voteType,
                },
            });

            return { message: 'Vote updated successfully' };
        }

        // Create new vote
        await prisma.ratingVote.create({
            data: {
                userId,
                ratingId,
                voteType,
            },
        });

        return { message: 'Vote created successfully' };
    }

    /**
     * Remove user's vote on a rating
     */
    async removeVote(userId: string, ratingId: string) {
        const vote = await prisma.ratingVote.findUnique({
            where: {
                ratingId_userId: {
                    ratingId,
                    userId,
                },
            },
        });

        if (!vote) {
            throw new Error('Vote not found');
        }

        await prisma.ratingVote.delete({
            where: {
                id: vote.id,
            },
        });

        return { message: 'Vote removed successfully' };
    }

    /**
     * Get user's vote on a specific rating
     */
    async getUserVote(userId: string, ratingId: string) {
        const vote = await prisma.ratingVote.findUnique({
            where: {
                ratingId_userId: {
                    ratingId,
                    userId,
                },
            },
        });

        return vote ? vote.voteType : null;
    }

    /**
     * Get vote counts for a rating
     */
    async getVoteCounts(ratingId: string) {
        const votes = await prisma.ratingVote.findMany({
            where: { ratingId },
        });

        const upvotes = votes.filter((vote) => vote.voteType === 1).length;
        const downvotes = votes.filter((vote) => vote.voteType === -1).length;

        return { upvotes, downvotes };
    }
}
