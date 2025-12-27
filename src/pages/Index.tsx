import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import YachtCard from '@/components/yacht/YachtCard';
import OfferBanner from '@/components/offer/OfferBanner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Anchor, Star, Shield, Clock, ChevronRight, Waves } from 'lucide-react';

const Index = () => {
  const { data: yachts, isLoading } = useQuery({
    queryKey: ['featured-yachts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('yachts')
        .select('*')
        .eq('is_active', true)
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: offers } = useQuery({
    queryKey: ['active-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .lte('valid_from', new Date().toISOString());
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <OfferBanner />
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&q=80"
            alt="Luxury yacht in Dubai"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 pt-16 md:pt-24">
          <div className="max-w-3xl animate-fade-up">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="w-8 md:w-12 h-[2px] bg-primary" />
              <span className="text-primary text-xs md:text-sm font-medium tracking-wider uppercase">
                Luxury Yacht Charters
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight mb-4 md:mb-6">
              Sail Through
              <br />
              <span className="text-gradient-ocean">Global Waters</span>
            </h1>
            <p className="text-sm md:text-xl text-muted-foreground leading-relaxed mb-6 md:mb-10 max-w-xl">
              Experience unparalleled luxury aboard our premium fleet. From intimate gatherings to grand celebrations, create memories that last forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button size="lg" variant="default" asChild className="w-full sm:w-auto">
                <Link to="/yachts">
                  Explore Fleet
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="glass" asChild className="w-full sm:w-auto">
                <Link to="/auth">
                  Book Now
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <Waves className="w-8 h-8 text-primary/50" />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Star, title: 'Premium Fleet', desc: 'Handpicked selection of the finest yachts' },
              { icon: Shield, title: 'Safe & Secure', desc: 'Professional crew and safety equipment' },
              { icon: Clock, title: 'Flexible Booking', desc: 'Easy scheduling with instant confirmation' },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-br from-muted/30 to-transparent border border-border/30 animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Yachts */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 md:w-8 h-[2px] bg-primary" />
              <Anchor className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <div className="w-6 md:w-8 h-[2px] bg-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-center">
              Our Premium Fleet
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto text-center">
              Discover our collection of luxury yachts, each offering unique experiences for your global adventure.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-luxury animate-pulse">
                  <div className="h-48 md:h-64 bg-muted" />
                  <div className="p-4 md:p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-10 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {yachts?.map((yacht) => {
                const yachtOffer = offers?.find(offer => offer.yacht_id === yacht.id);
                return (
                  <YachtCard
                    key={yacht.id}
                    id={yacht.id}
                    name={yacht.name}
                    feet={yacht.feet}
                    maxCapacity={yacht.max_capacity}
                    bedrooms={yacht.bedrooms}
                    hourlyPrice={Number(yacht.hourly_price)}
                    images={yacht.images || []}
                    amenities={yacht.amenities || []}
                    offer={yachtOffer}
                  />
                );
              })}
            </div>
          )}

          <div className="text-center mt-8 md:mt-12">
            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
              <Link to="/yachts">
                View All Yachts
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-ocean/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(45 80% 55% / 0.1) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Ready for Your
              <br />
              <span className="text-gradient-coral">Luxury Experience?</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg mb-6 md:mb-10 text-center">
              Book your private yacht charter today and create unforgettable memories on stunning global waters.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button size="lg" variant="default" asChild className="w-full sm:w-auto">
                <Link to="/yachts">
                  Explore Yachts
                </Link>
              </Button>
              <Button size="lg" variant="glass" asChild className="w-full sm:w-auto">
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
