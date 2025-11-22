import prisma from "../../config/database";
import { CreateBookInput, UpdateBookInput } from "./book.dto";

export class BookService {
  async create(data: CreateBookInput) {
    const { authorIds, ...bookData } = data;

    const book = await prisma.book.create({
      data: {
        ...bookData,
        authors: {
          create: authorIds.map((authorId) => ({
            author: { connect: { id: authorId } },
          })),
        },
      },
      include: {
        publisher: true,
        category: true,
        authors: { include: { author: true } },
      },
    });

    return book;
  }

  async findAll(params: {
    categoryId?: string;
    search?: string;
  }) {
    const where: any = {};

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.search) {
      where.title = { contains: params.search, mode: "insensitive" };
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        publisher: true,
        category: true,
        authors: { include: { author: true } },
        ratings: { select: { stars: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const booksWithAvgRating = books.map((book) => ({
      ...book,
      averageRating:
        book.ratings.length > 0
          ? book.ratings.reduce((sum, r) => sum + r.stars, 0) /
            book.ratings.length
          : 0,
    }));

    return booksWithAvgRating;
  }

  async findById(id: string) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        publisher: true,
        category: true,
        authors: { include: { author: true } },
        ratings: { include: { user: { select: { fullName: true } } } },
      },
    });

    if (!book) {
      throw new Error("Book not found");
    }

    const averageRating =
      book.ratings.length > 0
        ? book.ratings.reduce((sum, r) => sum + r.stars, 0) /
          book.ratings.length
        : 0;

    return { ...book, averageRating };
  }

  async update(id: string, data: UpdateBookInput) {
    const { authorIds, ...bookData } = data;

    const updateData: any = { ...bookData };

    if (authorIds) {
      updateData.authors = {
        deleteMany: {},
        create: authorIds.map((authorId) => ({
          author: { connect: { id: authorId } },
        })),
      };
    }

    const book = await prisma.book.update({
      where: { id },
      data: updateData,
      include: {
        publisher: true,
        category: true,
        authors: { include: { author: true } },
      },
    });

    return book;
  }

  async delete(id: string) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new Error("Book not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: { bookId: id },
      });
      const orderItemCount = await tx.orderItem.count({
        where: { bookId: id },
      });

      if (orderItemCount > 0) {
        throw new Error(
          "Cannot delete book because it exists in order history. Consider updating stock to 0 instead."
        );
      }
      await tx.book.delete({ where: { id } });
    });

    return { message: "Book deleted successfully" };
  }
}
