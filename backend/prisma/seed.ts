import { PrismaClient, Role, OrderStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// REALISTIC DATA DEFINITIONS
// ============================================

// Real Publishers
const PUBLISHERS = [
    'Penguin Random House',
    'HarperCollins',
    'Simon & Schuster',
    'Macmillan Publishers',
    'Hachette Book Group',
    "O'Reilly Media",
    'Wiley',
    'Pearson Education',
    'McGraw-Hill Education',
    'Springer',
    'MIT Press',
    'Oxford University Press',
    'Cambridge University Press',
    'No Starch Press',
    'Manning Publications',
    'Apress',
    'Packt Publishing',
    'Bloomsbury Publishing',
    'Scholastic',
    'National Geographic Books',
];

// Real Authors
const AUTHORS = [
    // Fiction
    'Stephen King', 'J.K. Rowling', 'George R.R. Martin', 'Agatha Christie',
    'Dan Brown', 'James Patterson', 'John Grisham', 'Paulo Coelho',
    'Haruki Murakami', 'Margaret Atwood', 'Neil Gaiman', 'Brandon Sanderson',
    'Gillian Flynn', 'Colleen Hoover', 'Taylor Jenkins Reid',
    // Non-Fiction
    'Malcolm Gladwell', 'Yuval Noah Harari', 'Michelle Obama', 'Barack Obama',
    'Bill Gates', 'Brené Brown', 'James Clear', 'Cal Newport',
    'Simon Sinek', 'Adam Grant', 'Daniel Kahneman', 'Angela Duckworth',
    // Technology
    'Robert C. Martin', 'Martin Fowler', 'Eric Evans', 'Kent Beck',
    'Douglas Crockford', 'Kyle Simpson', 'Marijn Haverbeke', 'Jon Duckett',
    'Addy Osmani', 'Steve Krug', 'Don Norman', 'Joshua Bloch',
    // Science
    'Stephen Hawking', 'Carl Sagan', 'Richard Dawkins', 'Neil deGrasse Tyson',
    'Brian Greene', 'Michio Kaku', 'Bill Bryson',
    // Business
    'Peter Thiel', 'Eric Ries', 'Jim Collins', 'Patrick Lencioni',
    'Ray Dalio', 'Robert Kiyosaki', 'Timothy Ferriss',
];

// Categories with subcategories
const CATEGORIES = [
    { name: 'Fiction', children: ['Literary Fiction', 'Contemporary Fiction', 'Historical Fiction'] },
    { name: 'Mystery & Thriller', children: ['Crime Fiction', 'Psychological Thriller', 'Detective Stories'] },
    { name: 'Science Fiction & Fantasy', children: ['Epic Fantasy', 'Space Opera', 'Dystopian'] },
    { name: 'Romance', children: ['Contemporary Romance', 'Historical Romance', 'Romantic Comedy'] },
    { name: 'Non-Fiction', children: ['Biography & Memoir', 'History', 'True Crime'] },
    { name: 'Self-Help & Personal Development', children: ['Productivity', 'Relationships', 'Mindfulness'] },
    { name: 'Business & Economics', children: ['Entrepreneurship', 'Leadership', 'Investing'] },
    { name: 'Science & Technology', children: ['Popular Science', 'Computer Science', 'Mathematics'] },
    { name: 'Programming & Software', children: ['Web Development', 'Software Engineering', 'Data Science'] },
    { name: 'Art & Design', children: ['Graphic Design', 'Photography', 'Architecture'] },
    { name: "Children's Books", children: ['Picture Books', 'Middle Grade', 'Young Adult'] },
    { name: 'Comics & Graphic Novels', children: ['Superhero', 'Manga', 'Indie Comics'] },
    { name: 'Health & Wellness', children: ['Fitness', 'Nutrition', 'Mental Health'] },
    { name: 'Cooking & Food', children: ['Recipes', 'Baking', 'World Cuisine'] },
    { name: 'Travel & Adventure', children: ['Travel Guides', 'Adventure Stories', 'Nature Writing'] },
];

// Real Books Data
const BOOKS_DATA = [
    // Fiction
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', publisher: 'Simon & Schuster', price: 14.99, description: 'A novel of the Jazz Age that explores themes of decadence, idealism, and social upheaval in 1920s America.' },
    { title: '1984', author: 'George Orwell', category: 'Fiction', publisher: 'Penguin Random House', price: 15.99, description: 'A dystopian masterpiece about totalitarianism, surveillance, and the power of language to shape reality.' },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', publisher: 'HarperCollins', price: 16.99, description: 'A gripping tale of racial injustice and childhood innocence in the American South.' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Fiction', publisher: 'Penguin Random House', price: 12.99, description: 'A witty and romantic novel about love, reputation, and class in Regency-era England.' },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Fiction', publisher: 'Penguin Random House', price: 14.99, description: 'The iconic story of teenage alienation and loss of innocence in post-war America.' },
    { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', category: 'Fiction', publisher: 'HarperCollins', price: 17.99, description: 'A landmark of magical realism following seven generations of the Buendía family.' },
    { title: 'Brave New World', author: 'Aldous Huxley', category: 'Fiction', publisher: 'HarperCollins', price: 15.99, description: 'A prophetic novel about a technologically advanced future society and the cost of happiness.' },
    { title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', publisher: 'HarperCollins', price: 16.99, description: 'An enchanting tale about following your dreams and listening to your heart.' },
    { title: 'Norwegian Wood', author: 'Haruki Murakami', category: 'Fiction', publisher: 'Penguin Random House', price: 16.99, description: 'A nostalgic story of loss and sexuality in 1960s Tokyo.' },
    { title: "The Handmaid's Tale", author: 'Margaret Atwood', category: 'Fiction', publisher: 'Penguin Random House', price: 15.99, description: 'A chilling vision of a totalitarian theocracy where women have lost all rights.' },

    // Mystery & Thriller
    { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', category: 'Mystery & Thriller', publisher: 'Penguin Random House', price: 17.99, description: 'A gripping thriller about a journalist and a hacker investigating a decades-old disappearance.' },
    { title: 'Gone Girl', author: 'Gillian Flynn', category: 'Mystery & Thriller', publisher: 'Penguin Random House', price: 16.99, description: 'A psychological thriller about a marriage gone terribly wrong.' },
    { title: 'The Da Vinci Code', author: 'Dan Brown', category: 'Mystery & Thriller', publisher: 'Penguin Random House', price: 17.99, description: 'A fast-paced thriller involving secret societies, religious mysteries, and hidden codes.' },
    { title: 'Murder on the Orient Express', author: 'Agatha Christie', category: 'Mystery & Thriller', publisher: 'HarperCollins', price: 14.99, description: 'Hercule Poirot investigates a murder on a snowbound train.' },
    { title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Mystery & Thriller', publisher: 'Macmillan Publishers', price: 17.99, description: 'A woman shoots her husband and then never speaks again.' },
    { title: 'In the Woods', author: 'Tana French', category: 'Mystery & Thriller', publisher: 'Penguin Random House', price: 16.99, description: 'A haunting psychological mystery set in Dublin.' },
    { title: 'The Girl on the Train', author: 'Paula Hawkins', category: 'Mystery & Thriller', publisher: 'Penguin Random House', price: 16.99, description: 'A psychological thriller about obsession, jealousy, and betrayal.' },
    { title: 'Big Little Lies', author: 'Liane Moriarty', category: 'Mystery & Thriller', publisher: 'Penguin Random House', price: 16.99, description: 'A darkly comedic tale of murder and secrets in a suburban community.' },
    { title: 'The Woman in the Window', author: 'A.J. Finn', category: 'Mystery & Thriller', publisher: 'HarperCollins', price: 16.99, description: 'An agoraphobic woman witnesses something she should not have.' },
    { title: 'Sharp Objects', author: 'Gillian Flynn', category: 'Mystery & Thriller', publisher: 'Penguin Random House', price: 15.99, description: 'A reporter returns to her hometown to cover a series of murders.' },

    // Science Fiction & Fantasy
    { title: 'Dune', author: 'Frank Herbert', category: 'Science Fiction & Fantasy', publisher: 'Penguin Random House', price: 18.99, description: 'The epic saga of a desert planet, its native people, and the battles over the spice melange.' },
    { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', category: 'Science Fiction & Fantasy', publisher: 'HarperCollins', price: 29.99, description: 'The definitive fantasy epic about the quest to destroy the One Ring.' },
    { title: 'A Game of Thrones', author: 'George R.R. Martin', category: 'Science Fiction & Fantasy', publisher: 'Penguin Random House', price: 18.99, description: 'The first book in the epic fantasy series A Song of Ice and Fire.' },
    { title: "Harry Potter and the Sorcerer's Stone", author: 'J.K. Rowling', category: 'Science Fiction & Fantasy', publisher: 'Scholastic', price: 14.99, description: 'The magical beginning of the beloved Harry Potter series.' },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Science Fiction & Fantasy', publisher: 'HarperCollins', price: 14.99, description: 'Bilbo Baggins embarks on an unexpected adventure with a company of dwarves.' },
    { title: 'Ender\'s Game', author: 'Orson Scott Card', category: 'Science Fiction & Fantasy', publisher: 'Macmillan Publishers', price: 15.99, description: 'A brilliant child is trained to be the military genius humanity needs.' },
    { title: 'The Martian', author: 'Andy Weir', category: 'Science Fiction & Fantasy', publisher: 'Penguin Random House', price: 16.99, description: 'An astronaut must survive alone on Mars using only his ingenuity.' },
    { title: 'Foundation', author: 'Isaac Asimov', category: 'Science Fiction & Fantasy', publisher: 'Penguin Random House', price: 17.99, description: 'A mathematician predicts the fall of the Galactic Empire and plans a new civilization.' },
    { title: 'Neuromancer', author: 'William Gibson', category: 'Science Fiction & Fantasy', publisher: 'Penguin Random House', price: 16.99, description: 'The pioneering cyberpunk novel that defined a genre.' },
    { title: 'The Name of the Wind', author: 'Patrick Rothfuss', category: 'Science Fiction & Fantasy', publisher: 'Penguin Random House', price: 17.99, description: 'The story of a legendary figure telling his own story.' },
    { title: 'The Way of Kings', author: 'Brandon Sanderson', category: 'Science Fiction & Fantasy', publisher: 'Macmillan Publishers', price: 19.99, description: 'An epic fantasy set in a world of storms and magic.' },
    { title: 'American Gods', author: 'Neil Gaiman', category: 'Science Fiction & Fantasy', publisher: 'HarperCollins', price: 17.99, description: 'Old gods and new clash in modern America.' },

    // Romance
    { title: 'It Ends with Us', author: 'Colleen Hoover', category: 'Romance', publisher: 'Simon & Schuster', price: 16.99, description: 'A brave and heartbreaking novel about love, loss, and family.' },
    { title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', category: 'Romance', publisher: 'Simon & Schuster', price: 16.99, description: 'An aging Hollywood icon recounts the stories of her seven marriages.' },
    { title: 'Outlander', author: 'Diana Gabaldon', category: 'Romance', publisher: 'Penguin Random House', price: 18.99, description: 'A WWII nurse is transported back to 18th-century Scotland.' },
    { title: 'The Notebook', author: 'Nicholas Sparks', category: 'Romance', publisher: 'Hachette Book Group', price: 15.99, description: 'A timeless love story about the enduring power of true love.' },
    { title: 'Beach Read', author: 'Emily Henry', category: 'Romance', publisher: 'Penguin Random House', price: 16.99, description: 'Two writers with opposite genres swap styles for the summer.' },
    { title: 'People We Meet on Vacation', author: 'Emily Henry', category: 'Romance', publisher: 'Penguin Random House', price: 16.99, description: 'Best friends take one more vacation to save their friendship.' },
    { title: 'The Hating Game', author: 'Sally Thorne', category: 'Romance', publisher: 'HarperCollins', price: 15.99, description: 'Two executive assistants play a game of one-upmanship that turns into attraction.' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Romance', publisher: 'Penguin Random House', price: 12.99, description: 'The original enemies-to-lovers romance.' },
    { title: 'Me Before You', author: 'Jojo Moyes', category: 'Romance', publisher: 'Penguin Random House', price: 16.99, description: 'A small-town girl becomes the caretaker for a paralyzed man.' },
    { title: 'Verity', author: 'Colleen Hoover', category: 'Romance', publisher: 'Hachette Book Group', price: 16.99, description: 'A writer uncovers a dark secret while finishing another author\'s work.' },

    // Non-Fiction
    { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'Non-Fiction', publisher: 'HarperCollins', price: 22.99, description: 'An exploration of the history and impact of Homo sapiens on the world.' },
    { title: 'Becoming', author: 'Michelle Obama', category: 'Non-Fiction', publisher: 'Penguin Random House', price: 19.99, description: 'The intimate memoir of the former First Lady of the United States.' },
    { title: 'A Promised Land', author: 'Barack Obama', category: 'Non-Fiction', publisher: 'Penguin Random House', price: 24.99, description: 'The first volume of Barack Obama\'s presidential memoirs.' },
    { title: 'Educated', author: 'Tara Westover', category: 'Non-Fiction', publisher: 'Penguin Random House', price: 17.99, description: 'A memoir about a woman who grew up in a survivalist family and pursued education.' },
    { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot', category: 'Non-Fiction', publisher: 'Penguin Random House', price: 16.99, description: 'The story of the woman whose cells changed medical science forever.' },
    { title: 'Born a Crime', author: 'Trevor Noah', category: 'Non-Fiction', publisher: 'Penguin Random House', price: 17.99, description: 'Stories from a South African childhood during apartheid.' },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Non-Fiction', publisher: 'Penguin Random House', price: 18.99, description: 'A groundbreaking exploration of the two systems that drive how we think.' },
    { title: 'The Power of Habit', author: 'Charles Duhigg', category: 'Non-Fiction', publisher: 'Penguin Random House', price: 17.99, description: 'Why we do what we do in life and business.' },
    { title: 'Outliers', author: 'Malcolm Gladwell', category: 'Non-Fiction', publisher: 'Penguin Random House', price: 16.99, description: 'What makes high achievers different from the rest of us.' },
    { title: 'Quiet', author: 'Susan Cain', category: 'Non-Fiction', publisher: 'Penguin Random House', price: 17.99, description: 'The power of introverts in a world that can\'t stop talking.' },

    // Self-Help & Personal Development
    { title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help & Personal Development', publisher: 'Penguin Random House', price: 18.99, description: 'An easy and proven way to build good habits and break bad ones.' },
    { title: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey', category: 'Self-Help & Personal Development', publisher: 'Simon & Schuster', price: 17.99, description: 'Powerful lessons in personal change and effectiveness.' },
    { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', category: 'Self-Help & Personal Development', publisher: 'Simon & Schuster', price: 16.99, description: 'The timeless classic on interpersonal skills.' },
    { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', category: 'Self-Help & Personal Development', publisher: 'HarperCollins', price: 16.99, description: 'A counterintuitive approach to living a good life.' },
    { title: 'Can\'t Hurt Me', author: 'David Goggins', category: 'Self-Help & Personal Development', publisher: 'Lioncrest Publishing', price: 18.99, description: 'Master your mind and defy the odds.' },
    { title: 'Deep Work', author: 'Cal Newport', category: 'Self-Help & Personal Development', publisher: 'Hachette Book Group', price: 17.99, description: 'Rules for focused success in a distracted world.' },
    { title: 'Mindset', author: 'Carol Dweck', category: 'Self-Help & Personal Development', publisher: 'Penguin Random House', price: 16.99, description: 'The new psychology of success.' },
    { title: 'Grit', author: 'Angela Duckworth', category: 'Self-Help & Personal Development', publisher: 'Simon & Schuster', price: 17.99, description: 'The power of passion and perseverance.' },
    { title: 'Start with Why', author: 'Simon Sinek', category: 'Self-Help & Personal Development', publisher: 'Penguin Random House', price: 17.99, description: 'How great leaders inspire everyone to take action.' },
    { title: 'The Four Agreements', author: 'Don Miguel Ruiz', category: 'Self-Help & Personal Development', publisher: 'Amber-Allen Publishing', price: 14.99, description: 'A practical guide to personal freedom.' },

    // Business & Economics
    { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', category: 'Business & Economics', publisher: 'Plata Publishing', price: 17.99, description: 'What the rich teach their kids about money that the poor and middle class do not.' },
    { title: 'The Lean Startup', author: 'Eric Ries', category: 'Business & Economics', publisher: "O'Reilly Media", price: 24.99, description: 'How today\'s entrepreneurs use continuous innovation.' },
    { title: 'Zero to One', author: 'Peter Thiel', category: 'Business & Economics', publisher: 'Penguin Random House', price: 18.99, description: 'Notes on startups, or how to build the future.' },
    { title: 'Good to Great', author: 'Jim Collins', category: 'Business & Economics', publisher: 'HarperCollins', price: 22.99, description: 'Why some companies make the leap and others don\'t.' },
    { title: 'The 4-Hour Workweek', author: 'Timothy Ferriss', category: 'Business & Economics', publisher: 'Penguin Random House', price: 17.99, description: 'Escape 9-5, live anywhere, and join the new rich.' },
    { title: 'Principles', author: 'Ray Dalio', category: 'Business & Economics', publisher: 'Simon & Schuster', price: 24.99, description: 'Life and work principles from the founder of Bridgewater.' },
    { title: 'Think and Grow Rich', author: 'Napoleon Hill', category: 'Business & Economics', publisher: 'Penguin Random House', price: 14.99, description: 'The classic guide to achieving success and wealth.' },
    { title: 'The Intelligent Investor', author: 'Benjamin Graham', category: 'Business & Economics', publisher: 'HarperCollins', price: 22.99, description: 'The definitive book on value investing.' },
    { title: 'Leaders Eat Last', author: 'Simon Sinek', category: 'Business & Economics', publisher: 'Penguin Random House', price: 17.99, description: 'Why some teams pull together and others don\'t.' },
    { title: 'The Five Dysfunctions of a Team', author: 'Patrick Lencioni', category: 'Business & Economics', publisher: 'Wiley', price: 24.99, description: 'A leadership fable about teamwork.' },

    // Science & Technology
    { title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science & Technology', publisher: 'Penguin Random House', price: 18.99, description: 'From the Big Bang to black holes.' },
    { title: 'Cosmos', author: 'Carl Sagan', category: 'Science & Technology', publisher: 'Penguin Random House', price: 18.99, description: 'A personal voyage through the universe.' },
    { title: 'The Selfish Gene', author: 'Richard Dawkins', category: 'Science & Technology', publisher: 'Oxford University Press', price: 17.99, description: 'A revolutionary view of evolution.' },
    { title: 'A Short History of Nearly Everything', author: 'Bill Bryson', category: 'Science & Technology', publisher: 'Penguin Random House', price: 18.99, description: 'An entertaining journey through science.' },
    { title: 'The Elegant Universe', author: 'Brian Greene', category: 'Science & Technology', publisher: 'Penguin Random House', price: 17.99, description: 'Superstrings, hidden dimensions, and the quest for the ultimate theory.' },
    { title: 'Astrophysics for People in a Hurry', author: 'Neil deGrasse Tyson', category: 'Science & Technology', publisher: 'Penguin Random House', price: 14.99, description: 'The essential universe, delivered with typical wit.' },
    { title: 'The Structure of Scientific Revolutions', author: 'Thomas Kuhn', category: 'Science & Technology', publisher: 'University of Chicago Press', price: 16.99, description: 'How scientific paradigms change.' },
    { title: 'The Gene: An Intimate History', author: 'Siddhartha Mukherjee', category: 'Science & Technology', publisher: 'Simon & Schuster', price: 18.99, description: 'The story of the gene and its impact on humanity.' },
    { title: 'Why We Sleep', author: 'Matthew Walker', category: 'Science & Technology', publisher: 'Simon & Schuster', price: 17.99, description: 'Unlocking the power of sleep and dreams.' },
    { title: 'The Code Breaker', author: 'Walter Isaacson', category: 'Science & Technology', publisher: 'Simon & Schuster', price: 24.99, description: 'Jennifer Doudna, gene editing, and the future of the human race.' },

    // Programming & Software
    { title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming & Software', publisher: "O'Reilly Media", price: 42.99, description: 'A handbook of agile software craftsmanship.' },
    { title: 'The Pragmatic Programmer', author: 'David Thomas', category: 'Programming & Software', publisher: 'Pearson Education', price: 49.99, description: 'Your journey to mastery in software development.' },
    { title: 'Design Patterns', author: 'Gang of Four', category: 'Programming & Software', publisher: 'Pearson Education', price: 54.99, description: 'Elements of reusable object-oriented software.' },
    { title: 'Refactoring', author: 'Martin Fowler', category: 'Programming & Software', publisher: 'Pearson Education', price: 49.99, description: 'Improving the design of existing code.' },
    { title: 'Domain-Driven Design', author: 'Eric Evans', category: 'Programming & Software', publisher: 'Pearson Education', price: 59.99, description: 'Tackling complexity in the heart of software.' },
    { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Programming & Software', publisher: "O'Reilly Media", price: 29.99, description: 'The best parts of JavaScript.' },
    { title: 'You Don\'t Know JS', author: 'Kyle Simpson', category: 'Programming & Software', publisher: "O'Reilly Media", price: 39.99, description: 'A deep dive into the core mechanisms of JavaScript.' },
    { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', category: 'Programming & Software', publisher: 'No Starch Press', price: 34.99, description: 'A modern introduction to programming.' },
    { title: 'HTML and CSS', author: 'Jon Duckett', category: 'Programming & Software', publisher: 'Wiley', price: 29.99, description: 'Design and build websites.' },
    { title: 'Learning Python', author: 'Mark Lutz', category: 'Programming & Software', publisher: "O'Reilly Media", price: 59.99, description: 'Powerful object-oriented programming.' },
    { title: 'Effective Java', author: 'Joshua Bloch', category: 'Programming & Software', publisher: 'Pearson Education', price: 49.99, description: 'Best practices for the Java platform.' },
    { title: 'Introduction to Algorithms', author: 'Thomas Cormen', category: 'Programming & Software', publisher: 'MIT Press', price: 89.99, description: 'The comprehensive introduction to algorithms.' },
    { title: 'Cracking the Coding Interview', author: 'Gayle Laakmann McDowell', category: 'Programming & Software', publisher: 'CareerCup', price: 39.99, description: '189 programming questions and solutions.' },
    { title: 'System Design Interview', author: 'Alex Xu', category: 'Programming & Software', publisher: 'Independently Published', price: 35.99, description: 'An insider\'s guide to system design interviews.' },
    { title: 'Don\'t Make Me Think', author: 'Steve Krug', category: 'Programming & Software', publisher: 'New Riders', price: 39.99, description: 'A common sense approach to web usability.' },

    // Art & Design
    { title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Art & Design', publisher: 'Basic Books', price: 17.99, description: 'How design serves as communication between object and user.' },
    { title: 'Steal Like an Artist', author: 'Austin Kleon', category: 'Art & Design', publisher: 'Workman Publishing', price: 12.99, description: '10 things nobody told you about being creative.' },
    { title: 'Ways of Seeing', author: 'John Berger', category: 'Art & Design', publisher: 'Penguin Random House', price: 15.99, description: 'A groundbreaking work on visual culture.' },
    { title: 'The Story of Art', author: 'E.H. Gombrich', category: 'Art & Design', publisher: 'Phaidon', price: 39.99, description: 'The most famous art book in the world.' },
    { title: 'Interaction of Color', author: 'Josef Albers', category: 'Art & Design', publisher: 'Yale University Press', price: 19.99, description: 'A masterwork on the study of color.' },
    { title: 'Grid Systems', author: 'Josef Müller-Brockmann', category: 'Art & Design', publisher: 'Niggli', price: 55.99, description: 'A visual communication manual for graphic designers.' },
    { title: 'Thinking with Type', author: 'Ellen Lupton', category: 'Art & Design', publisher: 'Princeton Architectural Press', price: 24.99, description: 'A critical guide for designers.' },
    { title: 'Logo Design Love', author: 'David Airey', category: 'Art & Design', publisher: 'New Riders', price: 29.99, description: 'A guide to creating iconic brand identities.' },

    // Children's Books
    { title: 'Where the Wild Things Are', author: 'Maurice Sendak', category: "Children's Books", publisher: 'HarperCollins', price: 18.99, description: 'A classic picture book about imagination and adventure.' },
    { title: 'The Very Hungry Caterpillar', author: 'Eric Carle', category: "Children's Books", publisher: 'Penguin Random House', price: 12.99, description: 'A beloved story of transformation and growth.' },
    { title: 'Goodnight Moon', author: 'Margaret Wise Brown', category: "Children's Books", publisher: 'HarperCollins', price: 8.99, description: 'The quintessential bedtime story.' },
    { title: 'Charlotte\'s Web', author: 'E.B. White', category: "Children's Books", publisher: 'HarperCollins', price: 8.99, description: 'A tale of friendship between a pig and a spider.' },
    { title: 'Matilda', author: 'Roald Dahl', category: "Children's Books", publisher: 'Penguin Random House', price: 9.99, description: 'A brilliant girl with extraordinary powers.' },
    { title: 'The Cat in the Hat', author: 'Dr. Seuss', category: "Children's Books", publisher: 'Penguin Random House', price: 9.99, description: 'A Cat visits two children on a rainy day.' },
    { title: 'Percy Jackson: The Lightning Thief', author: 'Rick Riordan', category: "Children's Books", publisher: 'Scholastic', price: 12.99, description: 'A boy discovers he is the son of a Greek god.' },
    { title: 'Diary of a Wimpy Kid', author: 'Jeff Kinney', category: "Children's Books", publisher: 'Penguin Random House', price: 13.99, description: 'The hilarious adventures of Greg Heffley.' },
    { title: 'Wonder', author: 'R.J. Palacio', category: "Children's Books", publisher: 'Penguin Random House', price: 16.99, description: 'A boy with facial differences navigates school.' },
    { title: 'The Hunger Games', author: 'Suzanne Collins', category: "Children's Books", publisher: 'Scholastic', price: 14.99, description: 'In a dystopian future, teens fight to the death on TV.' },

    // Comics & Graphic Novels
    { title: 'Maus', author: 'Art Spiegelman', category: 'Comics & Graphic Novels', publisher: 'Penguin Random House', price: 35.99, description: 'A graphic novel about the Holocaust.' },
    { title: 'Watchmen', author: 'Alan Moore', category: 'Comics & Graphic Novels', publisher: 'DC Comics', price: 24.99, description: 'The groundbreaking deconstruction of superheroes.' },
    { title: 'Persepolis', author: 'Marjane Satrapi', category: 'Comics & Graphic Novels', publisher: 'Penguin Random House', price: 19.99, description: 'A memoir of growing up in Iran during the Islamic Revolution.' },
    { title: 'Saga Vol. 1', author: 'Brian K. Vaughan', category: 'Comics & Graphic Novels', publisher: 'Image Comics', price: 14.99, description: 'An epic space opera about two lovers from warring alien races.' },
    { title: 'Sandman Vol. 1', author: 'Neil Gaiman', category: 'Comics & Graphic Novels', publisher: 'DC Comics', price: 19.99, description: 'The Lord of Dreams is captured and must rebuild his realm.' },
    { title: 'Batman: The Dark Knight Returns', author: 'Frank Miller', category: 'Comics & Graphic Novels', publisher: 'DC Comics', price: 19.99, description: 'An aging Batman returns to fight crime.' },
    { title: 'V for Vendetta', author: 'Alan Moore', category: 'Comics & Graphic Novels', publisher: 'DC Comics', price: 19.99, description: 'A masked vigilante fights a fascist government.' },
    { title: 'Naruto Vol. 1', author: 'Masashi Kishimoto', category: 'Comics & Graphic Novels', publisher: 'VIZ Media', price: 9.99, description: 'A young ninja strives to become the strongest in his village.' },
    { title: 'One Piece Vol. 1', author: 'Eiichiro Oda', category: 'Comics & Graphic Novels', publisher: 'VIZ Media', price: 9.99, description: 'A boy sets out to become the Pirate King.' },
    { title: 'Attack on Titan Vol. 1', author: 'Hajime Isayama', category: 'Comics & Graphic Novels', publisher: 'Kodansha', price: 10.99, description: 'Humanity fights for survival against man-eating giants.' },

    // Health & Wellness
    { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', category: 'Health & Wellness', publisher: 'Penguin Random House', price: 18.99, description: 'Brain, mind, and body in the healing of trauma.' },
    { title: 'Breath', author: 'James Nestor', category: 'Health & Wellness', publisher: 'Penguin Random House', price: 18.99, description: 'The new science of a lost art.' },
    { title: 'The Obesity Code', author: 'Jason Fung', category: 'Health & Wellness', publisher: 'Greystone Books', price: 17.99, description: 'Unlocking the secrets of weight loss.' },
    { title: 'How Not to Die', author: 'Michael Greger', category: 'Health & Wellness', publisher: 'Macmillan Publishers', price: 19.99, description: 'Discover the foods scientifically proven to prevent disease.' },
    { title: 'The Whole30', author: 'Melissa Hartwig', category: 'Health & Wellness', publisher: 'Houghton Mifflin Harcourt', price: 24.99, description: 'The 30-day guide to total health and food freedom.' },
    { title: 'Born to Run', author: 'Christopher McDougall', category: 'Health & Wellness', publisher: 'Penguin Random House', price: 16.99, description: 'A hidden tribe, superathletes, and the greatest race.' },
    { title: 'Yoga Anatomy', author: 'Leslie Kaminoff', category: 'Health & Wellness', publisher: 'Human Kinetics', price: 24.99, description: 'Your illustrated guide to postures, movements, and breathing.' },
    { title: 'The Sleep Revolution', author: 'Arianna Huffington', category: 'Health & Wellness', publisher: 'Penguin Random House', price: 16.99, description: 'Transforming your life one night at a time.' },

    // Cooking & Food
    { title: 'Salt, Fat, Acid, Heat', author: 'Samin Nosrat', category: 'Cooking & Food', publisher: 'Simon & Schuster', price: 35.99, description: 'Mastering the elements of good cooking.' },
    { title: 'The Food Lab', author: 'J. Kenji López-Alt', category: 'Cooking & Food', publisher: 'W.W. Norton', price: 49.99, description: 'Better home cooking through science.' },
    { title: 'Joy of Cooking', author: 'Irma Rombauer', category: 'Cooking & Food', publisher: 'Simon & Schuster', price: 40.00, description: 'The essential American cookbook.' },
    { title: 'Mastering the Art of French Cooking', author: 'Julia Child', category: 'Cooking & Food', publisher: 'Penguin Random House', price: 40.00, description: 'The classic guide to French cuisine.' },
    { title: 'Jerusalem', author: 'Yotam Ottolenghi', category: 'Cooking & Food', publisher: 'Penguin Random House', price: 35.99, description: 'A cookbook celebrating the diverse cuisine of Jerusalem.' },
    { title: 'Plenty', author: 'Yotam Ottolenghi', category: 'Cooking & Food', publisher: 'Penguin Random House', price: 35.99, description: 'Vibrant vegetable recipes.' },
    { title: 'The Flavor Bible', author: 'Karen Page', category: 'Cooking & Food', publisher: 'Hachette Book Group', price: 35.99, description: 'The essential guide to culinary creativity.' },
    { title: 'Bread', author: 'Jeffrey Hamelman', category: 'Cooking & Food', publisher: 'Wiley', price: 45.00, description: 'A baker\'s book of techniques and recipes.' },

    // Travel & Adventure
    { title: 'Into the Wild', author: 'Jon Krakauer', category: 'Travel & Adventure', publisher: 'Penguin Random House', price: 16.99, description: 'The story of Christopher McCandless and his fatal Alaska adventure.' },
    { title: 'Wild', author: 'Cheryl Strayed', category: 'Travel & Adventure', publisher: 'Penguin Random House', price: 16.99, description: 'A woman\'s journey of self-discovery on the Pacific Crest Trail.' },
    { title: 'In a Sunburned Country', author: 'Bill Bryson', category: 'Travel & Adventure', publisher: 'Penguin Random House', price: 16.99, description: 'A hilarious journey through Australia.' },
    { title: 'The Beach', author: 'Alex Garland', category: 'Travel & Adventure', publisher: 'Penguin Random House', price: 15.99, description: 'A young backpacker searches for paradise in Thailand.' },
    { title: 'On the Road', author: 'Jack Kerouac', category: 'Travel & Adventure', publisher: 'Penguin Random House', price: 16.99, description: 'The Beat Generation classic about a cross-country journey.' },
    { title: 'Lonely Planet: Ultimate Travel', author: 'Lonely Planet', category: 'Travel & Adventure', publisher: 'Lonely Planet', price: 29.99, description: 'Our list of the 500 best places to see.' },
    { title: 'A Walk in the Woods', author: 'Bill Bryson', category: 'Travel & Adventure', publisher: 'Penguin Random House', price: 16.99, description: 'Rediscovering America on the Appalachian Trail.' },
    { title: 'Eat Pray Love', author: 'Elizabeth Gilbert', category: 'Travel & Adventure', publisher: 'Penguin Random House', price: 16.99, description: 'One woman\'s search for everything across Italy, India and Indonesia.' },
];

// Book cover images from Unsplash (free to use)
const BOOK_IMAGES = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
    'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400',
    'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400',
];

// User names for seeding
const USER_FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'];
const USER_LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

// REVIEW CONTENTS
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
    'Not my favorite, but still worth reading.',
    'Average book, nothing special.',
    'Expected more based on the reviews.',
    'Disappointing ending, but good overall.',
    null, // Some ratings without content
    null,
];

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    NUM_USERS: 50,
    NUM_ORDERS: 500,
    MAX_ITEMS_PER_ORDER: 4,
    NUM_RATINGS: 800,
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(monthsAgo: number): Date {
    const now = new Date();
    const past = new Date();
    past.setMonth(past.getMonth() - monthsAgo);
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function main() {
    console.log('🌱 Starting database seeding with REALISTIC data...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. CLEAN UP OLD DATA
    console.log('🗑️ Cleaning up old data...');
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

    // 2. CREATE PAYMENT METHODS
    console.log('💳 Creating payment methods...');
    const paymentMethods = await Promise.all([
        prisma.paymentMethod.create({ data: { name: 'COD (Cash on Delivery)' } }),
        prisma.paymentMethod.create({ data: { name: 'PayPal' } }),
        prisma.paymentMethod.create({ data: { name: 'Stripe' } }),
        prisma.paymentMethod.create({ data: { name: 'Credit Card' } }),
    ]);

    // 3. CREATE PUBLISHERS
    console.log('🏢 Creating publishers...');
    const publishers: Record<string, any> = {};
    for (const name of PUBLISHERS) {
        publishers[name] = await prisma.publisher.create({ data: { name } });
    }

    // 4. CREATE AUTHORS
    console.log('✍️ Creating authors...');
    const authors: Record<string, any> = {};
    for (const name of AUTHORS) {
        authors[name] = await prisma.author.create({ data: { name } });
    }
    // Also create authors from book data that might not be in AUTHORS list
    for (const book of BOOKS_DATA) {
        if (!authors[book.author]) {
            authors[book.author] = await prisma.author.create({ data: { name: book.author } });
        }
    }

    // 5. CREATE CATEGORIES (with hierarchy)
    console.log('🗂️ Creating categories...');
    const categories: Record<string, any> = {};

    for (const cat of CATEGORIES) {
        const parent = await prisma.category.create({ data: { name: cat.name } });
        categories[cat.name] = parent;

        for (const childName of cat.children) {
            categories[childName] = await prisma.category.create({
                data: { name: childName, parentCategoryId: parent.id }
            });
        }
    }

    // 6. CREATE USERS
    console.log('👤 Creating users...');

    // Admin user
    const adminUser = await prisma.user.create({
        data: {
            username: 'admin',
            email: 'admin@bookstore.com',
            password: hashedPassword,
            fullName: 'Administrator',
            role: Role.ADMIN,
            phone: '+1-555-0100',
            address: '123 Admin Street, New York, NY 10001',
        },
    });

    // Regular users
    const users: any[] = [];
    for (let i = 0; i < CONFIG.NUM_USERS; i++) {
        const firstName = randomElement(USER_FIRST_NAMES);
        const lastName = randomElement(USER_LAST_NAMES);
        const user = await prisma.user.create({
            data: {
                username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
                password: hashedPassword,
                fullName: `${firstName} ${lastName}`,
                role: Role.USER,
                phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
                address: `${randomInt(100, 9999)} ${randomElement(['Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm'])} ${randomElement(['Street', 'Avenue', 'Boulevard', 'Drive', 'Lane'])}, ${randomElement(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'])}`,
            },
        });
        users.push(user);
    }

    // 7. CREATE BOOKS
    console.log('📚 Creating books...');
    const books: any[] = [];

    for (let i = 0; i < BOOKS_DATA.length; i++) {
        const bookData = BOOKS_DATA[i];

        // Find or create publisher
        let publisherId: string;
        if (publishers[bookData.publisher]) {
            publisherId = publishers[bookData.publisher].id;
        } else {
            const newPub = await prisma.publisher.create({ data: { name: bookData.publisher } });
            publishers[bookData.publisher] = newPub;
            publisherId = newPub.id;
        }

        // Find category
        const categoryId = categories[bookData.category]?.id || categories['Fiction'].id;

        const book = await prisma.book.create({
            data: {
                title: bookData.title,
                price: bookData.price,
                stock: randomInt(10, 100),
                description: bookData.description,
                imageUrl: BOOK_IMAGES[i % BOOK_IMAGES.length],
                publisherId,
                categoryId,
            },
        });

        // Link author
        if (authors[bookData.author]) {
            await prisma.bookAuthor.create({
                data: {
                    bookId: book.id,
                    authorId: authors[bookData.author].id,
                },
            });
        }

        books.push(book);
    }

    // 8. CREATE CARTS
    console.log('🛒 Creating carts...');
    for (const user of users.slice(0, 20)) {
        const cart = await prisma.cart.create({
            data: { userId: user.id, total: 0 },
        });

        const randomBooks = [];
        const numItems = randomInt(1, 3);
        for (let i = 0; i < numItems; i++) {
            let book = randomElement(books);
            while (randomBooks.includes(book)) {
                book = randomElement(books);
            }
            randomBooks.push(book);
        }

        let cartTotal = 0;
        for (const book of randomBooks) {
            const qty = randomInt(1, 2);
            await prisma.cartItem.create({
                data: { cartId: cart.id, bookId: book.id, quantity: qty },
            });
            cartTotal += book.price * qty;
        }

        await prisma.cart.update({
            where: { id: cart.id },
            data: { total: cartTotal },
        });
    }

    // 9. CREATE ORDERS
    console.log('📦 Creating orders...');
    const statuses = Object.values(OrderStatus);

    for (let i = 0; i < CONFIG.NUM_ORDERS; i++) {
        const randomUser = randomElement(users);
        const numItems = randomInt(1, CONFIG.MAX_ITEMS_PER_ORDER);

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
            const qty = randomInt(1, 3);
            orderTotal += book.price * qty;
            return { bookId: book.id, quantity: qty, price: book.price };
        });

        const status = randomElement(statuses);
        let confirmedById = null;
        if (['SHIPPED', 'DELIVERED', 'PROCESSING'].includes(status)) {
            confirmedById = adminUser.id;
        }

        const order = await prisma.order.create({
            data: {
                userId: randomUser.id,
                total: orderTotal,
                status,
                confirmedById,
                shippingAddress: randomUser.address || '123 Default Street',
                orderDate: randomDate(6),
                items: { create: orderItemsData },
            },
        });

        // Create Payment
        if (status !== 'CANCELLED') {
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
                    paymentDate: paymentStatus === 'COMPLETED' ? new Date() : null,
                },
            });
        }
    }

    // 10. CREATE RATINGS
    console.log('⭐ Creating ratings...');
    const userBookPairs = new Set<string>();

    for (let i = 0; i < CONFIG.NUM_RATINGS; i++) {
        const randomUser = randomElement(users);
        const randomBook = randomElement(books);
        const pairKey = `${randomUser.id}-${randomBook.id}`;

        if (userBookPairs.has(pairKey)) continue;
        userBookPairs.add(pairKey);

        const rating = await prisma.rating.create({
            data: {
                userId: randomUser.id,
                bookId: randomBook.id,
                stars: randomInt(3, 5), // Mostly positive reviews
                content: randomElement(REVIEW_CONTENTS),
            },
        });

        // Add some votes
        if (Math.random() > 0.6) {
            const voter = randomElement(users);
            if (voter.id !== randomUser.id) {
                await prisma.ratingVote.create({
                    data: {
                        ratingId: rating.id,
                        userId: voter.id,
                        voteType: Math.random() > 0.2 ? 1 : -1,
                    },
                }).catch(() => { }); // Ignore duplicates
            }
        }
    }

    // SUMMARY
    console.log('\n✅ SEEDING COMPLETE!');
    console.log('========================================');
    console.log(`📚 Books: ${books.length}`);
    console.log(`👤 Users: ${users.length + 1} (1 admin + ${users.length} regular)`);
    console.log(`📦 Orders: ${CONFIG.NUM_ORDERS}`);
    console.log(`⭐ Ratings: ${userBookPairs.size}`);
    console.log(`🗂️ Categories: ${Object.keys(categories).length}`);
    console.log(`✍️ Authors: ${Object.keys(authors).length}`);
    console.log(`🏢 Publishers: ${Object.keys(publishers).length}`);
    console.log('========================================');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@bookstore.com / password123');
    console.log('   User:  james.smith0@email.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
