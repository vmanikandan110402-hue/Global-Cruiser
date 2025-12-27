# Email Setup Guide - Dubai Yacht Journeys

## 🚀 Quick Setup for Real Email Sending

### 1. Get Resend API Key
1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Go to Dashboard → API Keys
4. Create a new API key
5. Copy the API key (starts with `re_`)

### 2. Configure Environment
1. Open `.env` file in your project
2. Replace `re_your_resend_api_key_here` with your actual Resend API key:
   ```
   VITE_RESEND_API_KEY="re_your_actual_api_key_here"
   ```

### 3. Verify Domain (Optional but Recommended)
1. In Resend Dashboard → Domains
2. Add your domain (e.g., `dubaiyachtjourneys.com`)
3. Verify your domain with DNS records
4. Update the `from` email in `src/lib/email.ts`:
   ```typescript
   from: 'Dubai Yacht Journeys <your-email@your-domain.com>',
   ```

### 4. Test Email Sending
1. Restart your development server
2. Try registering a new user
3. Check your email for the OTP code
4. Email should look professional with your branding

## 📧 Email Templates Included

### Registration Email
- Professional Dubai Yacht branding
- Clear OTP display
- Expiration warning
- Security notice

### Password Reset Email  
- Clear reset instructions
- Large, readable OTP code
- Security information
- Professional design

## 🔧 Development vs Production

### Development Mode
- Shows OTP in console AND sends real email
- Console: `[DEV] OTP for email@example.com: 123456`
- Email: Professional HTML template sent to user

### Production Mode
- Only sends real email (no console logs)
- Remove console.log line from `src/lib/auth.ts` line 196

## 🎨 Email Design Features

- ✅ Professional Dubai Yacht branding
- ✅ Large, readable OTP codes
- ✅ Mobile-responsive design
- ✅ Clear call-to-action
- ✅ Security information
- ✅ Expiration warnings
- ✅ Professional footer

## 🛠️ Troubleshooting

### Email Not Sending?
1. Check your Resend API key is correct
2. Verify your domain is configured
3. Check browser console for errors
4. Verify email address is valid

### API Key Issues?
1. Make sure API key starts with `re_`
2. Check if key has proper permissions
3. Verify domain is verified in Resend

### Domain Not Verified?
1. Use Resend's default domain initially
2. Follow DNS setup guide in Resend dashboard
3. Wait for DNS propagation (up to 24 hours)

## 📊 Free Tier Limits

- **Resend Free**: 3,000 emails/month
- **Perfect for development and small projects**
- **Upgrade anytime for higher limits**

## 🎯 Next Steps

1. ✅ Get Resend API key
2. ✅ Update `.env` file  
3. ✅ Test registration flow
4. ✅ Verify domain (optional)
5. ✅ Deploy to production

Your users will now receive professional emails with OTP codes instead of just seeing them in the console! 🎉
