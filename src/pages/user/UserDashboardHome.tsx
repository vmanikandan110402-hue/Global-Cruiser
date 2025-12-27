import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Ship, Clock, DollarSign, TrendingUp, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboardHome = () => {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['user-bookings-stats'],
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
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: totalBookings } = useQuery({
    queryKey: ['user-total-bookings'],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const totalSpent = bookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;
  const upcomingBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.booking_date) >= new Date()).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.first_name || 'User'}!</h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage your yacht bookings and explore new adventures</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-gold-dark bg-clip-text text-transparent">
              {totalBookings || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
          </CardContent>
          <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary/10 to-gold-dark/10 rounded-bl-full" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {upcomingBookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed bookings</p>
          </CardContent>
          <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-green-50 rounded-bl-full" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              ${totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime spending</p>
          </CardContent>
          <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-bl-full" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              Active
            </div>
            <p className="text-xs text-muted-foreground mt-1">Member status</p>
          </CardContent>
          <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-purple-50 rounded-bl-full" />
        </Card>
      </div>

      {/* Recent Bookings and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Calendar className="w-5 h-5" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings && bookings.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Ship className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate">{booking.yachts?.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {new Date(booking.booking_date).toLocaleDateString()} • {booking.hours}h
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm md:text-base">${booking.total_price}</p>
                      <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/user/bookings">View All Bookings</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <Ship className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-base md:text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">Start your yacht adventure today!</p>
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/yachts">Browse Yachts</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <TrendingUp className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/yachts">
                  <Ship className="w-4 h-4 mr-2" />
                  Browse Yachts
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/user/bookings">
                  <Calendar className="w-4 h-4 mr-2" />
                  My Bookings
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Profile Settings
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Loyalty Program
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardHome;
