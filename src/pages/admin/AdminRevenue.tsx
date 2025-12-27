import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

const COLORS = ['hsl(45, 80%, 55%)', 'hsl(200, 70%, 50%)', 'hsl(280, 60%, 55%)', 'hsl(140, 60%, 45%)', 'hsl(20, 80%, 55%)'];

const AdminRevenue = () => {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');

  const { data: bookings } = useQuery({
    queryKey: ['revenue-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, yachts(name)')
        .in('status', ['confirmed', 'completed'])
        .order('booking_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Process daily revenue (last 30 days)
  const dailyData = (() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayBookings = bookings?.filter((b) => b.booking_date === dateStr) || [];
      const revenue = dayBookings.reduce((sum, b) => sum + Number(b.total_price), 0);
      return {
        date: format(date, 'MMM d'),
        revenue,
      };
    });
  })();

  // Process monthly revenue
  const monthlyData = (() => {
    const months: { [key: string]: number } = {};
    bookings?.forEach((b) => {
      const month = format(new Date(b.booking_date), 'MMM yyyy');
      months[month] = (months[month] || 0) + Number(b.total_price);
    });
    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
  })();

  // Yacht-wise revenue
  const yachtData = (() => {
    const yachtRevenue: { [key: string]: number } = {};
    bookings?.forEach((b) => {
      const name = b.yachts?.name || 'Unknown';
      yachtRevenue[name] = (yachtRevenue[name] || 0) + Number(b.total_price);
    });
    return Object.entries(yachtRevenue)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  })();

  const totalRevenue = bookings?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0;
  const totalBookings = bookings?.length || 0;
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Revenue Analytics</h1>
        <p className="text-muted-foreground">Track your business performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">AED {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-ocean" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Booking Value</p>
              <p className="text-2xl font-bold">AED {Math.round(avgBookingValue).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Revenue Over Time</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={period === 'daily' ? 'default' : 'secondary'}
                onClick={() => setPeriod('daily')}
              >
                Daily
              </Button>
              <Button
                size="sm"
                variant={period === 'monthly' ? 'default' : 'secondary'}
                onClick={() => setPeriod('monthly')}
              >
                Monthly
              </Button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={period === 'daily' ? dailyData : monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis 
                  dataKey={period === 'daily' ? 'date' : 'month'} 
                  stroke="hsl(220, 15%, 55%)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="hsl(220, 15%, 55%)"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 8%)',
                    border: '1px solid hsl(222, 30%, 18%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`AED ${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="hsl(45, 80%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yacht Revenue */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h2 className="text-xl font-semibold mb-6">Revenue by Yacht</h2>
          <div className="h-80">
            {yachtData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={yachtData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: AED ${(value / 1000).toFixed(0)}k`}
                    labelLine={{ stroke: 'hsl(220, 15%, 55%)' }}
                  >
                    {yachtData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(222, 30%, 18%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`AED ${value.toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;
