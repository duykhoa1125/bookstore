import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type {
  User,
  Book,
  Category,
  Author,
  Publisher,
  Cart,
  CartItem,
  Order,
  PaymentMethod,
  ApiResponse,
  LoginInput,
  RegisterInput,
  AddToCartInput,
  UpdateCartItemInput,
  CreateOrderInput,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        if (error.response?.status === 429) {
          // Rate limit exceeded - show user-friendly message
          const retryAfter = error.response.headers["retry-after"];
          const message = retryAfter
            ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
            : "Too many requests. Please wait a moment and try again.";
          error.message = message;
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(
    data: LoginInput
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post("/auth/login", data);
    return response.data;
  }

  async register(
    data: RegisterInput
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post("/auth/register", data);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.client.get("/auth/profile");
    return response.data;
  }

  async updateProfile(data: {
    fullName?: string;
    phone?: string;
    address?: string;
  }): Promise<ApiResponse<User>> {
    const response = await this.client.put("/auth/profile", data);
    return response.data;
  }

  // Book endpoints
  async getBooks(params?: {
    categoryId?: string;
    authorId?: string;
    publisherId?: string;
    search?: string;
  }): Promise<ApiResponse<Book[]>> {
    const response = await this.client.get("/books", { params });
    // Backend returns { success, message, data: Book[], pagination }
    // The data field contains the array of books directly
    return response.data;
  }

  async getBook(id: string): Promise<ApiResponse<Book>> {
    const response = await this.client.get(`/books/${id}`);
    return response.data;
  }

  // Category endpoints
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await this.client.get("/categories");
    return response.data;
  }

  // Author endpoints
  async getAuthors(): Promise<ApiResponse<Author[]>> {
    const response = await this.client.get("/authors");
    return response.data;
  }

  // Publisher endpoints
  async getPublishers(): Promise<ApiResponse<Publisher[]>> {
    const response = await this.client.get("/publishers");
    return response.data;
  }

  // Cart endpoints
  async getCart(): Promise<ApiResponse<Cart>> {
    const response = await this.client.get("/cart");
    return response.data;
  }

  async addToCart(data: AddToCartInput): Promise<ApiResponse<CartItem>> {
    const response = await this.client.post("/cart", data);
    return response.data;
  }

  async updateCartItem(
    itemId: string,
    data: UpdateCartItemInput
  ): Promise<ApiResponse<CartItem>> {
    const response = await this.client.patch(`/cart/items/${itemId}`, data);
    return response.data;
  }

  async removeFromCart(
    itemId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.delete(`/cart/items/${itemId}`);
    return response.data;
  }

  async clearCart(): Promise<ApiResponse<void>> {
    const response = await this.client.delete("/cart");
    return response.data;
  }

  // Order endpoints
  async createOrder(data: CreateOrderInput): Promise<ApiResponse<Order>> {
    const response = await this.client.post("/orders", data);
    return response.data;
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    const response = await this.client.get("/orders");
    return response.data;
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await this.client.get(`/orders/${id}`);
    return response.data;
  }

  // Payment method endpoints
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    const response = await this.client.get("/payment-methods");
    return response.data;
  }

  // Rating endpoints
  async createRating(data: {
    bookId: string;
    stars: number;
    content?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.client.post("/ratings", data);
    return response.data;
  }

  // Admin endpoints - Books
  async createBook(data: {
    title: string;
    price: number;
    stock: number;
    description?: string;
    imageUrl?: string;
    publisherId: string;
    categoryId: string;
    authorIds: string[];
  }): Promise<ApiResponse<Book>> {
    const response = await this.client.post("/books", data);
    return response.data;
  }

  async updateBook(
    id: string,
    data: Partial<{
      title: string;
      price: number;
      stock: number;
      description?: string;
      imageUrl?: string;
      publisherId: string;
      categoryId: string;
      authorIds: string[];
    }>
  ): Promise<ApiResponse<Book>> {
    const response = await this.client.patch(`/books/${id}`, data);
    return response.data;
  }

  async deleteBook(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/books/${id}`);
    return response.data;
  }

  // Admin endpoints - Categories
  async createCategory(data: {
    name: string;
    description?: string;
    parentCategoryId?: string;
  }): Promise<ApiResponse<Category>> {
    const response = await this.client.post("/categories", data);
    return response.data;
  }

  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      parentCategoryId?: string;
    }>
  ): Promise<ApiResponse<Category>> {
    const response = await this.client.patch(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/categories/${id}`);
    return response.data;
  }

  // Admin endpoints - Authors
  async createAuthor(data: {
    name: string;
  }): Promise<ApiResponse<Author>> {
    const response = await this.client.post("/authors", data);
    return response.data;
  }

  async updateAuthor(
    id: string,
    data: Partial<{
      name: string;
    }>
  ): Promise<ApiResponse<Author>> {
    const response = await this.client.patch(`/authors/${id}`, data);
    return response.data;
  }

  async deleteAuthor(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/authors/${id}`);
    return response.data;
  }

  // Admin endpoints - Publishers
  async createPublisher(data: {
    name: string;
  }): Promise<ApiResponse<Publisher>> {
    const response = await this.client.post("/publishers", data);
    return response.data;
  }

  async updatePublisher(
    id: string,
    data: Partial<{
      name: string;
    }>
  ): Promise<ApiResponse<Publisher>> {
    const response = await this.client.patch(`/publishers/${id}`, data);
    return response.data;
  }

  async deletePublisher(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/publishers/${id}`);
    return response.data;
  }

  // Admin endpoints - Orders
  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    const response = await this.client.get("/orders/all");
    return response.data;
  }

  async updateOrderStatus(
    id: string,
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  ): Promise<ApiResponse<Order>> {
    const response = await this.client.patch(`/orders/${id}/status`, {
      status,
    });
    return response.data;
  }

  async confirmOrder(
    id: string,
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  ): Promise<ApiResponse<Order>> {
    const response = await this.client.patch(`/orders/${id}/confirm`, {
      status,
    });
    return response.data;
  }

  // Detail view endpoints
  async getCategory(id: string): Promise<ApiResponse<Category>> {
    const response = await this.client.get(`/categories/${id}`);
    return response.data;
  }

  async getAuthor(id: string): Promise<ApiResponse<Author>> {
    const response = await this.client.get(`/authors/${id}`);
    return response.data;
  }

  async getPublisher(id: string): Promise<ApiResponse<Publisher>> {
    const response = await this.client.get(`/publishers/${id}`);
    return response.data;
  }

  async getPaymentMethod(id: string): Promise<ApiResponse<PaymentMethod>> {
    const response = await this.client.get(`/payment-methods/${id}`);
    return response.data;
  }

  // Admin endpoints - Payment Methods
  async createPaymentMethod(data: {
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<PaymentMethod>> {
    const response = await this.client.post("/payment-methods", data);
    return response.data;
  }

  async updatePaymentMethod(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      isActive: boolean;
    }>
  ): Promise<ApiResponse<PaymentMethod>> {
    const response = await this.client.patch(`/payment-methods/${id}`, data);
    return response.data;
  }

  async deletePaymentMethod(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/payment-methods/${id}`);
    return response.data;
  }

  // Rating management endpoints
  async getRatingsByBook(bookId: string): Promise<ApiResponse<any[]>> {
    const response = await this.client.get(`/ratings/book/${bookId}`);
    return response.data;
  }

  async getBookAverageRating(
    bookId: string
  ): Promise<ApiResponse<{ averageRating: number; totalRatings: number }>> {
    const response = await this.client.get(`/ratings/book/${bookId}/average`);
    return response.data;
  }

  async getMyRatings(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get("/ratings/my-ratings");
    return response.data;
  }

  async getMyRatingForBook(bookId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/ratings/my-rating/${bookId}`);
    return response.data;
  }

  async updateRating(
    id: string,
    data: {
      stars?: number;
      content?: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await this.client.patch(`/ratings/${id}`, data);
    return response.data;
  }

  async deleteRating(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/ratings/${id}`);
    return response.data;
  }

  // Admin rating endpoints
  async getAllRatings(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get("/ratings/all");
    return response.data;
  }

  async deleteRatingAsAdmin(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/ratings/admin/${id}`);
    return response.data;
  }

  // Payment processing endpoint
  async processPayment(
    paymentId: string,
    status: "COMPLETED" | "FAILED"
  ): Promise<ApiResponse<any>> {
    const response = await this.client.post(`/payments/${paymentId}/process`, {
      status,
    });
    return response.data;
  }
}

export const api = new ApiClient();
