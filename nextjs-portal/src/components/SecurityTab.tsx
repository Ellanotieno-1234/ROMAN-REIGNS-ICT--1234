import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GlassCard } from './GlassCard';

type AuthLog = {
  id: string;
  event_type: string;
  ip_address: string;
  created_at: string;
};

type SecurityEvent = {
  id: string;
  severity: 'high' | 'medium' | 'low' | string;
  description: string;
  created_at: string;
};

export default function SecurityTab() {
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [threats, setThreats] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    const fetchAuthLogs = async () => {
      const { data, error } = await supabase
        .from('auth_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) setAuthLogs(data);
    };

    const fetchThreats = async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setThreats(data);
    };

    fetchAuthLogs();
    fetchThreats();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <GlassCard className="backdrop-blur-lg">
        <div className="p-4">
          <h3 className="text-2xl font-bold mb-4 text-white/90">Authentication Logs</h3>
          <div className="max-h-96 overflow-y-auto rounded-lg">
            {authLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-3 hover:bg-white/5 transition-colors border-b border-white/10"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white/80">{log.event_type}</span>
                  <span className="text-sm text-white/60">{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <div className="text-sm text-white/50 mt-1">{log.ip_address}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="backdrop-blur-lg">
        <div className="p-4">
          <h3 className="text-2xl font-bold mb-4 text-white/90">Threat Detection</h3>
          <div className="h-64 overflow-y-auto rounded-lg">
            {threats.length > 0 ? (
              threats.map((threat) => {
                const severity = threat.severity.toLowerCase() as 'high' | 'medium' | 'low';
                const severityColor = {
                  high: 'bg-red-500/20 text-red-400',
                  medium: 'bg-yellow-500/20 text-yellow-400',
                  low: 'bg-blue-500/20 text-blue-400'
                }[severity] || 'bg-gray-500/20 text-gray-400';
                
                return (
                  <div 
                    key={threat.id} 
                    className="p-3 hover:bg-white/5 transition-colors border-b border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${severityColor}`}>
                        {threat.severity}
                      </span>
                      <span className="text-white/80">{threat.description}</span>
                    </div>
                    <div className="text-sm text-white/50 mt-2">
                      {new Date(threat.created_at).toLocaleString()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-white/60">
                <div className="text-xl mb-2">✅ All clear</div>
                <div className="text-sm">No security threats detected</div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
