import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingPanel from '@/components/booking/BookingPanel';
import { Button } from '@/components/ui/button';
import { Users, Bed, Ruler, MapPin, Clock, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const YachtDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: yacht, isLoading } = useQuery({
    queryKey: ['yacht', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('yachts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: offer } = useQuery({
    queryKey: ['yacht-offer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('yacht_id', id)
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .lte('valid_from', new Date().toISOString())
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="h-96 bg-muted rounded-xl" />
              <div className="h-8 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!yacht) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-3xl">Yacht not found</h1>
          <Button className="mt-4" onClick={() => navigate('/yachts')}>
            Back to Fleet
          </Button>
        </div>
      </div>
    );
  }

  const images = yacht.images?.length ? yacht.images : ['/placeholder.svg'];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Enhanced Image Gallery Hero Section */}
      <section className="pt-16 md:pt-20">
        <div className="relative h-[60vh] md:h-[80vh] min-h-[400px] md:min-h-[600px] overflow-hidden">
          {/* Main Yacht Image */}
          <img
            src={images[currentImageIndex]}
            alt={yacht.name}
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          
          {/* Enhanced gradient overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/80" />
          
          {/* Floating content overlay with better contrast */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
            <div className="container mx-auto">
              <div className="max-w-4xl">
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 md:mb-6 tracking-tight drop-shadow-2xl">
                  {yacht.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-foreground text-sm md:text-lg">
                  <div className="flex items-center gap-2 bg-card/90 backdrop-blur-lg border border-border/50 px-3 py-2 md:px-4 md:py-3 rounded-xl shadow-lg">
                    <Ruler className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    <span className="font-semibold">{yacht.feet} ft</span>
                  </div>
                  <div className="flex items-center gap-2 bg-card/90 backdrop-blur-lg border border-border/50 px-3 py-2 md:px-4 md:py-3 rounded-xl shadow-lg">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    <span className="font-semibold">{yacht.max_capacity} guests</span>
                  </div>
                  <div className="flex items-center gap-2 bg-card/90 backdrop-blur-lg border border-border/50 px-3 py-2 md:px-4 md:py-3 rounded-xl shadow-lg">
                    <Bed className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    <span className="font-semibold">{yacht.bedrooms} bedrooms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced navigation controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-card/90 backdrop-blur-lg border-2 border-border/50 flex items-center justify-center hover:bg-card transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <ChevronLeft className="w-4 h-4 md:w-7 md:h-7 text-foreground" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-card/90 backdrop-blur-lg border-2 border-border/50 flex items-center justify-center hover:bg-card transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <ChevronRight className="w-4 h-4 md:w-7 md:h-7 text-foreground" />
              </button>
              
              {/* Simple image indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentImageIndex 
                        ? 'bg-white' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Enhanced offer badge */}
          {offer && (
            <div className="absolute top-20 md:top-32 right-4 md:right-8 bg-gradient-to-r from-destructive to-accent text-destructive-foreground px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold text-sm md:text-lg shadow-2xl animate-pulse-coral border border-border/50">
              {offer.discount_percentage}% OFF
            </div>
          )}

          {/* Back button */}
          <button
            onClick={() => navigate('/yachts')}
            className="absolute top-8 left-4 md:left-8 bg-card/90 backdrop-blur-lg border border-border/50 px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 hover:bg-card transition-all duration-300 shadow-lg"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
            <span className="text-foreground font-medium text-sm md:text-base">Back to Fleet</span>
          </button>
        </div>
      </section>

      {/* Simplified Content Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto pr-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 content-justify">
              {/* Tour Detail */}
              {yacht.tour_detail && (
                <div>
                  <h2 className="font-bold text-2xl md:text-3xl mb-4 text-foreground">
                    About This Yacht
                  </h2>
                  <p className="text-base md:text-lg leading-relaxed text-foreground/80">
                    {yacht.tour_detail}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {yacht.amenities?.length > 0 && (
                <div>
                  <h2 className="font-bold text-2xl md:text-3xl mb-6 text-foreground">
                    Amenities
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {yacht.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-foreground">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary */}
              {yacht.tour_itinerary && (
                <div>
                  <h2 className="font-bold text-2xl md:text-3xl mb-4 text-foreground text-left">
                    Itinerary
                  </h2>
                  <div className="space-y-4">
                    {yacht.tour_itinerary.split('→').map((location, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-base md:text-lg leading-relaxed text-foreground/80 text-left">
                            {location.trim()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Program */}
              {yacht.tour_program && (
                <div>
                  <h2 className="font-bold text-2xl md:text-3xl mb-4 text-foreground text-left">
                    Tour Program
                  </h2>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <p className="text-base md:text-lg leading-relaxed text-foreground/80 text-left">
                      {yacht.tour_program}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Simple Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card border rounded-xl p-6 shadow-sm">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    AED {Number(yacht.hourly_price).toLocaleString()}
                    <span className="text-lg font-normal text-muted-foreground">/hour</span>
                  </div>
                  {offer && (
                    <div className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-medium mb-2">
                      Save {offer.discount_percentage}% with current offer!
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Minimum 2 hours booking
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">2+ hours</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Capacity</span>
                    <span className="font-medium text-foreground">{yacht.max_capacity} guests</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Size</span>
                    <span className="font-medium text-foreground">{yacht.feet} ft</span>
                  </div>
                </div>

                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={() => setIsBookingOpen(true)}
                >
                  Book Now
                </Button>

                <div className="mt-4 pt-4 border-t border-border/50 text-center">
                  <p className="text-xs text-muted-foreground">
                    Instant confirmation • Free cancellation • 24/7 support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <BookingPanel
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        yacht={yacht}
        offer={offer}
      />
    </div>
  );
};

export default YachtDetail;
