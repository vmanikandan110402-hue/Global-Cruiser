import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Ship, MapPin, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const UserBookings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          yachts (
            id,
            name,
            images,
            hourly_price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success('Booking cancelled successfully');
    },
    onError: () => {
      toast.error('Failed to cancel booking');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-8">My Bookings</h1>
            <Card>
              <CardContent className="p-4 md:p-8 text-center">
                <Ship className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6 text-sm md:text-base">
                  You haven't made any yacht bookings yet. Start exploring our fleet!
                </p>
                <Button asChild className="w-full md:w-auto">
                  <a href="/yachts">Browse Yachts</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">My Bookings</h1>
          
          <div className="space-y-4 md:space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-3 md:pb-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg md:text-xl mb-2">{booking.yachts?.name}</CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(booking.booking_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(booking.start_time)} - {formatTime((parseInt(booking.start_time.split(':')[0]) + booking.hours) % 24 + ':' + booking.start_time.split(':')[1])}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(booking.status)}
                      <p className="text-xl md:text-2xl font-bold mt-2">
                        ${booking.total_price}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{booking.hours} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">Dubai Marina</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">${booking.yachts?.hourly_price}/hour</span>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Special Requests:</p>
                      <p className="text-sm text-muted-foreground break-words">{booking.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {booking.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelBooking.mutate(booking.id)}
                        disabled={cancelBooking.isPending}
                        className="w-full sm:w-auto"
                      >
                        Cancel Booking
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                      <a href={`/yacht/${booking.yacht_id}`}>View Yacht</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookings;
