import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // Số lượng orders cho mỗi khoảng thời gian
    ORDERS_TODAY: 5,
    ORDERS_YESTERDAY: 10,
    ORDERS_THIS_WEEK: 25, // 7 ngày qua (không bao gồm hôm nay và hôm qua)
    ORDERS_LAST_WEEK: 30, // 7-14 ngày trước

    // Số lượng ratings cho mỗi khoảng thời gian
    RATINGS_TODAY: 3,
    RATINGS_YESTERDAY: 5,
    RATINGS_THIS_WEEK: 15,
    RATINGS_LAST_WEEK: 20,
};

// Review contents
const REVIEW_CONTENTS = [
    'Absolutely loved this book! Couldn\'t put it down.',
    'A masterpiece that everyone should read.',
    'Well-written and thought-provoking.',
    'Great storytelling and character development.',
    'This book changed my perspective.',
    'Highly recommend for anyone interested in the topic.',
    'An essential read for the genre.',
    'Beautifully crafted narrative.',
    'Engaging from start to finish.',
    'A must-have for your bookshelf.',
    'Good read, but a bit slow in the middle.',
    'Interesting concepts, decent execution.',
    null,
];

// ============================================
// HELPER FUNCTIONS
// ============================================
function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Tạo ngày ngẫu nhiên trong khoảng n ngày trước đến m ngày trước
 * @param daysAgoStart - Số ngày trước (bắt đầu)
 * @param daysAgoEnd - Số ngày trước (kết thúc, mặc định = daysAgoStart)
 */
function randomDateInRange(daysAgoStart: number, daysAgoEnd?: number): Date {
    const end = daysAgoEnd ?? daysAgoStart;
    const now = new Date();

    // Reset time to start of day
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgoStart);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() - end);
    endDate.setHours(23, 59, 59, 999);

    const timestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    return new Date(timestamp);
}

/**
 * Tạo ngày hôm nay với giờ ngẫu nhiên
 */
function randomTimeToday(): Date {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentHour = now.getHours();

    // Random giờ từ 0 đến giờ hiện tại
    const randomHour = randomInt(0, currentHour);
    const randomMinute = randomInt(0, 59);
    const randomSecond = randomInt(0, 59);

    today.setHours(randomHour, randomMinute, randomSecond);
    return today;
}

/**
 * Tạo ngày hôm qua với giờ ngẫu nhiên
 */
function randomTimeYesterday(): Date {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
    return yesterday;
}

// ============================================
// ORDER CREATION
// ============================================
async function createOrder(
    user: any,
    books: any[],
    adminUser: any,
    paymentMethods: any[],
    orderDate: Date
) {
    const numItems = randomInt(1, 3);
    const selectedBooks: any[] = [];

    for (let j = 0; j < numItems; j++) {
        let book = randomElement(books);
        while (selectedBooks.includes(book)) {
            book = randomElement(books);
        }
        selectedBooks.push(book);
    }

    let orderTotal = 0;
    const orderItemsData = selectedBooks.map(book => {
        const qty = randomInt(1, 2);
        orderTotal += book.price * qty;
        return { bookId: book.id, quantity: qty, price: book.price };
    });

    const statuses = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
    const status = randomElement(statuses);

    let confirmedById = null;
    if (['SHIPPED', 'DELIVERED', 'PROCESSING'].includes(status)) {
        confirmedById = adminUser.id;
    }

    const order = await prisma.order.create({
        data: {
            userId: user.id,
            total: orderTotal,
            status,
            confirmedById,
            shippingAddress: user.address || '123 Default Street',
            orderDate,
            items: { create: orderItemsData },
        },
    });

    // Create Payment
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
    if (status === 'DELIVERED') paymentStatus = PaymentStatus.COMPLETED;
    if (status === 'PROCESSING' || status === 'SHIPPED') {
        paymentStatus = Math.random() > 0.3 ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
    }

    await prisma.payment.create({
        data: {
            orderId: order.id,
            paymentMethodId: randomElement(paymentMethods).id,
            status: paymentStatus,
            total: orderTotal,
            paymentDate: paymentStatus === 'COMPLETED' ? orderDate : null,
        },
    });

    return order;
}

// ============================================
// RATING CREATION
// ============================================
async function createRating(
    user: any,
    book: any,
    users: any[],
    createdAt: Date
) {
    // Check if rating already exists
    const existing = await prisma.rating.findUnique({
        where: {
            userId_bookId: {
                userId: user.id,
                bookId: book.id,
            },
        },
    });

    if (existing) return null;

    const rating = await prisma.rating.create({
        data: {
            userId: user.id,
            bookId: book.id,
            stars: randomInt(3, 5),
            content: randomElement(REVIEW_CONTENTS),
            createdAt,
            updatedAt: createdAt,
        },
    });

    // Add some votes
    if (Math.random() > 0.5) {
        const voter = randomElement(users.filter(u => u.id !== user.id));
        if (voter) {
            await prisma.ratingVote.create({
                data: {
                    ratingId: rating.id,
                    userId: voter.id,
                    voteType: Math.random() > 0.2 ? 1 : -1,
                },
            }).catch(() => { }); // Ignore duplicates
        }
    }

    return rating;
}

