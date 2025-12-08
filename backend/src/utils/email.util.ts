import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Order item type for email
interface OrderItemForEmail {
  book: {
    title: string;
    imageUrl?: string | null;
  };
  quantity: number;
  price: number;
}

// Order type for email
interface OrderForEmail {
  id: string;
  total: number;
  shippingAddress: string;
  orderDate: Date;
  items: OrderItemForEmail[];
  payment?: {
    paymentMethod?: {
      name: string;
    } | null;
  } | null;
}

export class EmailUtil {
  /**
   * Send order confirmation email to customer
   */
  static async sendOrderConfirmationEmail(
    to: string,
    customerName: string,
    order: OrderForEmail
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL ||
      (process.env.CORS_ALLOWED_ORIGINS?.split(',')[0]) ||
      'http://localhost:5173';
    const orderUrl = `${frontendUrl}/orders/${order.id}`;
    const orderId = order.id.slice(0, 8).toUpperCase();
    const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate items HTML
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div>
              <p style="margin: 0; font-weight: 600; color: #0f172a;">${item.book.title}</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">Qty: ${item.quantity}</p>
            </div>
          </div>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #0f172a;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0;">📚 Bookstore</h1>
    </div>
    
    <!-- Main Card -->
    <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <!-- Success Banner -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
        <div style="width: 64px; height: 64px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">✓</span>
        </div>
        <h2 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Order Confirmed!</h2>
        <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Thank you for your purchase, ${customerName}!</p>
      </div>
      
      <!-- Order Info -->
      <div style="padding: 32px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0;">
          <div>
            <p style="margin: 0; font-size: 14px; color: #64748b;">Order Number</p>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: monospace;">#${orderId}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">Order Date</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 600; color: #0f172a;">${orderDate}</p>
          </div>
        </div>
        
        <!-- Items Table -->
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>
        
        <!-- Total -->
        <div style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #0f172a; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: 700; color: #0f172a;">Total</span>
          <span style="font-size: 24px; font-weight: 700; color: #10b981;">$${order.total.toFixed(2)}</span>
        </div>
        
        <!-- Shipping & Payment -->
        <div style="margin-top: 32px; padding: 24px; background-color: #f8fafc; border-radius: 12px;">
          <div style="margin-bottom: 16px;">
            <p style="margin: 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">📍 Shipping Address</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #0f172a; line-height: 1.5;">${order.shippingAddress}</p>
          </div>
          <div>
            <p style="margin: 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">💳 Payment Method</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #0f172a;">${order.payment?.paymentMethod?.name || 'N/A'}</p>
          </div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 32px;">
          <a href="${orderUrl}" 
             style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
            View Order Details
          </a>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
        Questions about your order? Contact us anytime.
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Bookstore. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Bookstore <onboarding@resend.dev>",
        to: [to],
        subject: `Order Confirmed! #${orderId} - Bookstore`,
        html: htmlContent,
      });
      console.log(`Order confirmation email sent to ${to}`);
    } catch (error) {
      console.error("Failed to send order confirmation email:", error);
      // Don't throw - email failure shouldn't block order creation
    }
  }

  static async sendPasswordResetEmail(
    to: string,
    resetToken: string
  ): Promise<void> {
    // Get frontend URL - use FRONTEND_URL if set, otherwise get first origin from CORS_ALLOWED_ORIGINS
    const frontendUrl = process.env.FRONTEND_URL ||
      (process.env.CORS_ALLOWED_ORIGINS?.split(',')[0]) ||
      'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 16px 0; text-align: center;">Bookstore</h1>
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
        Reset Your Password
      </h2>
      <p style="color: #64748b; font-size: 16px; line-height: 24px; margin: 0 0 24px 0; text-align: center;">
        We received a request to reset your password. Click the button below to create a new password.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" 
           style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
          Reset Password
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 14px; line-height: 20px; margin: 24px 0 0 0; text-align: center;">
        This link will expire in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
      <p style="color: #94a3b8; font-size: 12px; line-height: 18px; margin: 0; text-align: center;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Bookstore <onboarding@resend.dev>",
        to: [to],
        subject: "Reset Your Password - Bookstore",
        html: htmlContent,
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }
}
