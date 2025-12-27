import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, Check, X } from 'lucide-react';
import { format } from 'date-fns';

const AdminBookings = () => {
  type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, yachts(name), users(email, first_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking updated');
    },
    onError: () => toast.error('Failed to update booking'),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      case 'completed': return 'bg-blue-500/20 text-blue-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bookings</h1>
        <p className="text-muted-foreground">View and manage all bookings</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-card animate-pulse rounded-xl" />
          ))}
        </div>
      ) : bookings?.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No bookings yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Yacht</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Date & Time</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Duration</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings?.map((booking) => (
                <tr key={booking.id} className="border-b border-border/50 hover:bg-card/50">
                  <td className="py-4 px-4 font-medium">{booking.yachts?.name}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{booking.guest_name || booking.users?.first_name || 'Guest'}</p>
                      <p className="text-sm text-muted-foreground">{booking.guest_email || booking.users?.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</p>
                      <p className="text-sm text-muted-foreground">{booking.start_time}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">{booking.hours} hours</td>
                  <td className="py-4 px-4 text-primary font-medium">
                    AED {Number(booking.total_price).toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Select
                      value={booking.status}
                      onValueChange={(status) => updateStatus.mutate({ id: booking.id, status: status as BookingStatus })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
