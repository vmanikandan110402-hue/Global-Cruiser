import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, getSession, saveSession, clearSession, getSessionTimestamp } from '@/lib/auth';
import { toast } from 'sonner';

const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes
const WARNING_TIME = 2 * 60 * 1000; // 2 minutes before logout
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'click', 'touchstart'];

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  sessionTimeRemaining: number;
  showWarning: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(SESSION_TIMEOUT);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [timeoutWarning, setTimeoutWarning] = useState<NodeJS.Timeout | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Update session activity and save timestamp
  const updateActivity = () => {
    const now = Date.now();
    setLastActivity(now);
    setShowWarning(false);
    // Save activity timestamp to localStorage
    localStorage.setItem('yacht_booking_session_timestamp', now.toString());
  };

  // Clear all timeouts
  const clearAllTimeouts = () => {
    if (timeoutWarning) clearTimeout(timeoutWarning);
    if (sessionTimeout) clearTimeout(sessionTimeout);
  };

  // Setup session timeouts
  const setupSessionTimeouts = () => {
    clearAllTimeouts();
    
    // Warning timeout (18 minutes)
    const warningTimeout = setTimeout(() => {
      setShowWarning(true);
      toast.warning('Session will expire in 2 minutes due to inactivity', {
        duration: 10000,
        action: {
          label: 'Stay Logged In',
          onClick: updateActivity,
        },
      });
    }, SESSION_TIMEOUT - WARNING_TIME);
    
    // Session timeout (20 minutes)
    const logoutTimeout = setTimeout(() => {
      toast.error('Session expired due to inactivity');
      logout();
    }, SESSION_TIMEOUT);
    
    setTimeoutWarning(warningTimeout);
    setSessionTimeout(logoutTimeout);
  };

  useEffect(() => {
    const session = getSession();
    const sessionTimestamp = getSessionTimestamp();
    const now = Date.now();
    
    if (session) {
      // Always restore session if it exists in localStorage
      setState({
        user: session,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Calculate actual remaining time based on stored timestamp
      const lastActivityTime = sessionTimestamp || now;
      const timeSinceSession = now - lastActivityTime;
      const remaining = Math.max(0, SESSION_TIMEOUT - timeSinceSession);
      
      // Set up activity tracking with correct remaining time
      setLastActivity(lastActivityTime);
      setSessionTimeRemaining(remaining);
      setShowWarning(remaining <= WARNING_TIME && remaining > 0);
      setupSessionTimeouts();
    } else {
      // No session found
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = (user: User) => {
    saveSession(user);
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    setLastActivity(Date.now());
    setSessionTimeRemaining(SESSION_TIMEOUT);
    setShowWarning(false);
    setupSessionTimeouts();
  };

  const logout = () => {
    clearSession();
    clearAllTimeouts();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setSessionTimeRemaining(SESSION_TIMEOUT);
    setShowWarning(false);
  };

  // Activity tracking
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const handleActivity = () => {
      updateActivity();
      setupSessionTimeouts();
    };

    // Add activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Update session timer every second
    const timer = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const remaining = Math.max(0, SESSION_TIMEOUT - timeSinceActivity);
      
      setSessionTimeRemaining(remaining);
      
      // Show warning when 2 minutes remaining
      if (remaining <= WARNING_TIME && remaining > 0 && !showWarning) {
        setShowWarning(true);
        toast.warning('Session will expire in 2 minutes due to inactivity', {
          duration: 10000,
          action: {
            label: 'Stay Logged In',
            onClick: updateActivity,
          },
        });
      }
      
      // Auto logout only when session actually expires (after full 20 minutes)
      if (remaining === 0 && timeSinceActivity >= SESSION_TIMEOUT) {
        toast.error('Session expired due to inactivity');
        logout();
      }
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(timer);
    };
  }, [state.isAuthenticated, lastActivity, showWarning]);

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      logout, 
      sessionTimeRemaining, 
      showWarning 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
