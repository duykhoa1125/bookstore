export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  position?: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  publisherId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  publisher?: Publisher;
  category?: Category;
  authors?: BookAuthor[];
  ratings?: Rating[];
  averageRating?: number;
}

export interface BookAuthor {
  author: Author;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Publisher {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  userId: string;
  bookId: string;
  stars: number;
  content?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface CartItem {
  id: string;
  cartId: string;
  bookId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  book: Book;
}

export interface Cart {
  id: string;
  userId: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  bookId: string;
  quantity: number;
  price: number;
  createdAt: string;
  book: Book;
}

export interface Payment {
  id: string;
  orderId: string;
  paymentMethodId: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  total: number;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: PaymentMethod;
}

export interface Order {
  id: string;
  userId: string;
  confirmedById?: string;
  orderDate: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment?: Payment;
  user?: {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
  };
  confirmedBy?: {
    fullName: string;
    email: string;
    position?: string;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
}

export interface AddToCartInput {
  bookId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CreateOrderInput {
  shippingAddress: string;
  paymentMethodId: string;
}
