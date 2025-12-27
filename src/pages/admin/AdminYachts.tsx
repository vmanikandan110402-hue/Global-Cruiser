import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Ship, Calendar, Tag, Power } from 'lucide-react';
import ImageUpload from '@/components/ui/image-upload';

const AMENITIES_OPTIONS = [
  'WiFi', 'BBQ', 'Jacuzzi', 'Sound System', 'Jet Ski', 'Fishing Equipment',
  'Snorkeling Gear', 'Towels', 'Paddle Boards', 'Kayak', 'Bar', 'Kitchen'
];

const AdminYachts = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingYacht, setEditingYacht] = useState<any>(null);

  const { data: yachts, isLoading } = useQuery({
    queryKey: ['admin-yachts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('yachts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('yachts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-yachts'] });
      toast.success('Yacht deleted');
    },
    onError: () => toast.error('Failed to delete yacht'),
  });

  const statusToggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('yachts')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-yachts'] });
      toast.success(`Yacht ${variables.isActive ? 'activated' : 'deactivated'}`);
    },
    onError: () => toast.error('Failed to update yacht status'),
  });

  const handleEdit = (yacht: any) => {
    setEditingYacht(yacht);
    setIsDialogOpen(true);
  };

  const handleStatusToggle = (yacht: any) => {
    statusToggleMutation.mutate({
      id: yacht.id,
      isActive: !yacht.is_active
    });
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingYacht(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Yachts</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your yacht fleet</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingYacht(null)} className="w-full sm:w-auto bg-gradient-to-r from-primary to-gold-dark hover:from-primary/90 hover:to-gold-dark/90 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Yacht
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden mx-2 sm:mx-4 rounded-2xl">
            <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-gold-dark/5">
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-gold-dark bg-clip-text text-transparent">
                {editingYacht ? 'Edit Yacht Details' : 'Add New Yacht'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {editingYacht ? 'Update yacht information and amenities' : 'Add a new yacht to your fleet'}
              </p>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(95vh-120px)] px-6 py-4">
              <YachtForm yacht={editingYacht} onClose={handleClose} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 md:h-64 bg-card animate-pulse rounded-xl" />
          ))}
        </div>
      ) : yachts?.length === 0 ? (
        <div className="text-center py-16">
          <Ship className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No yachts yet. Add your first yacht!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {yachts?.map((yacht) => (
            <div key={yacht.id} className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                {yacht.images?.[0] ? (
                  <img
                    src={yacht.images[0]}
                    alt={yacht.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Ship className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg md:text-xl mb-1">{yacht.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {yacht.feet} ft • {yacht.max_capacity} guests • {yacht.bedrooms} bedrooms
                    </p>
                  </div>
                  <Badge variant={yacht.is_active ? 'default' : 'secondary'}>
                    {yacht.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {yacht.tour_detail || 'No description available'}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg md:text-xl font-bold text-primary">
                    AED {Number(yacht.hourly_price).toLocaleString()}/hr
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {yacht.amenities?.length || 0} amenities
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(yacht)}
                    className="flex-1"
                  >
                    <Pencil className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={yacht.is_active ? "secondary" : "default"}
                    onClick={() => handleStatusToggle(yacht)}
                    disabled={statusToggleMutation.isPending}
                    className="flex-1"
                  >
                    <Power className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    {yacht.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(yacht.id)}
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const YachtForm = ({ yacht, onClose }: { yacht: any; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: yacht?.name || '',
    feet: yacht?.feet || '',
    max_capacity: yacht?.max_capacity || '',
    bedrooms: yacht?.bedrooms || '',
    hourly_price: yacht?.hourly_price || '',
    tour_detail: yacht?.tour_detail || '',
    tour_itinerary: yacht?.tour_itinerary || '',
    tour_program: yacht?.tour_program || '',
    amenities: yacht?.amenities || [],
    images: yacht?.images || [],
    is_active: yacht?.is_active ?? true,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        images: data.images || [],
      };
      
      if (yacht) {
        const { error } = await supabase.from('yachts').update(payload).eq('id', yacht.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('yachts').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-yachts'] });
      toast.success(yacht ? 'Yacht updated' : 'Yacht added');
      onClose();
    },
    onError: () => toast.error('Failed to save yacht'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a: string) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Section */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Ship className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">Yacht Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-11 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Enter yacht name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feet" className="text-sm font-medium text-foreground">Length (ft)</Label>
            <Input
              id="feet"
              type="number"
              value={formData.feet}
              onChange={(e) => setFormData({ ...formData, feet: e.target.value })}
              className="h-11 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g., 65"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-sm font-medium text-foreground">Max Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.max_capacity}
              onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
              className="h-11 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g., 12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="text-sm font-medium text-foreground">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              className="h-11 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g., 3"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="price" className="text-sm font-medium text-foreground">Hourly Price (AED)</Label>
            <Input
              id="price"
              type="number"
              value={formData.hourly_price}
              onChange={(e) => setFormData({ ...formData, hourly_price: e.target.value })}
              className="h-11 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g., 1500"
              required
            />
          </div>
        </div>
      </div>

      {/* Tour Information Section */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Tour Information</h3>
        </div>
        
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="detail" className="text-sm font-medium text-foreground text-left">Tour Detail</Label>
            <Textarea
              id="detail"
              value={formData.tour_detail}
              onChange={(e) => setFormData({ ...formData, tour_detail: e.target.value })}
              className="w-full min-h-[120px] border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-left"
              placeholder="Describe the yacht tour experience, highlights, and what makes it special..."
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itinerary" className="text-sm font-medium text-foreground text-left">Tour Itinerary</Label>
            <Textarea
              id="itinerary"
              value={formData.tour_itinerary}
              onChange={(e) => setFormData({ ...formData, tour_itinerary: e.target.value })}
              className="w-full min-h-[100px] border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-left"
              placeholder="Day-by-day or hour-by-hour schedule of the tour..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program" className="text-sm font-medium text-foreground text-left">Tour Program</Label>
            <Textarea
              id="program"
              value={formData.tour_program}
              onChange={(e) => setFormData({ ...formData, tour_program: e.target.value })}
              className="w-full min-h-[100px] border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-left"
              placeholder="Detailed program including activities, meals, and entertainment..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Amenities Section */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Tag className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Amenities & Features</h3>
        </div>
        
        <div className="w-full space-y-2">
          <Label className="text-sm font-medium text-foreground text-left">Select Available Amenities</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {AMENITIES_OPTIONS.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border text-left ${
                  formData.amenities.includes(amenity)
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background border-border text-foreground hover:bg-secondary hover:border-secondary-foreground/50'
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Ship className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Yacht Images</h3>
        </div>
        
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Upload Photos</Label>
          <div className="bg-muted/30 rounded-lg p-4 border-2 border-dashed border-border">
            <ImageUpload
              value={formData.images}
              onChange={(urls) => setFormData({ ...formData, images: urls })}
              maxSize={5}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Upload high-quality images of the yacht. Maximum 5 images per yacht.
          </p>
        </div>
      </div>

      {/* Status & Actions Section */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div>
              <Label htmlFor="active" className="text-sm font-medium text-foreground cursor-pointer">
                Active (visible to users)
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                When enabled, this yacht will be visible to customers on the website
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            className="w-full sm:w-auto h-11"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full sm:w-auto h-11 bg-gradient-to-r from-primary to-gold-dark hover:from-primary/90 hover:to-gold-dark/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : yacht ? (
              'Update Yacht'
            ) : (
              'Add Yacht'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AdminYachts;
