import { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

export default function RoleManagement({ supabase }: { supabase: SupabaseClient<Database> }) {
  const [users, setUsers] = useState<Database['public']['Tables']['users']['Row'][]>([]);
  const [roles, setRoles] = useState<Database['public']['Tables']['user_roles']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('*');

      if (usersData) setUsers(usersData);
      if (rolesData) setRoles(rolesData);
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const updateRole = async (userId: string, newRole: string) => {
    if (!newRole) return; // Don't update if no role selected
    
    const { error } = await supabase
      .from('user_roles')
      .upsert(
        { user_id: userId, role: newRole },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Error updating role:', error);
      return;
    }

    // Refresh roles data
    const { data } = await supabase
      .from('user_roles')
      .select('*');
      
    if (data) setRoles(data);
  };

  return (
    <GlassCard className="p-4">
      {loading ? (
        <div className="text-center py-4">Loading roles...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Current Role</th>
                <th className="p-3 text-left">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const userRole = roles.find(role => role.user_id === user.id);
                return (
                  <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{userRole?.role || 'No role assigned'}</td>
                    <td className="p-3">
                      <select
                        className="bg-gray-800/50 border border-gray-700 rounded p-1"
                        value={userRole?.role || ''}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        aria-label={`Change role for ${user.email}`}
                      >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="instructor">Instructor</option>
                        <option value="student">Student</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
