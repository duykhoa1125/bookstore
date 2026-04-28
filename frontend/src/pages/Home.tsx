import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { 
  BookOpen, 
  Award, 
  ArrowRight, 
  Truck, 
  Zap, 
  LayoutGrid,
  ChevronRight
} from "lucide-react";
import { BookCard } from "../components/BookCard";
import { BookGridSkeleton } from "../components/SkeletonLoaders";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { AxiosError } from "axios";

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: booksData,
    isLoading: isLoadingBooks,
    error: booksError,
  } = useQuery({
    queryKey: ["books", "featured"],
    queryFn: () => api.getBooks(),
    retry: (failureCount, error: AxiosError) => {
      if (error?.response?.status === 429) return false;
      return failureCount < 1;
    },
  });

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
  });

  const addToCartMutation = useMutation({
    mutationFn: (bookId: string) => api.addToCart({ bookId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Book added to cart!");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    },
  });

  const handleAddToCart = (e: React.MouseEvent, bookId: string) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    addToCartMutation.mutate(bookId);
  };

  const featuredBooks = (booksData?.data || []).slice(0, 8);
  const mainCategories = (categoriesData?.data || []).slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-hero-pattern">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-8 animate-slideInUp">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium text-sm border border-blue-100">
                <Zap className="w-4 h-4 fill-current" />
                <span>New Season Arrivals are here!</span>
              </div>
              <h1 className="text-responsive-3xl font-extrabold text-gray-900 leading-tight">
                Discover Your Next <br className="hidden lg:block" />
                <span className="gradient-text">Great Adventure</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Explore our curated collection of over 10,000 titles from worldwide authors. 
                From timeless classics to modern bestsellers, find the story that speaks to you.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/books"
                  className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-blue-600 hover:scale-105 transition-all shadow-lg hover:shadow-blue-200"
                >
                  Explore Collection
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all"
                >
                  Learn More
                </Link>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">10k+</p>
                  <p className="text-sm text-gray-500">Books</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">5k+</p>
                  <p className="text-sm text-gray-500">Authors</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">50k+</p>
                  <p className="text-sm text-gray-500">Happy Readers</p>
                </div>
              </div>
            </div>
            <div className="flex-1 relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="relative z-10 grid grid-cols-2 gap-4 animate-float">
                  <div className="space-y-4 pt-12">
                    <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600" alt="Book cover" className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl transform -rotate-6 transition-transform hover:rotate-0 duration-500" />
                    <img src="https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=600" alt="Book cover" className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl transform rotate-3 transition-transform hover:rotate-0 duration-500" />
                  </div>
                  <div className="space-y-4">
                    <img src="https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=600" alt="Book cover" className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl transform rotate-6 transition-transform hover:rotate-0 duration-500" />
                    <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600" alt="Book cover" className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl transform -rotate-3 transition-transform hover:rotate-0 duration-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features Row */}
      <section className="py-12 bg-white relative z-20 -mt-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Curated Library", desc: "Expertly selected titles", color: "blue" },
              { icon: Truck, title: "Global Shipping", desc: "Fast delivery to your door", color: "green" },
              { icon: Award, title: "Certified Authentic", desc: "100% original publications", color: "purple" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all group">
                <div className={`p-4 bg-${feature.color}-50 text-${feature.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore by Category</h2>
              <p className="text-gray-500">Find exactly what you're looking for</p>
            </div>
            <Link to="/books" className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {isLoadingCategories ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-2xl" />)
            ) : (
              mainCategories.map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/books?categoryId=${cat.id}`}
                  className="group p-6 bg-white rounded-2xl border border-gray-100 text-center hover:shadow-lg hover:border-blue-200 transition-all"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm truncate">{cat.name}</h3>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Collection</h2>
              <p className="text-gray-500">Handpicked books that are trending right now</p>
            </div>
            <Link
              to="/books"
              className="group flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-blue-600 transition-all shadow-md"
            >
              View All Books
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoadingBooks ? (
            <BookGridSkeleton count={8} />
          ) : booksError ? (
            <div className="text-center py-10 bg-red-50 rounded-xl text-red-600 border border-red-100">
              Error loading books. Please try again later.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {featuredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={addToCartMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