// ============================================
// MAIN FUNCTION
// ============================================
async function main() {
    console.log('🔄 Adding recent data for admin filters...\n');

    // Fetch existing data
    const users = await prisma.user.findMany({ where: { role: 'USER' } });
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const books = await prisma.book.findMany();
    const paymentMethods = await prisma.paymentMethod.findMany();

    if (users.length === 0 || !adminUser || books.length === 0 || paymentMethods.length === 0) {
        console.log('❌ Please run the main seed first: npm run seed');
        return;
    }

    console.log(`📊 Found: ${users.length} users, ${books.length} books, ${paymentMethods.length} payment methods\n`);

    let ordersCreated = 0;
    let ratingsCreated = 0;

    // ============================================
    // CREATE ORDERS
    // ============================================
    console.log('📦 Creating recent orders...');

    // Today's orders
    for (let i = 0; i < CONFIG.ORDERS_TODAY; i++) {
        await createOrder(randomElement(users), books, adminUser, paymentMethods, randomTimeToday());
        ordersCreated++;
    }
    console.log(`   ✓ Today: ${CONFIG.ORDERS_TODAY} orders`);

    // Yesterday's orders
    for (let i = 0; i < CONFIG.ORDERS_YESTERDAY; i++) {
        await createOrder(randomElement(users), books, adminUser, paymentMethods, randomTimeYesterday());
        ordersCreated++;
    }
    console.log(`   ✓ Yesterday: ${CONFIG.ORDERS_YESTERDAY} orders`);

    // This week (2-7 days ago)
    for (let i = 0; i < CONFIG.ORDERS_THIS_WEEK; i++) {
        const date = randomDateInRange(7, 2);
        await createOrder(randomElement(users), books, adminUser, paymentMethods, date);
        ordersCreated++;
    }
    console.log(`   ✓ This week (2-7 days ago): ${CONFIG.ORDERS_THIS_WEEK} orders`);

    // Last week (8-14 days ago)
    for (let i = 0; i < CONFIG.ORDERS_LAST_WEEK; i++) {
        const date = randomDateInRange(14, 8);
        await createOrder(randomElement(users), books, adminUser, paymentMethods, date);
        ordersCreated++;
    }
    console.log(`   ✓ Last week (8-14 days ago): ${CONFIG.ORDERS_LAST_WEEK} orders`);

    // ============================================
    // CREATE RATINGS
    // ============================================
    console.log('\n⭐ Creating recent ratings...');

    // Today's ratings
    for (let i = 0; i < CONFIG.RATINGS_TODAY; i++) {
        const result = await createRating(randomElement(users), randomElement(books), users, randomTimeToday());
        if (result) ratingsCreated++;
    }
    console.log(`   ✓ Today: up to ${CONFIG.RATINGS_TODAY} ratings`);

    // Yesterday's ratings
    for (let i = 0; i < CONFIG.RATINGS_YESTERDAY; i++) {
        const result = await createRating(randomElement(users), randomElement(books), users, randomTimeYesterday());
        if (result) ratingsCreated++;
    }
    console.log(`   ✓ Yesterday: up to ${CONFIG.RATINGS_YESTERDAY} ratings`);

    // This week ratings
    for (let i = 0; i < CONFIG.RATINGS_THIS_WEEK; i++) {
        const date = randomDateInRange(7, 2);
        const result = await createRating(randomElement(users), randomElement(books), users, date);
        if (result) ratingsCreated++;
    }
    console.log(`   ✓ This week: up to ${CONFIG.RATINGS_THIS_WEEK} ratings`);

    // Last week ratings
    for (let i = 0; i < CONFIG.RATINGS_LAST_WEEK; i++) {
        const date = randomDateInRange(14, 8);
        const result = await createRating(randomElement(users), randomElement(books), users, date);
        if (result) ratingsCreated++;
    }
    console.log(`   ✓ Last week: up to ${CONFIG.RATINGS_LAST_WEEK} ratings`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n✅ RECENT DATA SEEDING COMPLETE!');
    console.log('========================================');
    console.log(`📦 Orders added: ${ordersCreated}`);
    console.log(`⭐ Ratings added: ${ratingsCreated}`);
    console.log('========================================');
    console.log('\n💡 Run this script anytime to refresh recent data:');
    console.log('   npx ts-node prisma/seed-recent.ts');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
