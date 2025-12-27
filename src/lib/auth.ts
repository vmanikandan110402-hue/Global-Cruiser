import { supabase } from "@/integrations/supabase/client";
import { sendOTPEmail } from "./email";

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  first_name?: string;
  last_name?: string;
  is_verified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const SESSION_KEY = 'yacht_booking_session';
const SESSION_TIMESTAMP_KEY = 'yacht_booking_session_timestamp';

export const saveSession = (user: User) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
};

export const getSession = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const getSessionTimestamp = (): number => {
  const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
  return timestamp ? parseInt(timestamp) : 0;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_TIMESTAMP_KEY);
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerUser = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}) => {
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', userData.email)
    .maybeSingle();

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const { data: authData } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });

  if (authData.user) {
    // Insert user data into users table
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        password_hash: 'temp', // Will be set after OTP verification
        role: 'user',
        is_verified: false,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    // Send OTP for email verification
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        user_id: newUser.id,
        email: userData.email,
        code,
        otp_type: 'first_login',
        expires_at: expiresAt.toISOString(),
      });

    if (otpError) throw otpError;

    // Send real email with OTP
    try {
      await sendOTPEmail(userData.email, code, 'first_login');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue with registration even if email fails (for development)
    }
    
    console.log(`[DEV] Registration OTP for ${userData.email}: ${code}`);
    
    return { 
      success: true, 
      isNewUser: true, 
      code,
      user: {
        id: newUser.id,
        email: userData.email,
        role: 'user' as const,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        is_verified: false,
      }
    };
  }

  throw new Error('Registration failed');
};

export const sendOTP = async (email: string, otpType: 'login' | 'password_reset' | 'first_login') => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, is_verified, password_hash')
    .eq('email', email)
    .maybeSingle();

  // For login, if user doesn't exist, create them
  if (!existingUser && otpType === 'login') {
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({ email, role: 'user', is_verified: false })
      .select('id')
      .single();
    
    if (createError) throw createError;

    // Store OTP as first_login
    const { error } = await supabase
      .from('otp_codes')
      .insert({
        user_id: newUser.id,
        email,
        code,
        otp_type: 'first_login',
        expires_at: expiresAt.toISOString(),
      });

    if (error) throw error;
    
    console.log(`[DEV] OTP for ${email}: ${code}`);
    return { success: true, isNewUser: true, code };
  }

  if (existingUser && !existingUser.password_hash && otpType === 'login') {
    otpType = 'first_login';
  }

  const { error } = await supabase
    .from('otp_codes')
    .insert({
      user_id: existingUser?.id,
      email,
      code,
      otp_type: otpType,
      expires_at: expiresAt.toISOString(),
    });

  if (error) throw error;
  
  // Send real email with OTP
  try {
    await sendOTPEmail(email, otpType, otpType);
  } catch (emailError) {
    console.error('Failed to send email:', emailError);
    // Continue with OTP generation even if email fails (for development)
  }
  
  // In production, remove this console log
  console.log(`[DEV] OTP for ${email}: ${code}`);
  return { success: true, isNewUser: !existingUser?.password_hash, code };
};

export const verifyOTP = async (email: string, code: string) => {
  const { data: otpRecord, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !otpRecord) {
    return { success: false, error: 'Invalid or expired OTP' };
  }

  // Mark OTP as used
  await supabase
    .from('otp_codes')
    .update({ used: true })
    .eq('id', otpRecord.id);

  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  return { 
    success: true, 
    user,
    otpType: otpRecord.otp_type,
    needsPassword: otpRecord.otp_type === 'first_login' || otpRecord.otp_type === 'password_reset'
  };
};

export const setNewUserPassword = async (email: string, password: string) => {
  // Get user by email
  const { data: user } = await supabase
    .from('users')
    .select('id, role, first_name, last_name, phone, is_verified')
    .eq('email', email)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  // Hash password
  const passwordHash = btoa(password); // Simple encoding for demo
  
  // Update user with password hash and mark as verified
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({
      password_hash: passwordHash,
      is_verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email)
    .select('id, email, role, first_name, last_name, phone, is_verified')
    .single();

  if (updateError) throw updateError;

  return {
    success: true,
    user: updatedUser,
  };
};

export const setPassword = async (email: string, password: string) => {
  // In production, hash the password properly
  const passwordHash = btoa(password); // Simple encoding for demo
  
  const { data, error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash, is_verified: true })
    .eq('email', email)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const loginWithPassword = async (email: string, password: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return { success: false, error: 'User not found' };
  }

  const passwordHash = btoa(password);
  if (user.password_hash !== passwordHash) {
    return { success: false, error: 'Invalid password' };
  }

  return { success: true, user };
};
