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
    sortBy?: "price" | "rating";
    order?: "asc" | "desc";
  }) {
    const where: any = {};

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    // Tokenized multi-field search: each token must match at least one field
    if (params.search) {
      const raw = params.search.trim();
      if (raw.length > 0) {
        const tokens = Array.from(
          new Set(
            raw
              .split(/\s+/)
              .filter((t) => t.length > 0)
              .slice(0, 8) // safety cap to avoid huge queries
          )
        );
        if (tokens.length === 1) {
          const token = tokens[0];
          where.OR = [
            { title: { contains: token, mode: "insensitive" } },
            { description: { contains: token, mode: "insensitive" } },
            { publisher: { name: { contains: token, mode: "insensitive" } } },
            { category: { name: { contains: token, mode: "insensitive" } } },
            {
              authors: {
                some: {
                  author: { name: { contains: token, mode: "insensitive" } },
                },
              },
            },
          ];
        } else if (tokens.length > 1) {
          where.AND = tokens.map((token) => ({
            OR: [
              { title: { contains: token, mode: "insensitive" } },
              { description: { contains: token, mode: "insensitive" } },
              { publisher: { name: { contains: token, mode: "insensitive" } } },
              { category: { name: { contains: token, mode: "insensitive" } } },
              {
                authors: {
                  some: {
                    author: { name: { contains: token, mode: "insensitive" } },
                  },
                },
              },
            ],
          }));
        }
      }
    }

    // Determine base sorting for DB query. We can sort by price in DB; rating will be sorted in-memory after aggregation
    let orderBy: any = { createdAt: "desc" };
    if (params.sortBy === "price" && (params.order === "asc" || params.order === "desc")) {
      orderBy = { price: params.order };
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        publisher: true,
        category: true,
        authors: { include: { author: true } },
      },
      orderBy,
    });

    // Get average ratings using database aggregation for better performance
    const bookIds = books.map((book) => book.id);
    
    // Only fetch ratings if there are books
    let ratingsMap = new Map<string, number>();
    
    if (bookIds.length > 0) {
      const ratingsData = await prisma.$queryRaw<
        Array<{ bookId: string; averageRating: number }>
      >`
        SELECT "book_id" as "bookId",
               AVG(stars)::float as "averageRating"
        FROM "ratings"
        WHERE "book_id" = ANY(${bookIds})
        GROUP BY "book_id"
      `;

      // Create a map for quick lookup of averages
      ratingsMap = new Map(
        ratingsData.map((r) => [r.bookId, r.averageRating])
      );
    }

    // Attach averageRating to books
    let booksWithAvgRating = books.map((book) => ({
      ...book,
      averageRating: ratingsMap.get(book.id) || 0,
    }));

    // If sorting by rating, apply in-memory sort on computed averageRating
    if (params.sortBy === "rating") {
      const direction = params.order === "asc" ? 1 : -1; // default desc if invalid
      booksWithAvgRating = booksWithAvgRating.sort((a: any, b: any) => {
        const ar = (a.averageRating ?? 0) as number;
        const br = (b.averageRating ?? 0) as number;
        if (ar === br) return 0;
        return ar > br ? direction : -direction;
      });
    }

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
