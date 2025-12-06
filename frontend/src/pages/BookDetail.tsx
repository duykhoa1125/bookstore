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
  Minus,
  Plus,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw
} from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingContent, setRatingContent] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

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
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="font-medium">You have already reviewed this book. Update?</span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                onClick={() => {
                  toast.dismiss(t.id);
                  handleUpdateReview(variables);
                }}
              >
                Update
              </button>
              <button
                className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300"
                onClick={() => toast.dismiss(t.id)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) as any);
        return;
      }
      toast.error(error?.response?.data?.message || "Failed to add rating");
    },
  });

  const handleUpdateReview = (variables: { stars: number; content: string }) => {
    api.createRating({
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
      toast.error(err?.response?.data?.message || "Failed to update rating");
    });
  };

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
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const book = bookData?.data;

  if (!book) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Book not found</h2>
        <p className="text-gray-500 mb-6">The book you are looking for does not exist.</p>
        <button
          onClick={() => navigate("/books")}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition w-fit"
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
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Product Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            {/* Image Gallery */}
            <div className="product-image-container mb-8 lg:mb-0">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-xl border border-gray-100 relative group">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-32 w-32 text-gray-300" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                   {book.stock < 5 && book.stock > 0 && (
                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                      Low Stock
                    </span>
                   )}
                   {book.stock === 0 && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                      Sold Out
                    </span>
                   )}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {book.category && (
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100">
                      {book.category.name}
                    </span>
                  )}
                  {(book.averageRating || 0) > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold">{(book.averageRating || 0).toFixed(1)}</span>
                      <span className="text-xs text-amber-600/70 font-medium">({book.ratings?.length || 0} reviews)</span>
                    </div>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
                  {book.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm border-b border-gray-100 pb-6 mb-6">
                  {book.authors && book.authors.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="p-1.5 bg-gray-100 rounded-full">
                        <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span className="font-medium">Author:</span>
                      <span className="font-bold text-gray-900">{book.authors.map(a => a.author.name).join(', ')}</span>
                    </div>
                  )}
                  {book.publisher && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="p-1.5 bg-gray-100 rounded-full">
                        <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span className="font-medium">Publisher:</span>
                      <span className="font-bold text-gray-900">{book.publisher.name}</span>
                    </div>
                  )}
                </div>

                <div className="prose prose-lg text-gray-600 leading-relaxed mb-8 max-w-none">
                  {book.description || "No description available for this book."}
                </div>
              </div>

              {/* Buy Box */}
              <div className="mt-auto bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Price</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black text-gray-900 tracking-tight">${book.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${book.stock > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    <div className={`w-2 h-2 rounded-full ${book.stock > 0 ? 'bg-green-600 animate-pulse' : 'bg-red-500'}`}></div>
                    {book.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl h-14 px-2 shadow-sm min-w-[140px]">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      disabled={quantity <= 1 || book.stock === 0}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold text-gray-900 tabular-nums">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      disabled={quantity >= book.stock || book.stock === 0}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={book.stock === 0 || addToCartMutation.isPending}
                    className={`flex-1 flex items-center justify-center gap-3 h-14 px-8 text-lg font-bold text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all transform active:scale-[0.98] ${
                      book.stock > 0
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        : "bg-gray-300 cursor-not-allowed shadow-none"
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {book.stock > 0 ? "Add to Cart" : "Sold Out"}
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-x-4 pt-6 border-t border-gray-200/60">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold leading-tight">Fast<br/>Delivery</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold leading-tight">Secure<br/>Payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold leading-tight">Easy<br/>Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Reviews Sidebar / Stats */}
          <div className="lg:col-span-4 mb-10 lg:mb-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="text-5xl font-bold text-gray-900">{book.averageRating?.toFixed(1) || "0.0"}</div>
                 <div className="flex flex-col">
                    <div className="flex text-amber-400 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= (book.averageRating || 0)
                              ? "fill-current"
                              : "text-gray-200 fill-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{book.ratings?.length || 0} verified ratings</span>
                 </div>
              </div>

              {/* Write Review Trigger */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Review this product</h4>
                <p className="text-sm text-gray-500 mb-4">Share your thoughts with other customers</p>
                
                {!isAuthenticated ? (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 px-4 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-400 transition-all"
                  >
                    Log in to write a review
                  </button>
                ) : (
                  <form onSubmit={handleSubmitRating} className="space-y-4">
                     <div>
                       <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                         Your Rating
                       </label>
                       <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingStars(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-8 w-8 transition-colors ${
                                  star <= (hoverRating || ratingStars)
                                    ? "text-amber-400 fill-current"
                                    : "text-gray-200 fill-gray-200"
                                }`}
                              />
                            </button>
                          ))}
                       </div>
                     </div>
                     
                     <div>
                       <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                         Review Content
                       </label>
                       <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.fullName || "User"}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm">
                                {user?.fullName?.charAt(0).toUpperCase() || <UserIcon className="w-5 h-5" />}
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                             <textarea
                              rows={4}
                              value={ratingContent}
                              onChange={(e) => setRatingContent(e.target.value)}
                              placeholder="What did you like or dislike? Share your thoughts..."
                              className="w-full rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 text-sm resize-none transition-all p-2"
                             />
                          </div>
                       </div>
                     </div>

                     <button
                      type="submit"
                      disabled={addRatingMutation.isPending || ratingStars === 0}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all"
                     >
                       {addRatingMutation.isPending ? 'Submitting...' : 'Submit Review'}
                     </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-8">
             <h3 className="text-lg font-bold text-gray-900 mb-6">Top Reviews</h3>
             
             <div className="space-y-4">
              {ratingsData?.data && ratingsData.data.length > 0 ? (
                ratingsData.data.map((rating: any) => (
                  <div
                    key={rating.id}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full flex-shrink-0 overflow-hidden border border-gray-200 shadow-sm">
                             {rating.user?.avatar ? (
                               <img 
                                 src={rating.user.avatar} 
                                 alt={rating.user.fullName || "User"} 
                                 className="w-full h-full object-cover"
                               />
                             ) : (
                               <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                 {rating.user?.fullName?.charAt(0).toUpperCase() || <UserIcon className="h-5 w-5" />}
                               </div>
                             )}
                          </div>
                          <div>
                             <h4 className="font-bold text-gray-900 text-sm">
                               {rating.user?.fullName || rating.user?.username || "Anonymous"}
                             </h4>
                             <div className="flex items-center text-xs text-gray-500">
                               <Check className="w-3 h-3 text-green-500 mr-1" />
                               Verified Purchase
                             </div>
                          </div>
                       </div>
                       <span className="text-xs text-gray-400 font-medium">
                          {new Date(rating.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                       </span>
                    </div>
                    
                    <div className="flex text-amber-400 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= rating.stars ? "fill-current" : "text-gray-200 fill-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {rating.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Star className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">No reviews yet</h3>
                  <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
                </div>
              )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
