import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, Download, Grid, List } from 'lucide-react';
import { toast } from 'sonner';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'full'>('grid');

  const { data: yachts, isLoading } = useQuery({
    queryKey: ['gallery-yachts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('yachts')
        .select('id, name, images')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const getAllImages = () => {
    const allImages: Array<{ id: string; name: string; url: string; yachtName: string }> = [];
    
    yachts?.forEach(yacht => {
      if (yacht.images?.length > 0) {
        yacht.images.forEach((imageUrl: string, index: number) => {
          allImages.push({
            id: `${yacht.id}-${index}`,
            name: yacht.name,
            url: imageUrl,
            yachtName: yacht.name
          });
        });
      }
    });
    
    return allImages;
  };

  const allImages = getAllImages();

  const handleDownload = async (imageUrl: string, yachtName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${yachtName.replace(/\s+/g, '_')}_image.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent animate-spin rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 md:w-8 h-[2px] bg-primary" />
              <Grid className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <div className="w-6 md:w-8 h-[2px] bg-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Yacht <span className="text-gradient-ocean">Gallery</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mb-8">
              Explore our stunning collection of luxury yachts through beautiful high-resolution images
            </p>
            
            {/* View Mode Toggle */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'secondary'}
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2"
              >
                <Grid className="w-4 h-4" />
                Grid View
              </Button>
              <Button
                variant={viewMode === 'full' ? 'default' : 'secondary'}
                onClick={() => setViewMode('full')}
                className="flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                Full View
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-xl bg-card border border-border hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedImage(image.url)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={image.url}
                      alt={`${image.yachtName} - Image ${image.id.split('-')[1]}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{image.yachtName}</h3>
                    <p className="text-sm text-muted-foreground">Click to view full size</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Full View - Staggered Layout */
            <div className="space-y-8">
              {yachts?.map((yacht) => (
                <div key={yacht.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">{yacht.name}</h2>
                    <p className="text-muted-foreground mb-6">
                      {yacht.images?.length || 0} images available
                    </p>
                    
                    {/* Yacht Images Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {yacht.images?.map((imageUrl: string, index: number) => (
                        <div
                          key={index}
                          className="relative group overflow-hidden rounded-lg bg-muted/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                          onClick={() => setSelectedImage(imageUrl)}
                        >
                          <div className="aspect-video relative">
                            <img
                              src={imageUrl}
                              alt={`${yacht.name} - Image ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Full Size Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-7xl max-h-[90vh] bg-background rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Download Button */}
            <button
              className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              onClick={() => {
                const yacht = yachts?.find(y => y.images?.includes(selectedImage));
                if (yacht) {
                  handleDownload(selectedImage, yacht.name);
                }
              }}
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Full Size Image */}
            <div className="relative">
              <img
                src={selectedImage}
                alt="Full size yacht image"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
