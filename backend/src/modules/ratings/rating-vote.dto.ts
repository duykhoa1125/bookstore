import { z } from "zod";

export const VoteRatingDto = z.object({
    voteType: z.number().int().refine(val => val === 1 || val === -1, {
        message: "Vote type must be 1 (upvote) or -1 (downvote)"
    }),
});

export type VoteRatingInput = z.infer<typeof VoteRatingDto>;
