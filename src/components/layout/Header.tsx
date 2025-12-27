import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Anchor, User, LogOut, LayoutDashboard, Menu, X, ChevronDown, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 md:gap-3 group" onClick={handleMobileLinkClick}>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-[0_0_25px_hsl(210_100%_45%_/_0.4)] transition-all duration-300 group-hover:scale-105">
            <Anchor className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="nav-brand text-lg md:text-2xl font-bold tracking-tight">
              Global<span className="text-gradient-ocean">Cruiser</span>
            </span>
            <span className="hidden md:block text-xs text-muted-foreground font-medium tracking-wider uppercase">Luxury Yacht Charters</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" className="nav-link font-bold text-sm px-4 py-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-all duration-300 relative group">
            Home
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-8"></span>
          </Link>
          <Link to="/yachts" className="nav-link font-bold text-sm px-4 py-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-all duration-300 relative group">
            Fleet
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-8"></span>
          </Link>
          <Link to="/gallery" className="nav-link font-bold text-sm px-4 py-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-all duration-300 relative group">
            Gallery
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-8"></span>
          </Link>
          <Link to="/contact" className="nav-link font-bold text-sm px-4 py-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-all duration-300 relative group">
            Contact
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-8"></span>
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {user?.first_name || user?.email.split('@')[0]}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/user/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/user/bookings" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && (
            <Button variant="outline" size="sm" className="gap-1 text-xs px-2">
              <User className="w-3 h-3" />
              {user?.first_name || user?.email.split('@')[0]}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMobileMenuToggle}
            className="w-10 h-10"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-background border-b border-border shadow-lg z-40">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link to="/" className="block py-2 text-lg font-medium" onClick={handleMobileLinkClick}>
              Home
            </Link>
            <Link to="/yachts" className="block py-2 text-lg font-medium" onClick={handleMobileLinkClick}>
              Fleet
            </Link>
            <Link to="/gallery" className="block py-2 text-lg font-medium" onClick={handleMobileLinkClick}>
              Gallery
            </Link>
            <Link to="/contact" className="block py-2 text-lg font-medium" onClick={handleMobileLinkClick}>
              Contact
            </Link>
            
            {isAuthenticated && (
                <div className="pt-2 border-t border-border/30 space-y-2">
                  {user?.role === 'admin' && (
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link to="/admin" onClick={handleMobileLinkClick}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  )}
                  {user?.role === 'user' && (
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link to="/user/dashboard" onClick={handleMobileLinkClick}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link to={user?.role === 'user' ? "/user/bookings" : "/bookings"} onClick={handleMobileLinkClick}>
                      <Calendar className="w-4 h-4 mr-2" />
                      My Bookings
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
