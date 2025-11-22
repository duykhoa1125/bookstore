import prisma from "../../config/database";

export class PublisherService {
  async create(data: { name: string }) {
    return await prisma.publisher.create({ data });
  }

  async findAll() {
    return await prisma.publisher.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string) {
    const publisher = await prisma.publisher.findUnique({
      where: { id },
      include: { books: true },
    });
    if (!publisher) throw new Error("Publisher not found");
    return publisher;
  }

  async update(id: string, data: { name: string }) {
    return await prisma.publisher.update({ where: { id }, data });
  }

  async delete(id: string) {
    const publisher = await prisma.publisher.findUnique({ where: { id } });
    if (!publisher) {
      throw new Error("Publisher not found");
    }

    const bookCount = await prisma.book.count({
      where: { publisherId: id },
    });

    if (bookCount > 0) {
      throw new Error(
        `Cannot delete publisher because it has ${bookCount} book(s) associated with it. Please reassign or delete the books first.`
      );
    }

    await prisma.publisher.delete({ where: { id } });
    return { message: "Publisher deleted successfully" };
  }
}
