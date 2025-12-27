import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || 're_your_api_key_here');

export const sendOTPEmail = async (email: string, otp: string, otpType: 'login' | 'password_reset' | 'first_login') => {
  try {
    const subject = otpType === 'password_reset' 
      ? 'Password Reset Code - Global Cruiser'
      : 'Verification Code - Global Cruiser';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin-bottom: 10px;">Global Cruiser</h1>
          <p style="color: #6b7280; font-size: 16px;">Your Luxury Awaits</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <h2 style="color: #374151; margin-bottom: 15px;">
            ${otpType === 'password_reset' ? 'Reset Your Password' : 'Verify Your Email'}
          </h2>
          <p style="color: #6b7280; margin-bottom: 20px;">
            Use the verification code below to ${otpType === 'password_reset' ? 'reset your password' : 'complete your registration'}:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; border: 2px solid #e5e7eb;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e40af;">${otp}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px;">
            This code will expire in 10 minutes.<br>
            If you didn't request this code, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">
            © 2024 Global Cruiser. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Global Cruiser <noreply@globalcruiser.com>',
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send email');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};
