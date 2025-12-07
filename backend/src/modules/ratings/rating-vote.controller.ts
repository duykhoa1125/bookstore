import { Request, Response } from 'express';
import { RatingVoteService } from './rating-vote.service';
import { VoteRatingDto } from './rating-vote.dto';
import { ResponseUtil } from '../../utils/response.util';

const ratingVoteService = new RatingVoteService();

export class RatingVoteController {
    /**
     * POST /api/ratings/:id/vote
     * Vote on a rating
     */
    voteRating = async (req: Request, res: Response) => {
        try {
            const userId = req.user!.id;
            const ratingId = req.params.id;

            const parsed = VoteRatingDto.safeParse(req.body);

            if (!parsed.success) {
                return ResponseUtil.error(res, 'Validation failed', {
                    statusCode: 400,
                    errors: parsed.error.errors,
                });
            }

            const result = await ratingVoteService.voteRating(
                userId,
                ratingId,
                parsed.data.voteType
            );

            return ResponseUtil.success(res, result);
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    };

    /**
     * DELETE /api/ratings/:id/vote
     * Remove vote on a rating
     */
    removeVote = async (req: Request, res: Response) => {
        try {
            const userId = req.user!.id;
            const ratingId = req.params.id;

            const result = await ratingVoteService.removeVote(userId, ratingId);

            return ResponseUtil.success(res, result);
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    };

    /**
     * GET /api/ratings/:id/vote
     * Get user's vote on a rating
     */
    getUserVote = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            const ratingId = req.params.id;

            if (!userId) {
                return ResponseUtil.success(res, { voteType: null });
            }

            const voteType = await ratingVoteService.getUserVote(userId, ratingId);

            return ResponseUtil.success(res, { voteType });
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    };
}
