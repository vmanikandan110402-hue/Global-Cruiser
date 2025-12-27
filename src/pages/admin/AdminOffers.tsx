import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { format } from 'date-fns';

const AdminOffers = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);

  const { data: offers, isLoading } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*, yachts(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: yachts } = useQuery({
    queryKey: ['yachts-for-offers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('yachts').select('id, name');
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      toast.success('Offer deleted');
    },
    onError: () => toast.error('Failed to delete offer'),
  });

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingOffer(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Special Offers</h1>
          <p className="text-muted-foreground">Manage discounts and promotions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingOffer(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
            </DialogHeader>
            <OfferForm offer={editingOffer} yachts={yachts || []} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-card animate-pulse rounded-xl" />
          ))}
        </div>
      ) : offers?.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No offers yet. Create your first offer!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers?.map((offer) => (
            <div key={offer.id} className="p-6 rounded-xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{offer.discount_percentage}%</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{offer.yachts?.name}</h3>
                  <p className="text-muted-foreground text-sm">{offer.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(offer.valid_from), 'MMM d')} - {format(new Date(offer.valid_until), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  offer.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {offer.is_active ? 'Active' : 'Inactive'}
                </span>
                <Button variant="secondary" size="sm" onClick={() => handleEdit(offer)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(offer.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OfferForm = ({ offer, yachts, onClose }: { offer: any; yachts: any[]; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    yacht_id: offer?.yacht_id || '',
    discount_percentage: offer?.discount_percentage || '',
    description: offer?.description || '',
    valid_from: offer?.valid_from ? format(new Date(offer.valid_from), 'yyyy-MM-dd') : '',
    valid_until: offer?.valid_until ? format(new Date(offer.valid_until), 'yyyy-MM-dd') : '',
    is_active: offer?.is_active ?? true,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (offer) {
        const { error } = await supabase.from('offers').update(data).eq('id', offer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('offers').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      toast.success(offer ? 'Offer updated' : 'Offer created');
      onClose();
    },
    onError: () => toast.error('Failed to save offer'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Yacht</Label>
        <Select value={formData.yacht_id} onValueChange={(v) => setFormData({ ...formData, yacht_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select yacht" />
          </SelectTrigger>
          <SelectContent>
            {yachts.map((yacht) => (
              <SelectItem key={yacht.id} value={yacht.id}>{yacht.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="discount">Discount Percentage</Label>
        <Input
          id="discount"
          type="number"
          min="1"
          max="100"
          value={formData.discount_percentage}
          onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="from">Valid From</Label>
          <Input
            id="from"
            type="date"
            value={formData.valid_from}
            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="until">Valid Until</Label>
          <Input
            id="until"
            type="date"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : offer ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default AdminOffers;
