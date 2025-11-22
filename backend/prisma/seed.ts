import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.rating.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data");

  // Create Users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@bookstore.com",
      password: hashedPassword,
      fullName: "Admin User",
      role: "ADMIN",
      position: "Store Manager",
      phone: "+1-555-1000",
      address: "789 Admin Blvd, San Francisco, CA",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      username: "john_doe",
      email: "john@example.com",
      password: hashedPassword,
      fullName: "John Doe",
      role: "USER",
      phone: "+1-555-1001",
      address: "123 Main St, New York, NY 10001",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "jane_smith",
      email: "jane@example.com",
      password: hashedPassword,
      fullName: "Jane Smith",
      role: "USER",
      phone: "+1-555-1002",
      address: "456 Oak Ave, Los Angeles, CA 90001",
    },
  });

  console.log("Created users");

  // Create Carts for users
  await prisma.cart.createMany({
    data: [{ userId: user1.id }, { userId: user2.id }],
  });

  console.log("Created carts");

  // Create Publishers
  const publishers = await Promise.all([
    prisma.publisher.create({ data: { name: "O'Reilly Media" } }),
    prisma.publisher.create({ data: { name: "Pearson" } }),
    prisma.publisher.create({ data: { name: "Manning Publications" } }),
    prisma.publisher.create({ data: { name: "Packt Publishing" } }),
    prisma.publisher.create({ data: { name: "Apress" } }),
    prisma.publisher.create({ data: { name: "No Starch Press" } }),
    prisma.publisher.create({ data: { name: "Addison-Wesley" } }),
    prisma.publisher.create({ data: { name: "Wiley" } }),
  ]);

  console.log("Created publishers");

  // Create Authors
  const authors = await Promise.all([
    prisma.author.create({ data: { name: "Robert C. Martin" } }),
    prisma.author.create({ data: { name: "Martin Fowler" } }),
    prisma.author.create({ data: { name: "Eric Evans" } }),
    prisma.author.create({ data: { name: "Kent Beck" } }),
    prisma.author.create({ data: { name: "Gang of Four" } }),
    prisma.author.create({ data: { name: "Andrew Hunt" } }),
    prisma.author.create({ data: { name: "David Thomas" } }),
    prisma.author.create({ data: { name: "Kyle Simpson" } }),
    prisma.author.create({ data: { name: "Douglas Crockford" } }),
    prisma.author.create({ data: { name: "Jon Duckett" } }),
    prisma.author.create({ data: { name: "Steve Krug" } }),
    prisma.author.create({ data: { name: "Don Norman" } }),
    prisma.author.create({ data: { name: "Marijn Haverbeke" } }),
    prisma.author.create({ data: { name: "Addy Osmani" } }),
    prisma.author.create({ data: { name: "Nicholas C. Zakas" } }),
  ]);

  console.log("Created authors");

  // Create Categories (with hierarchy)
  const techCategory = await prisma.category.create({
    data: {
      name: "Technology & Programming",
    },
  });

  const programmingCategory = await prisma.category.create({
    data: {
      name: "Programming",
      parentCategoryId: techCategory.id,
    },
  });

  const webDevCategory = await prisma.category.create({
    data: {
      name: "Web Development",
      parentCategoryId: programmingCategory.id,
    },
  });

  const softwareEngCategory = await prisma.category.create({
    data: {
      name: "Software Engineering",
      parentCategoryId: programmingCategory.id,
    },
  });

  const designCategory = await prisma.category.create({
    data: {
      name: "Design & UX",
    },
  });

  const databaseCategory = await prisma.category.create({
    data: {
      name: "Databases",
      parentCategoryId: techCategory.id,
    },
  });

  console.log("Created categories");

  // Create Books
  const booksData = [
    {
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      price: 42.99,
      stock: 50,
      description:
        "Even bad code can function. But if code is not clean, it can bring a development organization to its knees.",
      imageUrl:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
      publisherId: publishers[1].id,
      categoryId: softwareEngCategory.id,
      authorIds: [authors[0].id],
    },
    {
      title: "Refactoring: Improving the Design of Existing Code",
      price: 54.99,
      stock: 35,
      description:
        "Martin Fowler Refactoring defined core ideas and techniques that developers have used to improve their software.",
      imageUrl:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      publisherId: publishers[6].id,
      categoryId: softwareEngCategory.id,
      authorIds: [authors[1].id],
    },
    {
      title:
        "Domain-Driven Design: Tackling Complexity in the Heart of Software",
      price: 59.99,
      stock: 25,
      description:
        "Eric Evans has written a book that could change the way we think about software design.",
      imageUrl:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
      publisherId: publishers[6].id,
      categoryId: softwareEngCategory.id,
      authorIds: [authors[2].id],
    },
    {
      title: "Test Driven Development: By Example",
      price: 44.99,
      stock: 40,
      description:
        "Test-driven development is meant to eliminate fear in application development.",
      imageUrl:
        "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400",
      publisherId: publishers[6].id,
      categoryId: softwareEngCategory.id,
      authorIds: [authors[3].id],
    },
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      price: 64.99,
      stock: 30,
      description:
        "Four top-notch designers present a catalog of simple solutions to commonly occurring design problems.",
      imageUrl:
        "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400",
      publisherId: publishers[6].id,
      categoryId: softwareEngCategory.id,
      authorIds: [authors[4].id],
    },
    {
      title: "The Pragmatic Programmer: Your Journey To Mastery",
      price: 49.99,
      stock: 45,
      description:
        "The Pragmatic Programmer is one of those rare tech books you will read again over the years.",
      imageUrl:
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
      publisherId: publishers[6].id,
      categoryId: softwareEngCategory.id,
      authorIds: [authors[5].id, authors[6].id],
    },
    {
      title: "You Do Not Know JS Yet: Get Started",
      price: 29.99,
      stock: 60,
      description: "Learn the fundamentals of JavaScript the right way.",
      imageUrl:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
      publisherId: publishers[0].id,
      categoryId: webDevCategory.id,
      authorIds: [authors[7].id],
    },
    {
      title: "JavaScript: The Good Parts",
      price: 34.99,
      stock: 55,
      description:
        "JavaScript has more than its share of bad parts, having been developed in a hurry.",
      imageUrl:
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400",
      publisherId: publishers[0].id,
      categoryId: webDevCategory.id,
      authorIds: [authors[8].id],
    },
    {
      title: "HTML and CSS: Design and Build Websites",
      price: 39.99,
      stock: 70,
      description:
        "A full-color introduction to the basics of HTML and CSS from the publishers of Wrox.",
      imageUrl:
        "https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?w=400",
      publisherId: publishers[7].id,
      categoryId: webDevCategory.id,
      authorIds: [authors[9].id],
    },
    {
      title: "Do Not Make Me Think: A Common Sense Approach to Web Usability",
      price: 44.99,
      stock: 40,
      description:
        "Web designers and developers have relied on Steve Krug guide to understand intuitive navigation.",
      imageUrl:
        "https://images.unsplash.com/photo-1485988412941-77a35537dae4?w=400",
      publisherId: publishers[5].id,
      categoryId: designCategory.id,
      authorIds: [authors[10].id],
    },
    {
      title: "The Design of Everyday Things",
      price: 32.99,
      stock: 50,
      description:
        "Design does not have to be complicated. Usability is just as important as aesthetics.",
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      publisherId: publishers[7].id,
      categoryId: designCategory.id,
      authorIds: [authors[11].id],
    },
    {
      title: "Eloquent JavaScript: A Modern Introduction to Programming",
      price: 37.99,
      stock: 65,
      description:
        "JavaScript lies at the heart of almost every modern web application.",
      imageUrl:
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400",
      publisherId: publishers[5].id,
      categoryId: webDevCategory.id,
      authorIds: [authors[12].id],
    },
    {
      title: "Learning JavaScript Design Patterns",
      price: 41.99,
      stock: 45,
      description:
        "Learn how to write beautiful, structured, and maintainable JavaScript.",
      imageUrl:
        "https://images.unsplash.com/photo-1550439062-609e1531270e?w=400",
      publisherId: publishers[0].id,
      categoryId: webDevCategory.id,
      authorIds: [authors[13].id],
    },
    {
      title: "Maintainable JavaScript",
      price: 38.99,
      stock: 35,
      description:
        "Learn the theory and practice of writing maintainable JavaScript code.",
      imageUrl:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
      publisherId: publishers[0].id,
      categoryId: webDevCategory.id,
      authorIds: [authors[14].id],
    },
    {
      title: "SQL Performance Explained",
      price: 46.99,
      stock: 30,
      description: "Everything developers need to know about SQL performance.",
      imageUrl:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
      publisherId: publishers[4].id,
      categoryId: databaseCategory.id,
      authorIds: [authors[1].id],
    },
  ];

  for (const bookData of booksData) {
    const { authorIds, ...bookInfo } = bookData;
    await prisma.book.create({
      data: {
        ...bookInfo,
        authors: {
          create: authorIds.map((authorId) => ({
            author: { connect: { id: authorId } },
          })),
        },
      },
    });
  }

  console.log("Created books");

  // Create Payment Methods
  const paymentMethods = await Promise.all([
    prisma.paymentMethod.create({ data: { name: "Credit Card" } }),
    prisma.paymentMethod.create({ data: { name: "Debit Card" } }),
    prisma.paymentMethod.create({ data: { name: "PayPal" } }),
    prisma.paymentMethod.create({ data: { name: "Bank Transfer" } }),
    prisma.paymentMethod.create({ data: { name: "Cash on Delivery" } }),
  ]);

  console.log("Created payment methods");

  // Create some sample orders for user1
  const books = await prisma.book.findMany({ take: 3 });

  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      confirmedById: adminUser.id,
      shippingAddress: "123 Main St, New York, NY 10001",
      total: books[0].price * 2 + books[1].price,
      status: "DELIVERED",
      items: {
        create: [
          {
            bookId: books[0].id,
            quantity: 2,
            price: books[0].price,
          },
          {
            bookId: books[1].id,
            quantity: 1,
            price: books[1].price,
          },
        ],
      },
      payment: {
        create: {
          paymentMethodId: paymentMethods[0].id,
          total: books[0].price * 2 + books[1].price,
          status: "COMPLETED",
          paymentDate: new Date(),
        },
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: user1.id,
      confirmedById: adminUser.id,
      shippingAddress: "123 Main St, New York, NY 10001",
      total: books[2].price,
      status: "PROCESSING",
      items: {
        create: [
          {
            bookId: books[2].id,
            quantity: 1,
            price: books[2].price,
          },
        ],
      },
      payment: {
        create: {
          paymentMethodId: paymentMethods[2].id,
          total: books[2].price,
          status: "COMPLETED",
          paymentDate: new Date(),
        },
      },
    },
  });

  console.log("Created sample orders");

  // Create some ratings
  await prisma.rating.createMany({
    data: [
      {
        userId: user1.id,
        bookId: books[0].id,
        stars: 5,
        content: "Excellent book! Changed the way I write code.",
      },
      {
        userId: user2.id,
        bookId: books[0].id,
        stars: 4,
        content: "Very informative and practical.",
      },
      {
        userId: user1.id,
        bookId: books[1].id,
        stars: 5,
        content: "A must-read for any serious developer.",
      },
      {
        userId: user2.id,
        bookId: books[2].id,
        stars: 4,
        content: "Great insights into domain modeling.",
      },
    ],
  });

  console.log("Created ratings");

  // Add some items to user2's cart
  const user2Cart = await prisma.cart.findUnique({
    where: { userId: user2.id },
  });

  if (user2Cart) {
    await prisma.cartItem.createMany({
      data: [
        {
          cartId: user2Cart.id,
          bookId: books[0].id,
          quantity: 1,
        },
        {
          cartId: user2Cart.id,
          bookId: books[2].id,
          quantity: 2,
        },
      ],
    });

    await prisma.cart.update({
      where: { id: user2Cart.id },
      data: { total: books[0].price + books[2].price * 2 },
    });

    console.log("Added items to cart");
  }

  console.log("Seed completed successfully!");
  console.log("\nTest Credentials:");
  console.log("Admin: admin@bookstore.com / password123");
  console.log("User 1: john@example.com / password123");
  console.log("User 2: jane@example.com / password123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
