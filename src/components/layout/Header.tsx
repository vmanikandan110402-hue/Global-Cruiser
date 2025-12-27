import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, LayoutDashboard, Menu, X, ChevronDown, Calendar, Waves, Compass, Anchor } from 'lucide-react';
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
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-primary via-ocean to-accent flex items-center justify-center shadow-lg group-hover:shadow-[0_0_30px_hsl(210_100%_45%_/_0.6)] transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
            <svg className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 21h20M3 10l6-6 4 4 6-6M7 14h10M5 18h14"/>
              <path d="M12 10l-2 2h4l-2-2z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="nav-brand text-lg md:text-2xl font-bold tracking-tight">
              Global<span className="text-gradient-ocean">Cruiser</span>
            </span>
            <span className="hidden md:block text-xs text-muted-foreground font-medium tracking-wider uppercase">Luxury Yacht Charters</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="nav-link font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 relative group">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>Home</span>
            </div>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-8"></span>
          </Link>
          <Link to="/yachts" className="nav-link font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 relative group">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4" />
              <span>Fleet</span>
            </div>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-8"></span>
          </Link>
          <Link to="/gallery" className="nav-link font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 relative group">
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4" />
              <span>Gallery</span>
            </div>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-8"></span>
          </Link>
          <Link to="/contact" className="nav-link font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 relative group">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Contact</span>
            </div>
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
        <div className="md:hidden fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border shadow-lg z-40">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            <Link to="/" className="flex items-center gap-3 py-3 px-4 text-lg font-semibold rounded-xl hover:bg-primary/10 transition-all duration-300" onClick={handleMobileLinkClick}>
              <Compass className="w-5 h-5 text-primary" />
              <span>Home</span>
            </Link>
            <Link to="/yachts" className="flex items-center gap-3 py-3 px-4 text-lg font-semibold rounded-xl hover:bg-primary/10 transition-all duration-300" onClick={handleMobileLinkClick}>
              <Waves className="w-5 h-5 text-primary" />
              <span>Fleet</span>
            </Link>
            <Link to="/gallery" className="flex items-center gap-3 py-3 px-4 text-lg font-semibold rounded-xl hover:bg-primary/10 transition-all duration-300" onClick={handleMobileLinkClick}>
              <Anchor className="w-5 h-5 text-primary" />
              <span>Gallery</span>
            </Link>
            <Link to="/contact" className="flex items-center gap-3 py-3 px-4 text-lg font-semibold rounded-xl hover:bg-primary/10 transition-all duration-300" onClick={handleMobileLinkClick}>
              <Calendar className="w-5 h-5 text-primary" />
              <span>Contact</span>
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
