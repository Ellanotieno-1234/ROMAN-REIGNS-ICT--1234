import { useState } from 'react';
import { GlassCard } from './GlassCard';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

export default function AddUserForm({ 
  supabase,
  onSuccess,
  onCancel
}: {
  supabase: SupabaseClient<Database>,
  onSuccess: () => void,
  onCancel: () => void
}) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [role, setRole] = useState<'student' | 'instructor' | 'admin'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          email,
          full_name: fullName,
          is_active: isActive
        }])
        .select();

      if (userError) throw userError;

      if (userData && userData[0]?.id) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: userData[0].id,
            role
          }]);

        if (roleError) throw roleError;

        // Log the user creation activity
        await supabase.rpc('log_activity', {
          user_id: userData[0].id,
          action: `created ${role} user`,
          details: { email, full_name: fullName }
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard className="p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Add New User</h2>
      {error && <div className="text-red-400 mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              aria-label="User email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              aria-label="User full name"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              className="mr-2"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              aria-label="Account active status"
            />
            <label htmlFor="isActive" className="text-sm text-gray-300">
              Active Account
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Role
            </label>
            <select
              className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded"
              value={role}
              onChange={(e) => setRole(e.target.value as 'student' | 'instructor' | 'admin')}
              aria-label="User role"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Adding...' : 'Add User'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </GlassCard>
  );
}
