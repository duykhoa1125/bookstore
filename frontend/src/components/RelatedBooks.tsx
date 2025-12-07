import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Book } from '../types';
import { api } from '../lib/api';
import { Star, BookOpen, ShoppingCart, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface RelatedBooksProps {
  bookId: string;
}

export function RelatedBooks({ bookId }: RelatedBooksProps) {
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: (bookId: string) => api.addToCart({ bookId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!');
    },
    onError: () => {
      toast.error('Failed to add to cart');
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['relatedBooks', bookId],
    queryFn: async () => {
      const response = await api.getRelatedBooks(bookId, 6);
      return response.data;
    },
    enabled: !!bookId,
  });

  const handleAddToCart = async (e: React.MouseEvent, book: Book) => {
    e.preventDefault();
    e.stopPropagation();
    if (book.stock > 0) {
      addToCartMutation.mutate(book.id);
    }
  };

  if (isLoading) {
    return (
      <section className="mt-12 pt-8 border-t border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Related Books</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-[3/4] mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || !data || data.length === 0) {
    return null; // Don't show section if no related books
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Related Books</h2>
        <Link
          to="/books"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {data.map((book) => (
          <RelatedBookCard
            key={book.id}
            book={book}
            onAddToCart={handleAddToCart}
            isAdding={addToCartMutation.isPending}
          />
        ))}
      </div>
    </section>
  );
}

interface RelatedBookCardProps {
  book: Book;
  onAddToCart: (e: React.MouseEvent, book: Book) => void;
  isAdding: boolean;
}

function RelatedBookCard({ book, onAddToCart, isAdding }: RelatedBookCardProps) {
  const averageRating = book.averageRating || 0;

  return (
    <Link
      to={`/books/${book.id}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-all duration-300">
        {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
            <BookOpen className="w-10 h-10" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick add button */}
        {book.stock > 0 && (
          <button
            onClick={(e) => onAddToCart(e, book)}
            disabled={isAdding}
            className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        )}

        {/* Stock badge */}
        {book.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow">
            Sold Out
          </div>
        )}
      </div>

      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors leading-snug">
        {book.title}
      </h3>

      {book.authors && book.authors.length > 0 && (
        <p className="text-xs text-gray-500 truncate mb-1.5">
          {book.authors.map(a => a.author.name).join(', ')}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-gray-900">${book.price.toFixed(2)}</span>
        
        <div className="flex items-center gap-0.5">
          <Star className={`w-3 h-3 ${averageRating > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
          <span className="text-xs text-gray-500">
            {averageRating > 0 ? averageRating.toFixed(1) : '-'}
          </span>
        </div>
      </div>
    </Link>
  );
}
