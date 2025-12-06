
import { Marquee } from './effects/Marquee';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Regular Reader",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    content: "The best bookstore I've ever visited! The collection is vast and the delivery speed is incredible.",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Book Collector",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    content: "Found rare editions I couldn't find anywhere else. The packaging was perfect.",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Davis",
    role: "Literature Student",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    content: "Great prices and amazing customer service. Highly recommended for all book lovers!",
    rating: 4
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Fiction Enthusiast",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    content: "The website is so easy to use and the recommendations are always spot on.",
    rating: 5
  },
  {
    id: 5,
    name: "Emma Thompson",
    role: "Library Manager",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    content: "A treasure trove for bookworms. I spend hours just browsing through their collection.",
    rating: 5
  },
  {
    id: 6,
    name: "James Anderson",
    role: "Sci-Fi Fan",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
    content: "Fast delivery and the books arrive in pristine condition every single time.",
    rating: 4
  },
];

const ReviewCard = ({ review }: { review: typeof REVIEWS[0] }) => (
  <div className="flex flex-col p-6 w-[350px] h-[200px] bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 mx-4 shrink-0">
    <div className="flex items-center gap-4 mb-4">
      <img 
        src={review.avatar} 
        alt={review.name} 
        className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
      />
      <div>
        <h4 className="font-bold text-gray-900">{review.name}</h4>
        <p className="text-xs text-blue-600 font-medium">{review.role}</p>
      </div>
      <div className="ml-auto flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 italic">
      "{review.content}"
    </p>
  </div>
);

export const CustomerReviews = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-gray-50/50">
      <div className="container mx-auto px-4 mb-12 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Readers</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Join thousands of satisfied customers who have found their next favorite story with us.
        </p>
      </div>

      <div className="flex flex-col gap-8 relative z-10">
        <Marquee direction="left" speed={40}>
          {REVIEWS.map((review) => (
            <ReviewCard key={`row1-${review.id}`} review={review} />
          ))}
        </Marquee>

        <Marquee direction="right" speed={45}>
          {REVIEWS.slice().reverse().map((review) => (
            <ReviewCard key={`row2-${review.id}`} review={review} />
          ))}
        </Marquee>

        <Marquee direction="left" speed={50}>
           {/* Shifted content for variety */}
          {[...REVIEWS.slice(3), ...REVIEWS.slice(0, 3)].map((review) => (
            <ReviewCard key={`row3-${review.id}`} review={review} />
          ))}
        </Marquee>
      </div>
      
      {/* Overlay Gradients for smooth fade at edges */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-20 pointer-events-none" />
    </section>
  );
};
