import { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

interface ActivityItem {
  id: string;
  action: string;
  created_at: string;
  details: Database['public']['Tables']['activity_log']['Row']['details'];
  user_email: string;
}

export default function ActivityLog({ supabase }: { supabase: SupabaseClient<Database> }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('activity_log')
          .select(`
            id,
            action,
            created_at,
            details,
            user_id,
            users!inner(email)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (data) {
          setActivities(
            data.map((activity: any) => ({
              id: activity.id,
              action: activity.action,
              created_at: activity.created_at,
              details: activity.details,
              user_email: activity.users?.email || 'Unknown'
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError('Failed to load activity log');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [supabase]);

  return (
    <GlassCard className="p-4">
      {loading ? (
        <div className="text-center py-4">Loading activities...</div>
      ) : error ? (
        <div className="text-red-400 text-center py-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                  <td className="p-3">{new Date(activity.created_at).toLocaleString()}</td>
                  <td className="p-3">{activity.user_email}</td>
                  <td className="p-3">{activity.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
