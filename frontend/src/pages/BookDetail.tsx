import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import {
  BookOpen,
  ShoppingCart,
  Star,
  User as UserIcon,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingContent, setRatingContent] = useState("");

  const { data: bookData, isLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: () => api.getBook(id!),
    enabled: !!id,
  });

  const { data: ratingsData } = useQuery({
    queryKey: ["ratings", id],
    queryFn: () => api.getRatingsByBook(id!),
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: (qty: number) => api.addToCart({ bookId: id!, quantity: qty }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
      setQuantity(1);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    },
  });

  const addRatingMutation = useMutation({
    mutationFn: (data: { stars: number; content: string }) =>
      api.createRating({ bookId: id!, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings", id] });
      queryClient.invalidateQueries({ queryKey: ["book", id] });
      toast.success("Rating added!");
      setRatingStars(0);
      setRatingContent("");
    },
    onError: (error: any, variables) => {
      if (error?.response?.status === 409) {
        const confirmed = window.confirm(
          "You have reviewed this book before, do you want to update your review?"
        );
        if (confirmed) {
          api
            .createRating({
              bookId: id!,
              stars: variables.stars,
              content: variables.content,
              replaceIfExists: true,
            })
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["ratings", id] });
              queryClient.invalidateQueries({ queryKey: ["book", id] });
              toast.success("Rating updated!");
              setRatingStars(0);
              setRatingContent("");
            })
            .catch((err) => {
              toast.error(
                err?.response?.data?.message || "Failed to update rating"
              );
            });
        }
        return;
      }
      toast.error(error?.response?.data?.message || "Failed to add rating");
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      navigate("/login");
      return;
    }
    addToCartMutation.mutate(quantity);
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to rate");
      navigate("/login");
      return;
    }
    if (ratingStars === 0) {
      toast.error("Please select a star rating");
      return;
    }
    addRatingMutation.mutate({ stars: ratingStars, content: ratingContent });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const book = bookData?.data;

  if (!book) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Book not found</h2>
        <button
          onClick={() => navigate("/books")}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Back to Books
        </button>
      </div>
    );
  }

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase' && quantity < (book?.stock || 0)) {
      setQuantity(prev => prev + 1)
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-blue-600 transition-colors">Home</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate('/books')} className="hover:text-blue-600 transition-colors">Books</button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{book.title}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="md:flex">
            {/* Image Section */}
            <div className="md:w-1/3 p-8 bg-gray-50/50 flex items-center justify-center">
              <div className="relative aspect-[3/4] w-full max-w-sm rounded-lg overflow-hidden shadow-lg group">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <BookOpen className="h-24 w-24 text-gray-400" />
                  </div>
                )}
                {book.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold transform -rotate-12">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="md:w-2/3 p-8 lg:p-12">
              <div className="flex flex-col h-full">
                <div className="mb-auto">
                  <div className="flex items-center space-x-2 mb-4">
                    {book.category && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                        {book.category.name}
                      </span>
                    )}
                    {book.publisher && (
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                        {book.publisher.name}
                      </span>
                    )}
                  </div>

                  <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {book.title}
                  </h1>

                  <div className="flex items-center space-x-6 mb-8">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= (book.averageRating || 0)
                                ? "fill-current"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-500">
                        ({book.ratings?.length || 0} reviews)
                      </span>
                    </div>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <div className="text-sm text-gray-500">
                      By <span className="font-medium text-gray-900">{book.authors?.map(a => a.author.name).join(', ')}</span>
                    </div>
                  </div>

                  <div className="prose prose-blue max-w-none mb-8 text-gray-600 leading-relaxed">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p>{book.description || "No description available."}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-8 mt-8">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Price</p>
                      <div className="text-4xl font-bold text-blue-600">
                        ${book.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Availability</p>
                      <p className={`font-medium ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                      <button
                        onClick={() => handleQuantityChange('decrease')}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-gray-100 text-gray-600 disabled:opacity-50 transition-colors rounded-l-lg"
                      >
                        <span className="text-xl font-bold">-</span>
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.min(Math.max(1, val), book.stock));
                        }}
                        className="w-16 text-center bg-transparent border-none focus:ring-0 font-semibold text-gray-900"
                        min="1"
                        max={book.stock}
                      />
                      <button
                        onClick={() => handleQuantityChange('increase')}
                        disabled={quantity >= book.stock}
                        className="p-3 hover:bg-gray-100 text-gray-600 disabled:opacity-50 transition-colors rounded-r-lg"
                      >
                        <span className="text-xl font-bold">+</span>
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={book.stock === 0 || addToCartMutation.isPending}
                      className={`flex-1 flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl shadow-lg transform transition hover:-translate-y-0.5 ${
                        book.stock > 0
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      }`}
                    >
                      <ShoppingCart className="h-6 w-6 mr-2" />
                      {book.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              Customer Reviews
              <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                {book.ratings?.length || 0}
              </span>
            </h2>

            <div className="space-y-4">
              {ratingsData?.data && ratingsData.data.length > 0 ? (
                ratingsData.data.map((rating: any) => (
                  <div
                    key={rating.id}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold">
                          {rating.user?.fullName?.charAt(0) || <UserIcon className="h-5 w-5" />}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-bold text-gray-900">
                            {rating.user?.fullName || rating.user?.username || "Anonymous"}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(rating.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= rating.stars ? "fill-current" : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{rating.content}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                    <Star className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
                  <p className="text-gray-500">Be the first to share your thoughts on this book!</p>
                </div>
              )}
            </div>
          </div>

          {/* Write Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Write a Review</h3>
              
              {isAuthenticated ? (
                <form onSubmit={handleSubmitRating} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingStars(star)}
                          className="focus:outline-none transform transition hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= ratingStars
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 hover:text-yellow-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="review"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Your Review
                    </label>
                    <textarea
                      id="review"
                      rows={5}
                      value={ratingContent}
                      onChange={(e) => setRatingContent(e.target.value)}
                      className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors resize-none p-4"
                      placeholder="What did you like or dislike? What did you use this product for?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addRatingMutation.isPending}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all hover:shadow-lg"
                  >
                    {addRatingMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 mb-4">Please log in to write a review</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Log In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
