import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Anchor, LayoutDashboard, Ship, Calendar, User, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserDashboard = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Only redirect if not loading and not authenticated or not user
    if (!isLoading && (!isAuthenticated || user?.role !== 'user')) {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    {
      path: '/user/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true
    },
    {
      path: '/user/bookings',
      label: 'My Bookings',
      icon: Calendar,
      exact: false
    },
    {
      path: '/yachts',
      label: 'Browse Yachts',
      icon: Ship,
      exact: false
    }
  ];

  const isActive = (path: string, exact: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  if (!isAuthenticated || user?.role !== 'user') {
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
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "w-64"
      )}>
        <div className="p-4 border-b border-border flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
              <Anchor className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="block">
              <span className="text-lg font-semibold block text-black">
                Global<span className="text-primary">Cruiser</span>
              </span>
              <span className="text-xs text-black">User Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1",
                isActive(item.path, item.exact)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-black hover:bg-secondary hover:text-black'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0 text-black" />
              <span className="block text-black">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold text-xs">
                {user?.first_name?.[0] || user?.email[0].toUpperCase()}
              </span>
            </div>
            <div className="block">
              <p className="font-medium text-xs text-black">{user?.first_name || 'User'}</p>
              <p className="text-xs text-black hidden lg:block">{user?.email}</p>
            </div>
          </div>
          
          <Button variant="secondary" className="w-full text-xs" onClick={handleLogout}>
            <LogOut className="w-3 h-3 mr-2 text-black" />
            <span className="block text-black">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen lg:ml-0">
        <Outlet />
      </main>
    </div>
  );
};

export default UserDashboard;
