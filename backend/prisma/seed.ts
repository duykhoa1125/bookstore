import { PrismaClient, Role, OrderStatus, PaymentStatus } from '@prisma/client';
import { fakerVI as faker } from '@faker-js/faker'; // Sử dụng locale tiếng Việt
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Hash password cho seed
const SEED_PASSWORD = 'password123';
let hashedPassword: string;

// CẤU HÌNH SỐ LƯỢNG DỮ LIỆU MUỐN TẠO
const CONFIG = {
    NUM_USERS: 100,         // Số lượng user thường
    NUM_AUTHORS: 50,        // Số lượng tác giả
    NUM_PUBLISHERS: 20,     // Số lượng nhà xuất bản
    NUM_CATEGORIES: 15,     // Số danh mục cha
    NUM_BOOKS: 500,         // Số lượng sách
    NUM_ORDERS: 1000,       // Số lượng đơn hàng
    MAX_ITEMS_PER_ORDER: 5, // Tối đa sách trong 1 đơn
    NUM_RATINGS: 2000,      // Số lượng đánh giá
};

async function main() {
    console.log('🌱 Bắt đầu quá trình Seeding dữ liệu...');

    // Hash password một lần để dùng cho tất cả users
    hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    // 1. XÓA DỮ LIỆU CŨ (Clean up)
    // Thứ tự xóa quan trọng để tránh lỗi khóa ngoại
    console.log('🗑️ Đang dọn dẹp dữ liệu cũ...');
    await prisma.ratingVote.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.bookAuthor.deleteMany();
    await prisma.book.deleteMany();
    await prisma.category.deleteMany();
    await prisma.author.deleteMany();
    await prisma.publisher.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.paymentMethod.deleteMany();

    // 2. TẠO PAYMENT METHODS (Dữ liệu tĩnh)
    console.log('💳 Tạo phương thức thanh toán...');
    const paymentMethods = await Promise.all([
        prisma.paymentMethod.create({ data: { name: 'COD (Thanh toán khi nhận hàng)' } }),
        prisma.paymentMethod.create({ data: { name: 'VNPAY' } }),
        prisma.paymentMethod.create({ data: { name: 'MOMO' } }),
        prisma.paymentMethod.create({ data: { name: 'Thẻ tín dụng quốc tế' } }),
    ]);

    // 3. TẠO PUBLISHERS & AUTHORS
    console.log('📚 Tạo Nhà xuất bản và Tác giả...');
    await prisma.publisher.createMany({
        data: Array.from({ length: CONFIG.NUM_PUBLISHERS }).map((_, i) => ({
            name: faker.company.name() + ` Books ${i + 1}`,
        })),
    });
    const publishers = await prisma.publisher.findMany();

    await prisma.author.createMany({
        data: Array.from({ length: CONFIG.NUM_AUTHORS }).map((_, i) => ({
            name: faker.person.fullName() + ` (${i + 1})`,
        })),
    });
    const authors = await prisma.author.findMany();

    // 4. TẠO CATEGORIES (Cha và Con)
    console.log('🗂️ Tạo Danh mục...');
    const categories: any[] = [];

    // Tạo danh mục cha
    for (let i = 0; i < CONFIG.NUM_CATEGORIES; i++) {
        const parent = await prisma.category.create({
            data: { name: `${faker.commerce.department()} ${i + 1}` },
        });
        categories.push(parent);

        // Tạo danh mục con ngẫu nhiên (30% cơ hội có con)
        if (Math.random() > 0.7) {
            await prisma.category.create({
                data: {
                    name: `${faker.commerce.productAdjective()} ${parent.name}`,
                    parentCategoryId: parent.id,
                },
            });
        }
    }
    // Lấy lại tất cả category bao gồm cả con
    const allCategories = await prisma.category.findMany();

    // 5. TẠO USERS (Admin & Normal Users)
    console.log('busts👤 Tạo Users...');

    // Tạo 1 Admin cứng để test
    // Login: admin@bookstore.com / password123
    const adminUser = await prisma.user.create({
        data: {
            username: 'admin',
            email: 'admin@bookstore.com',
            password: hashedPassword,
            fullName: 'Administrator',
            role: Role.ADMIN,
            phone: '0909000111',
            address: 'Ho Chi Minh City, Vietnam',
        },
    });

    // Tạo User thường
    // Sử dụng createMany không được vì cần trả về ID để tạo Cart sau này, nên dùng loop
    const users = [];
    for (let i = 0; i < CONFIG.NUM_USERS; i++) {
        const user = await prisma.user.create({
            data: {
                username: faker.internet.username() + i, // unique
                email: faker.internet.email(),
                password: hashedPassword,
                fullName: faker.person.fullName(),
                role: Role.USER,
                phone: faker.phone.number(),
                address: faker.location.streetAddress(),
                avatar: faker.image.avatar(),
                // Random OAuth simulation
                googleId: Math.random() > 0.8 ? faker.string.uuid() : null,
            },
        });
        users.push(user);
    }
    const allUsers = [adminUser, ...users];

    // 6. TẠO BOOKS & BOOK AUTHORS
    console.log('📖 Tạo Sách và liên kết Tác giả...');
    const books = [];

    for (let i = 0; i < CONFIG.NUM_BOOKS; i++) {
        const randomPublisher = publishers[Math.floor(Math.random() * publishers.length)];
        const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];

        const book = await prisma.book.create({
            data: {
                title: faker.lorem.sentence(3),
                price: parseFloat(faker.commerce.price({ min: 50000, max: 500000 })),
                stock: faker.number.int({ min: 0, max: 100 }),
                description: faker.lorem.paragraph(),
                imageUrl: faker.image.url(),
                publisherId: randomPublisher.id,
                categoryId: randomCategory.id,
            },
        });

        // Link với 1-3 tác giả ngẫu nhiên
        const randomAuthors = faker.helpers.arrayElements(authors, faker.number.int({ min: 1, max: 3 }));
        await prisma.bookAuthor.createMany({
            data: randomAuthors.map(author => ({
                bookId: book.id,
                authorId: author.id,
            })),
        });

        books.push(book);
    }

    // 7. TẠO CART (Giỏ hàng)
    console.log('🛒 Tạo Giỏ hàng cho User...');
    for (const user of users) {
        // 50% user có giỏ hàng
        if (Math.random() > 0.5) {
            const cart = await prisma.cart.create({
                data: { userId: user.id, total: 0 },
            });

            // Thêm items vào cart
            const randomBooks = faker.helpers.arrayElements(books, faker.number.int({ min: 1, max: 3 }));
            let cartTotal = 0;

            for (const book of randomBooks) {
                const qty = faker.number.int({ min: 1, max: 2 });
                await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        bookId: book.id,
                        quantity: qty,
                    },
                });
                cartTotal += book.price * qty;
            }

            // Update lại total cho cart
            await prisma.cart.update({
                where: { id: cart.id },
                data: { total: cartTotal },
            });
        }
    }

    // 8. TẠO ORDERS & PAYMENTS (Phức tạp nhất)
    console.log('📦 Tạo Đơn hàng và Thanh toán...');
    for (let i = 0; i < CONFIG.NUM_ORDERS; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomBooks = faker.helpers.arrayElements(books, faker.number.int({ min: 1, max: CONFIG.MAX_ITEMS_PER_ORDER }));

        // Tính tổng tiền
        let orderTotal = 0;
        const orderItemsData = randomBooks.map(book => {
            const qty = faker.number.int({ min: 1, max: 3 });
            orderTotal += book.price * qty;
            return {
                bookId: book.id,
                quantity: qty,
                price: book.price // Giá tại thời điểm mua
            };
        });

        // Random trạng thái đơn hàng
        const statuses = Object.values(OrderStatus);
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // Nếu đã ship hoặc hoàn thành thì cần người confirm (Admin)
        let confirmedById = null;
        if (['SHIPPED', 'DELIVERED'].includes(status)) {
            confirmedById = adminUser.id;
        }

        const order = await prisma.order.create({
            data: {
                userId: randomUser.id,
                total: orderTotal,
                status: status,
                confirmedById: confirmedById,
                shippingAddress: randomUser.address || faker.location.streetAddress(),
                orderDate: faker.date.past(), // Đơn hàng trong quá khứ
                items: {
                    create: orderItemsData
                }
            }
        });

        // Tạo Payment nếu đơn hàng không bị hủy
        if (status !== 'CANCELLED') {
            let paymentStatus = PaymentStatus.PENDING;
            if (status === 'DELIVERED') paymentStatus = PaymentStatus.COMPLETED;
            if (status === 'PROCESSING') paymentStatus = Math.random() > 0.5 ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;

            const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

            await prisma.payment.create({
                data: {
                    orderId: order.id,
                    paymentMethodId: randomMethod.id,
                    status: paymentStatus,
                    total: orderTotal,
                    paymentDate: paymentStatus === 'COMPLETED' ? new Date() : null,
                }
            });
        }
    }

    // 9. TẠO RATINGS & VOTES
    console.log('⭐ Tạo Đánh giá và Bình chọn...');
    for (let i = 0; i < CONFIG.NUM_RATINGS; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomBook = books[Math.floor(Math.random() * books.length)];

        // Check unique constraint userId + bookId
        const existingRating = await prisma.rating.findUnique({
            where: { userId_bookId: { userId: randomUser.id, bookId: randomBook.id } }
        });

        if (!existingRating) {
            const rating = await prisma.rating.create({
                data: {
                    userId: randomUser.id,
                    bookId: randomBook.id,
                    stars: faker.number.int({ min: 1, max: 5 }),
                    content: faker.lorem.sentence(),
                }
            });

            // Tạo votes cho rating này (Like/Dislike)
            if (Math.random() > 0.5) {
                const anotherUser = users[Math.floor(Math.random() * users.length)];
                // Đảm bảo người vote không phải người viết review (logic thông thường)
                if (anotherUser.id !== randomUser.id) {
                    await prisma.ratingVote.create({
                        data: {
                            ratingId: rating.id,
                            userId: anotherUser.id,
                            voteType: Math.random() > 0.2 ? 1 : -1, // 80% là upvote
                        }
                    }).catch(() => { }); // Bỏ qua lỗi duplicate nếu random trùng user
                }
            }
        }
    }

    // 10. PASSWORD RESET TOKENS
    console.log('🔑 Tạo Tokens reset mật khẩu mẫu...');
    await prisma.passwordResetToken.create({
        data: {
            userId: users[0].id,
            token: faker.string.uuid(),
            expiresAt: faker.date.future(),
        }
    });

    console.log('✅ SEEDING HOÀN TẤT!');
    console.log(`- ${allUsers.length} Users`);
    console.log(`- ${books.length} Books`);
    console.log(`- ${CONFIG.NUM_ORDERS} Orders`);
}

