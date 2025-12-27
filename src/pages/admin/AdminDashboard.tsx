import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Anchor, LayoutDashboard, Ship, Tag, Calendar, BarChart3, Users, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading, logout, sessionTimeRemaining, showWarning } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only redirect if not loading and not authenticated or not admin
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking outside on mobile and tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/yachts', icon: Ship, label: 'Yachts' },
    { path: '/admin/offers', icon: Tag, label: 'Offers' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/revenue', icon: BarChart3, label: 'Revenue' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Show loading spinner while checking authentication */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Mobile & Tablet Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="bg-card/90 backdrop-blur-sm border-border shadow-lg"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile & Tablet Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "w-64 md:w-72 lg:w-64 fixed inset-y-0 left-0 z-50 lg:z-30"
      )}>
        <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Anchor className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <div className="block">
              <span className="text-lg font-semibold block text-foreground">
                Global<span className="text-primary">Cruiser</span>
              </span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-2 md:p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 md:px-4 md:py-3 rounded-lg transition-all",
                isActive(item.path, item.exact)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="block">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold text-xs md:text-sm">
                {user?.first_name?.[0] || user?.email[0].toUpperCase()}
              </span>
            </div>
            <div className="block">
              <p className="font-medium text-xs text-foreground">{user?.first_name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground hidden lg:block">{user?.email}</p>
            </div>
          </div>
          
          {/* Session Timer */}
          <div className="mb-3 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-red-600">
              <span>Session:</span>
              <span className="font-mono font-bold">
                {Math.floor(sessionTimeRemaining / 60000)}:{Math.floor((sessionTimeRemaining % 60000) / 1000).toString().padStart(2, '0')}
              </span>
            </div>
            {showWarning && (
              <p className="text-xs text-red-600 mt-1">
                Click to extend session
              </p>
            )}
          </div>
          
          <Button variant="secondary" className="w-full text-xs" onClick={handleLogout}>
            <LogOut className="w-3 h-3 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 ease-in-out min-h-screen",
        "lg:ml-64 md:ml-72",
        isMobile && isSidebarOpen ? "ml-64 md:ml-72" : "ml-0"
      )}>
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
