import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Search, Users, Mail, Calendar, Shield, Trash2 } from 'lucide-react';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Users</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage registered users</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <span className="font-semibold text-base md:text-lg">{users?.length || 0} Total Users</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 md:mb-6">
        <div className="relative max-w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUsers?.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <Users className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground text-sm md:text-base">
            {searchTerm ? 'Try adjusting your search' : 'No users registered yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-sm">
                        {user.first_name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base md:text-lg truncate">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : 'No Name'
                        }
                      </CardTitle>
                      <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </p>
                    </div>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className="shrink-0">
                    {user.role || 'user'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Shield className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">Role:</span>
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className="text-xs">
                      {user.role || 'user'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">Joined:</span>
                    <span className="text-muted-foreground">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {user.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteUser.mutate(user.id)}
                        className="flex-1 text-xs md:text-sm"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Delete User
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