main()
    .catch((e) => {
        console.error('❌ Lỗi seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });





// import { PrismaClient, OrderStatus, PaymentStatus } from "@prisma/client";
// import bcrypt from "bcryptjs";
// import dotenv from "dotenv";

// dotenv.config();

// const prisma = new PrismaClient();

// // Helper functions
// function randomInt(min: number, max: number): number {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// function randomElement<T>(array: T[]): T {
//     return array[Math.floor(Math.random() * array.length)];
// }

// function randomDate(monthsAgo: number): Date {
//     const now = new Date();
//     const past = new Date();
//     past.setMonth(past.getMonth() - monthsAgo);
//     const diff = now.getTime() - past.getTime();
//     return new Date(past.getTime() + Math.random() * diff);
// }

// async function main() {
//     console.log("🚀 Starting enhanced seed...");

//     // Clear existing data
//     console.log("🗑️  Clearing existing data...");
//     await prisma.rating.deleteMany();
//     await prisma.orderItem.deleteMany();
//     await prisma.payment.deleteMany();
//     await prisma.order.deleteMany();
//     await prisma.cartItem.deleteMany();
//     await prisma.cart.deleteMany();
//     await prisma.bookAuthor.deleteMany();
//     await prisma.book.deleteMany();
//     await prisma.author.deleteMany();
//     await prisma.category.deleteMany();
//     await prisma.publisher.deleteMany();
//     await prisma.paymentMethod.deleteMany();
//     await prisma.user.deleteMany();

//     // ========================================
//     // 1. USERS (12 users: 2 admins + 10 regular users)
//     // ========================================
//     console.log("👥 Creating users...");
//     const hashedPassword = await bcrypt.hash("password123", 10);

//     const usersData = [
//         // Admins
//         { username: "admin", email: "admin@bookstore.com", fullName: "Admin User", role: "ADMIN" as const, position: "Store Manager", phone: "+84-901-000-001", address: "123 Admin St, District 1, Ho Chi Minh City" },
//         { username: "admin2", email: "admin2@bookstore.com", fullName: "Admin Assistant", role: "ADMIN" as const, position: "Assistant Manager", phone: "+84-901-000-002", address: "456 Admin Ave, District 3, Ho Chi Minh City" },
//         // Regular users
//         { username: "nguyen_van_a", email: "nguyenvana@email.com", fullName: "Nguyễn Văn A", role: "USER" as const, phone: "+84-912-345-001", address: "12 Lê Lợi, Quận 1, TP.HCM" },
//         { username: "tran_thi_b", email: "tranthib@email.com", fullName: "Trần Thị B", role: "USER" as const, phone: "+84-912-345-002", address: "34 Nguyễn Huệ, Quận 1, TP.HCM" },
//         { username: "le_van_c", email: "levanc@email.com", fullName: "Lê Văn C", role: "USER" as const, phone: "+84-912-345-003", address: "56 Hai Bà Trưng, Quận 3, TP.HCM" },
//         { username: "pham_thi_d", email: "phamthid@email.com", fullName: "Phạm Thị D", role: "USER" as const, phone: "+84-912-345-004", address: "78 Võ Văn Tần, Quận 3, TP.HCM" },
//         { username: "hoang_van_e", email: "hoangvane@email.com", fullName: "Hoàng Văn E", role: "USER" as const, phone: "+84-912-345-005", address: "90 Cách Mạng Tháng 8, Quận 10, TP.HCM" },
//         { username: "do_thi_f", email: "dothif@email.com", fullName: "Đỗ Thị F", role: "USER" as const, phone: "+84-912-345-006", address: "123 Trần Hưng Đạo, Quận 5, TP.HCM" },
//         { username: "vu_van_g", email: "vuvang@email.com", fullName: "Vũ Văn G", role: "USER" as const, phone: "+84-912-345-007", address: "456 An Dương Vương, Quận 5, TP.HCM" },
//         { username: "bui_thi_h", email: "buithih@email.com", fullName: "Bùi Thị H", role: "USER" as const, phone: "+84-912-345-008", address: "789 Nguyễn Trãi, Quận 5, TP.HCM" },
//         { username: "dang_van_i", email: "dangvani@email.com", fullName: "Đặng Văn I", role: "USER" as const, phone: "+84-912-345-009", address: "321 Điện Biên Phủ, Bình Thạnh, TP.HCM" },
//         { username: "ngo_thi_k", email: "ngothik@email.com", fullName: "Ngô Thị K", role: "USER" as const, phone: "+84-912-345-010", address: "654 Phan Xích Long, Phú Nhuận, TP.HCM" },
//     ];

//     const users = await Promise.all(
//         usersData.map(u => prisma.user.create({ data: { ...u, password: hashedPassword } }))
//     );
//     const adminUsers = users.filter(u => u.role === "ADMIN");
//     const regularUsers = users.filter(u => u.role === "USER");

//     // Create carts for regular users
//     await prisma.cart.createMany({
//         data: regularUsers.map(u => ({ userId: u.id })),
//     });

//     // ========================================
//     // 2. PUBLISHERS (15 publishers)
//     // ========================================
//     console.log("🏢 Creating publishers...");
//     const publishersData = [
//         "O'Reilly Media", "Pearson Education", "Manning Publications", "Packt Publishing",
//         "Apress", "No Starch Press", "Addison-Wesley", "Wiley", "Springer",
//         "McGraw-Hill", "Cambridge University Press", "MIT Press", "Penguin Random House",
//         "HarperCollins", "NXB Kim Đồng"
//     ];

//     const publishers = await Promise.all(
//         publishersData.map(name => prisma.publisher.create({ data: { name } }))
//     );

//     // ========================================
//     // 3. AUTHORS (25 authors)
//     // ========================================
//     console.log("✍️  Creating authors...");
//     const authorsData = [
//         "Robert C. Martin", "Martin Fowler", "Eric Evans", "Kent Beck", "Gang of Four (GoF)",
//         "Andrew Hunt", "David Thomas", "Kyle Simpson", "Douglas Crockford", "Jon Duckett",
//         "Steve Krug", "Don Norman", "Marijn Haverbeke", "Addy Osmani", "Nicholas C. Zakas",
//         "Joshua Bloch", "Brian Kernighan", "Dennis Ritchie", "Bjarne Stroustrup", "Linus Torvalds",
//         "Nguyễn Nhật Ánh", "Tô Hoài", "Nam Cao", "Vũ Trọng Phụng", "Nguyễn Du"
//     ];

//     const authors = await Promise.all(
//         authorsData.map(name => prisma.author.create({ data: { name } }))
//     );

//     // ========================================
//     // 4. CATEGORIES (hierarchical structure)
//     // ========================================
//     console.log("📂 Creating categories...");

//     // Parent categories
//     const techCategory = await prisma.category.create({ data: { name: "Technology & Programming" } });
//     const literatureCategory = await prisma.category.create({ data: { name: "Literature & Fiction" } });
//     const businessCategory = await prisma.category.create({ data: { name: "Business & Economics" } });
//     const scienceCategory = await prisma.category.create({ data: { name: "Science & Mathematics" } });

//     // Child categories
//     const programmingCategory = await prisma.category.create({ data: { name: "Programming", parentCategoryId: techCategory.id } });
//     const webDevCategory = await prisma.category.create({ data: { name: "Web Development", parentCategoryId: programmingCategory.id } });
//     const softwareEngCategory = await prisma.category.create({ data: { name: "Software Engineering", parentCategoryId: programmingCategory.id } });
//     const databaseCategory = await prisma.category.create({ data: { name: "Databases", parentCategoryId: techCategory.id } });
//     const networkingCategory = await prisma.category.create({ data: { name: "Networking & Security", parentCategoryId: techCategory.id } });
//     const designCategory = await prisma.category.create({ data: { name: "Design & UX", parentCategoryId: techCategory.id } });
//     const vietnameseLitCategory = await prisma.category.create({ data: { name: "Vietnamese Literature", parentCategoryId: literatureCategory.id } });
//     const classicLitCategory = await prisma.category.create({ data: { name: "Classic Literature", parentCategoryId: literatureCategory.id } });

//     const allCategories = [
//         techCategory, literatureCategory, businessCategory, scienceCategory,
//         programmingCategory, webDevCategory, softwareEngCategory, databaseCategory,
//         networkingCategory, designCategory, vietnameseLitCategory, classicLitCategory
//     ];

//     // ========================================
//     // 5. BOOKS (35 books)
//     // ========================================
//     console.log("📚 Creating books...");
//     const booksData = [
//         // Software Engineering
//         { title: "Clean Code: A Handbook of Agile Software Craftsmanship", price: 42.99, stock: 50, description: "Even bad code can function. But if code is not clean, it can bring a development organization to its knees.", imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400", publisherId: publishers[1].id, categoryId: softwareEngCategory.id, authorIds: [authors[0].id] },
//         { title: "Refactoring: Improving the Design of Existing Code", price: 54.99, stock: 35, description: "Martin Fowler defined core ideas and techniques that developers use to improve their code.", imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", publisherId: publishers[6].id, categoryId: softwareEngCategory.id, authorIds: [authors[1].id] },
//         { title: "Domain-Driven Design: Tackling Complexity in the Heart of Software", price: 59.99, stock: 25, description: "Eric Evans has written a book that could change the way we think about software design.", imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400", publisherId: publishers[6].id, categoryId: softwareEngCategory.id, authorIds: [authors[2].id] },
//         { title: "Test Driven Development: By Example", price: 44.99, stock: 40, description: "Test-driven development is meant to eliminate fear in application development.", imageUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400", publisherId: publishers[6].id, categoryId: softwareEngCategory.id, authorIds: [authors[3].id] },
//         { title: "Design Patterns: Elements of Reusable Object-Oriented Software", price: 64.99, stock: 30, description: "Four top-notch designers present a catalog of simple solutions to commonly occurring design problems.", imageUrl: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400", publisherId: publishers[6].id, categoryId: softwareEngCategory.id, authorIds: [authors[4].id] },
//         { title: "The Pragmatic Programmer: Your Journey To Mastery", price: 49.99, stock: 45, description: "The Pragmatic Programmer is one of those rare tech books you will read again over the years.", imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400", publisherId: publishers[6].id, categoryId: softwareEngCategory.id, authorIds: [authors[5].id, authors[6].id] },

//         // Web Development
//         { title: "You Don't Know JS Yet: Get Started", price: 29.99, stock: 60, description: "Learn the fundamentals of JavaScript the right way.", imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400", publisherId: publishers[0].id, categoryId: webDevCategory.id, authorIds: [authors[7].id] },
//         { title: "JavaScript: The Good Parts", price: 34.99, stock: 55, description: "JavaScript has more than its share of bad parts, having been developed in a hurry.", imageUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400", publisherId: publishers[0].id, categoryId: webDevCategory.id, authorIds: [authors[8].id] },
//         { title: "HTML and CSS: Design and Build Websites", price: 39.99, stock: 70, description: "A full-color introduction to the basics of HTML and CSS from the publishers of Wrox.", imageUrl: "https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?w=400", publisherId: publishers[7].id, categoryId: webDevCategory.id, authorIds: [authors[9].id] },
//         { title: "Eloquent JavaScript: A Modern Introduction to Programming", price: 37.99, stock: 65, description: "JavaScript lies at the heart of almost every modern web application.", imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400", publisherId: publishers[5].id, categoryId: webDevCategory.id, authorIds: [authors[12].id] },
//         { title: "Learning JavaScript Design Patterns", price: 41.99, stock: 45, description: "Learn how to write beautiful, structured, and maintainable JavaScript.", imageUrl: "https://images.unsplash.com/photo-1550439062-609e1531270e?w=400", publisherId: publishers[0].id, categoryId: webDevCategory.id, authorIds: [authors[13].id] },
//         { title: "Maintainable JavaScript", price: 38.99, stock: 35, description: "Learn the theory and practice of writing maintainable JavaScript code.", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400", publisherId: publishers[0].id, categoryId: webDevCategory.id, authorIds: [authors[14].id] },

//         // Databases
//         { title: "SQL Performance Explained", price: 46.99, stock: 30, description: "Everything developers need to know about SQL performance.", imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400", publisherId: publishers[4].id, categoryId: databaseCategory.id, authorIds: [authors[1].id] },
//         { title: "Database Design for Mere Mortals", price: 52.99, stock: 28, description: "A hands-on guide to relational database design.", imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400", publisherId: publishers[1].id, categoryId: databaseCategory.id, authorIds: [authors[15].id] },
//         { title: "NoSQL Distilled", price: 39.99, stock: 40, description: "A brief guide to the emerging world of polyglot persistence.", imageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400", publisherId: publishers[6].id, categoryId: databaseCategory.id, authorIds: [authors[1].id] },

//         // Design & UX
//         { title: "Don't Make Me Think: A Common Sense Approach to Web Usability", price: 44.99, stock: 40, description: "Web designers and developers have relied on Steve Krug's guide to understand intuitive navigation.", imageUrl: "https://images.unsplash.com/photo-1485988412941-77a35537dae4?w=400", publisherId: publishers[5].id, categoryId: designCategory.id, authorIds: [authors[10].id] },
//         { title: "The Design of Everyday Things", price: 32.99, stock: 50, description: "Design does not have to be complicated. Usability is just as important as aesthetics.", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", publisherId: publishers[7].id, categoryId: designCategory.id, authorIds: [authors[11].id] },
//         { title: "Atomic Design", price: 29.99, stock: 55, description: "A methodology for creating design systems.", imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400", publisherId: publishers[5].id, categoryId: designCategory.id, authorIds: [authors[13].id] },

//         // Programming Languages
//         { title: "Effective Java", price: 49.99, stock: 48, description: "The definitive guide to Java platform best practices.", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400", publisherId: publishers[6].id, categoryId: programmingCategory.id, authorIds: [authors[15].id] },
//         { title: "The C Programming Language", price: 45.99, stock: 35, description: "The classic definitive reference manual for C language.", imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400", publisherId: publishers[1].id, categoryId: programmingCategory.id, authorIds: [authors[16].id, authors[17].id] },
//         { title: "The C++ Programming Language", price: 59.99, stock: 30, description: "The bible of C++ programming by the creator of the language.", imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400", publisherId: publishers[6].id, categoryId: programmingCategory.id, authorIds: [authors[18].id] },

//         // Vietnamese Literature
//         { title: "Mắt Biếc", price: 12.99, stock: 100, description: "Một câu chuyện tình yêu xúc động của tuổi học trò.", imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", publisherId: publishers[14].id, categoryId: vietnameseLitCategory.id, authorIds: [authors[20].id] },
//         { title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh", price: 11.99, stock: 120, description: "Câu chuyện về tuổi thơ trong sáng và tình anh em.", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", publisherId: publishers[14].id, categoryId: vietnameseLitCategory.id, authorIds: [authors[20].id] },
//         { title: "Cho Tôi Xin Một Vé Đi Tuổi Thơ", price: 10.99, stock: 90, description: "Hành trình trở về tuổi thơ đầy trong sáng.", imageUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400", publisherId: publishers[14].id, categoryId: vietnameseLitCategory.id, authorIds: [authors[20].id] },
//         { title: "Dế Mèn Phiêu Lưu Ký", price: 9.99, stock: 80, description: "Cuộc phiêu lưu của chú Dế Mèn và những bài học cuộc sống.", imageUrl: "https://images.unsplash.com/photo-1513001900722-370f803f498d?w=400", publisherId: publishers[14].id, categoryId: vietnameseLitCategory.id, authorIds: [authors[21].id] },
//         { title: "Chí Phèo", price: 8.99, stock: 75, description: "Kiệt tác văn học hiện thực phê phán Việt Nam.", imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400", publisherId: publishers[14].id, categoryId: vietnameseLitCategory.id, authorIds: [authors[22].id] },
//         { title: "Số Đỏ", price: 13.99, stock: 60, description: "Tiểu thuyết trào phúng xuất sắc nhất văn học Việt Nam.", imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400", publisherId: publishers[14].id, categoryId: vietnameseLitCategory.id, authorIds: [authors[23].id] },

//         // Classic Literature
//         { title: "Truyện Kiều", price: 14.99, stock: 85, description: "Kiệt tác văn học cổ điển Việt Nam.", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", publisherId: publishers[14].id, categoryId: classicLitCategory.id, authorIds: [authors[24].id] },

//         // Business
//         { title: "The Lean Startup", price: 24.99, stock: 90, description: "How Today's Entrepreneurs Use Continuous Innovation.", imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400", publisherId: publishers[12].id, categoryId: businessCategory.id, authorIds: [authors[15].id] },
//         { title: "Zero to One", price: 22.99, stock: 85, description: "Notes on Startups, or How to Build the Future.", imageUrl: "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=400", publisherId: publishers[12].id, categoryId: businessCategory.id, authorIds: [authors[15].id] },
//         { title: "Good to Great", price: 26.99, stock: 70, description: "Why Some Companies Make the Leap and Others Don't.", imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400", publisherId: publishers[13].id, categoryId: businessCategory.id, authorIds: [authors[15].id] },

//         // Science
//         { title: "A Brief History of Time", price: 19.99, stock: 95, description: "From the Big Bang to Black Holes.", imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400", publisherId: publishers[12].id, categoryId: scienceCategory.id, authorIds: [authors[15].id] },
//         { title: "Cosmos", price: 21.99, stock: 80, description: "A personal voyage through the universe.", imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400", publisherId: publishers[12].id, categoryId: scienceCategory.id, authorIds: [authors[15].id] },
//         { title: "The Selfish Gene", price: 18.99, stock: 65, description: "A revolutionary view of evolution.", imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400", publisherId: publishers[10].id, categoryId: scienceCategory.id, authorIds: [authors[15].id] },
//     ];

//     const books: any[] = [];
//     for (const bookData of booksData) {
//         const { authorIds, ...bookInfo } = bookData;
//         const book = await prisma.book.create({
//             data: {
//                 ...bookInfo,
//                 authors: {
//                     create: authorIds.map((authorId) => ({
//                         author: { connect: { id: authorId } },
//                     })),
//                 },
//             },
//         });
//         books.push(book);
//     }

//     // ========================================
//     // 6. PAYMENT METHODS
//     // ========================================
//     console.log("💳 Creating payment methods...");
//     const paymentMethodsData = ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Cash on Delivery"];
//     const paymentMethods = await Promise.all(
//         paymentMethodsData.map(name => prisma.paymentMethod.create({ data: { name } }))
//     );

//     // ========================================
//     // 7. ORDERS (60+ orders across 6 months)
//     // ========================================
//     console.log("🛒 Creating orders...");

//     const orderStatuses: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
//     const statusWeights = [0.10, 0.15, 0.10, 0.55, 0.10]; // Probability distribution

//     function getRandomStatus(): OrderStatus {
//         const rand = Math.random();
//         let cumulative = 0;
//         for (let i = 0; i < statusWeights.length; i++) {
//             cumulative += statusWeights[i];
//             if (rand <= cumulative) return orderStatuses[i];
//         }
//         return "DELIVERED";
//     }

//     function getPaymentStatus(orderStatus: OrderStatus): PaymentStatus {
//         if (orderStatus === "CANCELLED") return "REFUNDED";
//         if (orderStatus === "PENDING") return randomElement(["PENDING", "COMPLETED"] as PaymentStatus[]);
//         return "COMPLETED";
//     }

//     const orders: any[] = [];
//     const orderCount = 65;

//     for (let i = 0; i < orderCount; i++) {
//         const user = randomElement(regularUsers);
//         const orderDate = randomDate(6);
//         const orderStatus = getRandomStatus();
//         const paymentStatus = getPaymentStatus(orderStatus);
//         const paymentMethod = randomElement(paymentMethods);

//         // Random 1-4 items per order
//         const itemCount = randomInt(1, 4);
//         const selectedBooks = [];
//         const usedBookIds = new Set<string>();

//         for (let j = 0; j < itemCount; j++) {
//             let book = randomElement(books);
//             while (usedBookIds.has(book.id)) {
//                 book = randomElement(books);
//             }
//             usedBookIds.add(book.id);
//             selectedBooks.push({
//                 book,
//                 quantity: randomInt(1, 3),
//             });
//         }

//         const total = selectedBooks.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

//         const order = await prisma.order.create({
//             data: {
//                 userId: user.id,
//                 confirmedById: orderStatus !== "PENDING" && orderStatus !== "CANCELLED" ? randomElement(adminUsers).id : null,
//                 shippingAddress: user.address || "Default Address",
//                 total,
//                 status: orderStatus,
//                 orderDate,
//                 items: {
//                     create: selectedBooks.map(item => ({
//                         bookId: item.book.id,
//                         quantity: item.quantity,
//                         price: item.book.price,
//                     })),
//                 },
//                 payment: {
//                     create: {
//                         paymentMethodId: paymentMethod.id,
//                         total,
//                         status: paymentStatus,
//                         paymentDate: paymentStatus === "COMPLETED" ? orderDate : null,
//                     },
//                 },
//             },
//         });
//         orders.push(order);
//     }

//     // ========================================
//     // 8. RATINGS (80+ ratings)
//     // ========================================
//     console.log("⭐ Creating ratings...");

//     const ratingContents = [
//         "Sách rất hay, đáng đọc!",
//         "Nội dung phong phú, bổ ích.",
//         "Chất lượng in ấn tốt.",
//         "Giao hàng nhanh, đóng gói cẩn thận.",
//         "Giá cả hợp lý.",
//         "Excellent book, highly recommended!",
//         "Great for beginners.",
//         "A must-read for developers.",
//         "Changed my perspective on programming.",
//         "Best investment I've made in my career.",
//         "Good content but could be more concise.",
//         "Average, expected more.",
//         null, // Some ratings without content
//         null,
//     ];

//     const ratingsToCreate: { userId: string; bookId: string; stars: number; content: string | null }[] = [];
//     const userBookPairs = new Set<string>();

//     for (let i = 0; i < 85; i++) {
//         const user = randomElement(regularUsers);
//         const book = randomElement(books);
//         const pairKey = `${user.id}-${book.id}`;

//         if (userBookPairs.has(pairKey)) continue;
//         userBookPairs.add(pairKey);

//         ratingsToCreate.push({
//             userId: user.id,
//             bookId: book.id,
//             stars: randomInt(1, 5),
//             content: randomElement(ratingContents),
//         });
//     }

//     await prisma.rating.createMany({ data: ratingsToCreate });

//     // ========================================
//     // 9. CART ITEMS (for some users)
//     // ========================================
//     console.log("🛍️  Adding cart items...");

//     const carts = await prisma.cart.findMany();
//     for (const cart of carts.slice(0, 5)) {
//         const itemCount = randomInt(1, 3);
//         const usedBookIds = new Set<string>();
//         let cartTotal = 0;

//         for (let i = 0; i < itemCount; i++) {
//             let book = randomElement(books);
//             while (usedBookIds.has(book.id)) {
//                 book = randomElement(books);
//             }
//             usedBookIds.add(book.id);
//             const quantity = randomInt(1, 2);
//             cartTotal += book.price * quantity;

//             await prisma.cartItem.create({
//                 data: {
//                     cartId: cart.id,
//                     bookId: book.id,
//                     quantity,
//                 },
//             });
//         }

//         await prisma.cart.update({
//             where: { id: cart.id },
//             data: { total: cartTotal },
//         });
//     }

//     // ========================================
//     // Summary
//     // ========================================
//     console.log("\n✅ Enhanced seed completed successfully!");
//     console.log("========================================");
//     console.log(`👥 Users: ${users.length} (${adminUsers.length} admins, ${regularUsers.length} regular)`);
//     console.log(`🏢 Publishers: ${publishers.length}`);
//     console.log(`✍️  Authors: ${authors.length}`);
//     console.log(`📂 Categories: ${allCategories.length}`);
//     console.log(`📚 Books: ${books.length}`);
//     console.log(`💳 Payment Methods: ${paymentMethods.length}`);
//     console.log(`🛒 Orders: ${orders.length}`);
//     console.log(`⭐ Ratings: ${ratingsToCreate.length}`);
//     console.log("========================================");
//     console.log("\n📝 Test Credentials:");
//     console.log("   Admin: admin@bookstore.com / password123");
//     console.log("   User:  nguyenvana@email.com / password123");
// }

// main()
//     .catch((e) => {
//         console.error("❌ Seed failed:", e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
