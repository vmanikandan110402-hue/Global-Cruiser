import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { X, Tag, Clock, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const OfferBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const { data: offers } = useQuery({
    queryKey: ['banner-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*, yachts(name, images)')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .lte('valid_from', new Date().toISOString())
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    // Check if banner was previously closed
    const closedTime = localStorage.getItem('offer-banner-closed');
    if (closedTime) {
      const closedDate = new Date(closedTime);
      const now = new Date();
      // Show banner again after 24 hours
      if (now.getTime() - closedDate.getTime() > 24 * 60 * 60 * 1000) {
        setIsVisible(true);
      }
    } else {
      // First time visiting - show after 2 seconds
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    // Only show if there are active offers
    if (offers && offers.length > 0 && !isClosed) {
      setIsVisible(true);
    } else if (offers && offers.length === 0) {
      setIsVisible(false);
    }
  }, [offers, isClosed]);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
    localStorage.setItem('offer-banner-closed', new Date().toISOString());
  };

  if (!isVisible || !offers || offers.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup Content */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fade-up">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-background transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-destructive to-accent p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Special Offers!</h2>
              <p className="text-white/80">Limited time discounts on luxury yachts</p>
            </div>
          </div>
        </div>

        {/* Offer Content */}
        <div className="p-6">
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                <img
                  src={offer.yachts?.images?.[0] || '/placeholder.svg'}
                  alt={offer.yachts?.name}
                  className="w-20 h-20 rounded-lg object-cover border border-border"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{offer.yachts?.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-destructive">{offer.discount_percentage}% OFF</span>
                    <span className="text-muted-foreground">Limited time</span>
                  </div>
                  {offer.description && (
                    <p className="text-sm text-muted-foreground mt-2">{offer.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button variant="default" className="flex-1" asChild>
              <Link to="/yachts">
                View All Yachts
              </Link>
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              Maybe Later
            </Button>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Offers valid for limited time only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;
