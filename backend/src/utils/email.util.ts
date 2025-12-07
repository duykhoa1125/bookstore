import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailUtil {
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
