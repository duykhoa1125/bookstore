import prisma from "../../config/database";
import { CreateRatingInput, UpdateRatingInput } from "./rating.dto";

export class RatingService {
  private async hasPurchased(userId: string, bookId: string) {
    const count = await prisma.orderItem.count({
      where: {
        bookId,
        order: {
          userId,
          status: { not: "CANCELLED" },
        },
      },
    });
    return count > 0;
  }

  async create(userId: string, data: CreateRatingInput) {
    const purchased = await this.hasPurchased(userId, data.bookId);
    if (!purchased) {
      throw new Error("You must purchase this book before reviewing it");
    }
    const rating = await prisma.rating.create({
      data: {
        userId,
        bookId: data.bookId,
        stars: data.stars,
        content: data.content,
      },
      include: {
        user: { select: { fullName: true } },
        book: { select: { title: true } },
      },
    });
    return rating;
  }

  async findByBook(bookId: string) {
    const ratings = await prisma.rating.findMany({
      where: { bookId },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    });

    return ratings;
  }

  async update(userId: string, ratingId: string, data: UpdateRatingInput) {
    const rating = await prisma.rating.findUnique({ where: { id: ratingId } });

    if (!rating || rating.userId !== userId) {
      throw new Error("Rating not found");
    }

    const purchased = await this.hasPurchased(userId, rating.bookId);
    if (!purchased) {
      throw new Error("You must purchase this book before updating the review");
    }

    const updated = await prisma.rating.update({
      where: { id: ratingId },
      data,
      include: {
        user: { select: { fullName: true } },
        book: { select: { title: true } },
      },
    });

    return updated;
  }

  async delete(userId: string, ratingId: string) {
    const rating = await prisma.rating.findUnique({ where: { id: ratingId } });

    if (!rating || rating.userId !== userId) {
      throw new Error("Rating not found");
    }

    await prisma.rating.delete({ where: { id: ratingId } });
    return { message: "Rating deleted successfully" };
  }

  async findByUser(userId: string) {
    const ratings = await prisma.rating.findMany({
      where: { userId },
      include: { book: { select: { title: true, imageUrl: true } } },
      orderBy: { createdAt: "desc" },
    });

    return ratings;
  }

  async getBookAverageRating(bookId: string) {
    const ratings = await prisma.rating.findMany({
      where: { bookId },
      select: { stars: true },
    });

    if (ratings.length === 0) {
      return { averageRating: 0, totalRatings: 0 };
    }

    const sum = ratings.reduce((acc, rating) => acc + rating.stars, 0);
    const averageRating = sum / ratings.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
    };
  }

  async getUserRatingForBook(userId: string, bookId: string) {
    const rating = await prisma.rating.findUnique({
      where: { userId_bookId: { userId, bookId } },
      include: {
        user: { select: { fullName: true } },
        book: { select: { title: true } },
      },
    });

    return rating;
  }

  // Admin only methods
  async findAll() {
    const ratings = await prisma.rating.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        book: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ratings;
  }

  async deleteByAdmin(ratingId: string) {
    const rating = await prisma.rating.findUnique({ where: { id: ratingId } });

    if (!rating) {
      throw new Error("Rating not found");
    }

    await prisma.rating.delete({ where: { id: ratingId } });
    return { message: "Rating deleted successfully" };
  }
}
