import { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { supabaseAdmin } from '../lib/supabase';
import type { Database } from '../types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type User = Database['public']['Tables']['users']['Row'] & {
  user_roles: Array<Database['public']['Tables']['user_roles']['Row']>
};

export default function UserList({ supabase }: { supabase: SupabaseClient<Database> }) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      // First try a simple query without joins to test RLS
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      // Then get roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      // Combine the data
      const data = usersData?.map(user => ({
        ...user,
        user_roles: rolesData?.filter(role => role.user_id === user.id) || []
      })) || [];

      setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, [supabase]);

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <GlassCard className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                  <td className="p-3">{user.full_name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    {(user as any).user_roles?.[0]?.role || 'No role'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.is_active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
