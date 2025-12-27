import { Link } from 'react-router-dom';
import { Anchor, Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/30 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
                <Anchor className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">
                Global<span className="text-primary">Cruiser</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Experience unparalleled luxury on global waters. Premium yacht charters for unforgettable moments.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/yachts" className="text-muted-foreground hover:text-primary transition-colors text-sm">Our Fleet</Link></li>
              <li><Link to="/yachts" className="text-muted-foreground hover:text-primary transition-colors text-sm">Experiences</Link></li>
              <li><Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors text-sm">Book Now</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">About Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Private Charters</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Corporate Events</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Wedding Cruises</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Fishing Trips</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <span className="text-muted-foreground text-sm">Dubai Marina, Pier 7<br />Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+971501234567" className="text-muted-foreground hover:text-primary transition-colors text-sm">+971 50 123 4567</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:info@globalcruiser.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">info@globalcruiser.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} GlobalCruiser. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
