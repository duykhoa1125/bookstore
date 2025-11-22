import prisma from "../../config/database";

export class AuthorService {
  async create(data: { name: string }) {
    return await prisma.author.create({ data });
  }

  async findAll() {
    return await prisma.author.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string) {
    const author = await prisma.author.findUnique({
      where: { id },
      include: { books: { include: { book: true } } },
    });
    if (!author) throw new Error("Author not found");
    return author;
  }

  async update(id: string, data: { name: string }) {
    return await prisma.author.update({ where: { id }, data });
  }

  async delete(id: string) {
    const author = await prisma.author.findUnique({ where: { id } });
    if (!author) {
      throw new Error("Author not found");
    }

    const bookCount = await prisma.bookAuthor.count({
      where: { authorId: id },
    });

    if (bookCount > 0) {
      throw new Error(
        `Cannot delete author because they have ${bookCount} book(s) associated with them. Please reassign or delete the books first.`
      );
    }

    await prisma.author.delete({ where: { id } });
    return { message: "Author deleted successfully" };
  }
}
