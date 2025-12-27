import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import YachtCard from '@/components/yacht/YachtCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Anchor } from 'lucide-react';

const Yachts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState<number | null>(null);

  const { data: yachts, isLoading } = useQuery({
    queryKey: ['yachts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('yachts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
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

  const filteredYachts = yachts?.filter((yacht) => {
    const matchesSearch = yacht.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = !capacityFilter || yacht.max_capacity >= capacityFilter;
    return matchesSearch && matchesCapacity;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 md:w-8 h-[2px] bg-primary" />
              <Anchor className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <div className="w-6 md:w-8 h-[2px] bg-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Our Luxury <span className="text-gradient-ocean">Fleet</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mb-8">
              Explore our exclusive collection of luxury yachts, each designed to provide unforgettable experiences on the water.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search yachts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button
                variant={capacityFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setCapacityFilter(null)}
                className="flex-1 md:flex-none"
              >
                All
              </Button>
              <Button
                variant={capacityFilter === 10 ? "default" : "outline"}
                size="sm"
                onClick={() => setCapacityFilter(10)}
                className="flex-1 md:flex-none"
              >
                10+ Guests
              </Button>
              <Button
                variant={capacityFilter === 20 ? "default" : "outline"}
                size="sm"
                onClick={() => setCapacityFilter(20)}
                className="flex-1 md:flex-none"
              >
                20+ Guests
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Yacht Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
          ) : filteredYachts?.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No yachts found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredYachts?.map((yacht) => {
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Yachts;
