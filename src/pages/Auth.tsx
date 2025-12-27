import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { sendOTP, verifyOTP, setPassword, loginWithPassword, registerUser, setNewUserPassword } from '@/lib/auth';
import { toast } from 'sonner';
import { Anchor, ArrowLeft, Mail, Lock, KeyRound, User, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

type AuthStep = 'login' | 'register' | 'forgot-password' | 'otp' | 'password' | 'set-password';

const Auth = () => {
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword_] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      toast.error('Please fill all required fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      });

      if (!result.success) {
        toast.error((result as any).message || 'Registration failed');
        return;
      }

      setIsNewUser(true);
      setDevOtp(result.code || null);
      setStep('otp');
      toast.success('Registration successful! Please check your email for OTP.');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (otpType: 'login' | 'password_reset' | 'first_login' = 'login') => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOTP(email, otpType);
      setIsNewUser(result.isNewUser || false);
      setDevOtp(result.code || null);
      setStep('otp');
      toast.success('OTP sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTP(email, otp);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.needsPassword) {
        setStep('set-password');
      } else {
        // User has password, need to enter it
        setStep('password');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      
      if (isNewUser) {
        // New user registration - use setNewUserPassword
        result = await setNewUserPassword(email, password);
      } else {
        // Existing user - use regular setPassword
        result = await setPassword(email, password);
      }

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      login({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role as 'admin' | 'user',
        first_name: result.user.first_name || undefined,
        last_name: result.user.last_name || undefined,
        is_verified: result.user.is_verified,
      });
      toast.success('Account created successfully!');
      navigate(result.user.role === 'admin' ? '/admin' : '/yachts');
    } catch (error: any) {
      toast.error(error.message || 'Failed to set password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithPassword(email, password);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      login({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role as 'admin' | 'user',
        first_name: result.user.first_name || undefined,
        last_name: result.user.last_name || undefined,
        is_verified: result.user.is_verified,
      });
      toast.success('Welcome back!');
      navigate(result.user.role === 'admin' ? '/admin' : '/yachts');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithPassword(email, password);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // Check if user is admin
      if (result.user.role !== 'admin') {
        toast.error('Access denied. Admin account required.');
        return;
      }

      login({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role as 'admin',
        first_name: result.user.first_name || undefined,
        last_name: result.user.last_name || undefined,
        is_verified: result.user.is_verified,
      });
      toast.success('Admin login successful!');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Image (Fixed) */}
      <div className="hidden lg:flex lg:w-1/2 fixed inset-y-0 left-0 z-10">
        <img
          src="https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200&q=80"
          alt="Luxury yacht"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute bottom-10 left-10 right-10">
          <h2 className="text-4xl font-bold mb-4">
            Your Luxury <span className="text-gradient-coral">Awaits</span>
          </h2>
          <p className="text-muted-foreground">
            Book your private yacht charter and experience Dubai's waters in ultimate style.
          </p>
        </div>
      </div>

      {/* Right side - Auth form (Scrollable) */}
      <div className="w-full lg:w-1/2 lg:ml-auto flex items-center justify-center p-8 min-h-screen overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
              <Anchor className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">
              Dubai<span className="text-primary">Yachts</span>
            </span>
          </Link>

          {step !== 'login' && (
            <button
              onClick={() => {
                if (step === 'otp') setStep('forgot-password');
                else if (step === 'password' || step === 'set-password') setStep('otp');
                else if (step === 'register' || step === 'forgot-password') setStep('login');
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {step === 'register' && 'Create Account'}
              {step === 'login' && 'Welcome Back'}
              {step === 'forgot-password' && 'Reset Password'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'password' && 'Enter Password'}
              {step === 'set-password' && 'Create New Password'}
            </h1>
            <p className="text-muted-foreground">
              {step === 'register' && 'Fill in your details to create an account'}
              {step === 'login' && 'Sign in to your account to continue'}
              {step === 'forgot-password' && 'Enter your email to receive a reset code'}
              {step === 'otp' && `We sent a code to ${email}`}
              {step === 'password' && 'Enter your password to sign in'}
              {step === 'set-password' && 'Create a new password for your account'}
            </p>
          </div>

          {step === 'login' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword_(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              
              <Button
                className="w-full h-12 text-base font-medium"
                size="lg"
                onClick={handleLogin}
                disabled={isLoading || !email || !password}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <div className="text-center space-y-3">
                <button
                  onClick={() => setStep('forgot-password')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium"
                  onClick={() => setStep('register')}
                >
                  Create Account
                </Button>
              </div>
            </div>
          )}

          {step === 'forgot-password' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              
              <Button
                className="w-full h-12 text-base font-medium"
                size="lg"
                onClick={() => handleSendOTP('password_reset')}
                disabled={isLoading || !email}
              >
                {isLoading ? 'Sending OTP...' : 'Send Reset Code'}
              </Button>
              
              <div className="text-center">
                <button
                  onClick={() => setStep('login')}
                  className="text-sm text-primary hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {step === 'register' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword_(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <Button
                className="w-full h-12 text-base font-medium"
                size="lg"
                onClick={handleRegister}
                disabled={isLoading || !email || !password || !firstName || !lastName || password !== confirmPassword}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
              
              <div className="text-center">
                <button
                  onClick={() => setStep('login')}
                  className="text-sm text-primary hover:underline"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 text-center text-2xl tracking-widest h-12"
                    maxLength={6}
                  />
                </div>
              </div>
              {devOtp && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-medium">Dev Mode:</span> OTP is <span className="font-mono font-bold text-foreground">{devOtp}</span>
                  </p>
                </div>
              )}
              <Button
                className="w-full h-12 text-base font-medium"
                size="lg"
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <button
                onClick={handleSendOTP}
                className="text-sm text-primary hover:underline block mx-auto"
              >
                Resend OTP
              </button>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword_(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <Button
                className="w-full h-12 text-base font-medium"
                size="lg"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          )}

          {step === 'set-password' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword_(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <Button
                className="w-full h-12 text-base font-medium"
                size="lg"
                onClick={handleSetPassword}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
