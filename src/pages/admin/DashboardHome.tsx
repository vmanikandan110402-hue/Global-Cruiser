import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Ship, Calendar, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [yachtsRes, bookingsRes, usersRes] = await Promise.all([
        supabase.from('yachts').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id, total_price, status'),
        supabase.from('users').select('id', { count: 'exact' }).eq('role', 'user'),
      ]);

      // Get live registered users count
      const { count: totalUsersCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      const totalRevenue = bookingsRes.data
        ?.filter((b) => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + Number(b.total_price), 0) || 0;

      return {
        yachts: yachtsRes.count || 0,
        bookings: bookingsRes.data?.length || 0,
        revenue: totalRevenue,
        users: usersRes.count || 0,
        totalRegisteredUsers: totalUsersCount || 0,
      };
    },
  });

  const statCards = [
    { label: 'Total Yachts', value: stats?.yachts || 0, icon: Ship, color: 'text-primary' },
    { label: 'Total Bookings', value: stats?.bookings || 0, icon: Calendar, color: 'text-ocean' },
    { label: 'Total Revenue', value: `AED ${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Registered Users', value: stats?.totalRegisteredUsers || 0, icon: Users, color: 'text-purple-500' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-base">Welcome back! Here's an overview of your business.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="p-4 md:p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} />
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <RecentBookings />
        <QuickActions />
      </div>
    </div>
  );
};

const RecentBookings = () => {
  const { data: bookings } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, yachts(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-4 md:p-6 rounded-xl bg-card border border-border">
      <h2 className="text-lg md:text-xl font-semibold mb-4">Recent Bookings</h2>
      <div className="space-y-3 md:space-y-4">
        {bookings?.map((booking) => (
          <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-secondary/30 gap-2">
            <div>
              <p className="font-medium text-sm md:text-base">{booking.yachts?.name}</p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {booking.booking_date} at {booking.start_time}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-primary text-sm md:text-base">AED {Number(booking.total_price).toLocaleString()}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-muted text-muted-foreground'
              }`}>
                {booking.status}
              </span>
            </div>
          </div>
        ))}
        {(!bookings || bookings.length === 0) && (
          <p className="text-muted-foreground text-center py-4 text-sm md:text-base">No bookings yet</p>
        )}
      </div>
    </div>
  );
};

const QuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4 md:p-6 rounded-xl bg-card border border-border">
      <h2 className="text-lg md:text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Button 
          onClick={() => navigate('/admin/yachts')}
          className="p-3 md:p-4 h-auto flex-col bg-primary/10 hover:bg-primary/20 text-primary border-0"
        >
          <Ship className="w-6 h-6 md:w-8 md:h-8 mb-2" />
          <p className="font-medium text-xs md:text-sm">Add Yacht</p>
        </Button>
        <Button 
          onClick={() => navigate('/admin/offers')}
          className="p-3 md:p-4 h-auto flex-col bg-ocean/10 hover:bg-ocean/20 text-ocean border-0"
        >
          <Calendar className="w-6 h-6 md:w-8 md:h-8 mb-2" />
          <p className="font-medium text-xs md:text-sm">Create Offer</p>
        </Button>
      </div>
    </div>
  );
};

export default DashboardHome;
