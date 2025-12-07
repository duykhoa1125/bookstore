import prisma from "../../config/database";
import { AddToCartInput, UpdateCartItemInput } from "./cart.dto";

export class CartService {
  async getCart(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            book: {
              include: {
                publisher: true,
                authors: { include: { author: true } },
              },
            },
          },
        },
      },
    });

    if (cart) {
      return cart;
    }

    // Verify user exists before creating cart
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Create cart for the user
    const newCart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            book: {
              include: {
                publisher: true,
                authors: { include: { author: true } },
              },
            },
          },
        },
      },
    });

    return newCart;
  }

  async addToCart(userId: string, data: AddToCartInput) {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const book = await prisma.book.findUnique({ where: { id: data.bookId } });

    if (!book) {
      throw new Error("Book not found");
    }

    if (book.stock < data.quantity) {
      throw new Error("Insufficient stock");
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_bookId: {
          cartId: cart.id,
          bookId: data.bookId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;

      if (book.stock < newQuantity) {
        throw new Error("Insufficient stock");
      }

      const cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { book: true },
      });

      await this.recalculateCartTotal(cart.id);

      return cartItem;
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        bookId: data.bookId,
        quantity: data.quantity,
      },
      include: { book: true },
    });

    await this.recalculateCartTotal(cart.id);

    return cartItem;
  }

  async updateCartItem(
    userId: string,
    itemId: string,
    data: UpdateCartItemInput
  ) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, book: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new Error("Cart item not found");
    }

    if (cartItem.book.stock < data.quantity) {
      throw new Error("Insufficient stock");
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
      include: { book: true },
    });

    await this.recalculateCartTotal(cartItem.cartId);

    return updated;
  }

  async removeFromCart(userId: string, itemId: string) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new Error("Cart item not found");
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    await this.recalculateCartTotal(cartItem.cartId);

    return { message: "Item removed from cart" };
  }

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      throw new Error("Cart not found");
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({
      where: { id: cart.id },
      data: { total: 0 },
    });

    return { message: "Cart cleared successfully" };
  }

  private async recalculateCartTotal(cartId: string) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { book: true } } },
    });

    if (!cart) return;

    const total = cart.items.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    );

    await prisma.cart.update({
      where: { id: cartId },
      data: { total },
    });
  }
}
