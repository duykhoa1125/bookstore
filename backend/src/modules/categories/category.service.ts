import prisma from "../../config/database";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.dto";

export class CategoryService {
  async create(data: CreateCategoryInput) {
    const category = await prisma.category.create({
      data,
      include: { parentCategory: true },
    });
    return category;
  }

  async findAll() {
    const categories = await prisma.category.findMany({
      include: {
        parentCategory: true,
        subCategories: true,
        _count: { select: { books: true } },
      },
      orderBy: { name: "asc" },
    });
    return categories;
  }

  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parentCategory: true,
        subCategories: true,
        books: { include: { publisher: true } },
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  async update(id: string, data: UpdateCategoryInput) {
    const category = await prisma.category.update({
      where: { id },
      data,
      include: { parentCategory: true, subCategories: true },
    });
    return category;
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new Error("Category not found");
    }

    const bookCount = await prisma.book.count({
      where: { categoryId: id },
    });

    if (bookCount > 0) {
      throw new Error(
        `Cannot delete category because it has ${bookCount} book(s) associated with it. Please reassign or delete the books first.`
      );
    }

    const subCategoryCount = await prisma.category.count({
      where: { parentCategoryId: id },
    });

    if (subCategoryCount > 0) {
      throw new Error(
        `Cannot delete category because it has ${subCategoryCount} subcategory(ies). Please reassign or delete the subcategories first.`
      );
    }

    await prisma.category.delete({ where: { id } });
    return { message: "Category deleted successfully" };
  }
}
