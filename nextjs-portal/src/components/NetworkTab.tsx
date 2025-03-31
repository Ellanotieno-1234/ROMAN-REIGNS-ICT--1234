import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';

interface NetworkMetric {
  created_at: string;
  latency: number;
  throughput: number;
  packet_loss: number;
  uptime: number;
}

interface ChartData {
  time: string;
  latency: number;
  throughput: number;
  packetLoss: number;
}

interface CurrentMetrics {
  uptime: string;
  latency: string;
  throughput: string;
  packetLoss: string;
}

const NetworkTab = () => {
  const [networkData, setNetworkData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<CurrentMetrics>({
    uptime: '99.9%',
    latency: '22ms',
    throughput: '55 Mbps',
    packetLoss: '0.2%'
  });

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setIsLoading(true);
        // Fetch network metrics from Supabase
        const { data, error } = await supabase
          .from('network_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(24); // Last 24 hours
        
        if (error) throw error;

        // Transform data for the chart
        const formattedData = data.map(item => ({
          time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          latency: item.latency,
          throughput: item.throughput,
          packetLoss: item.packet_loss
        }));

        setNetworkData(formattedData);
        
        // Set current metrics from latest data point
        if (data.length > 0) {
          setCurrentMetrics({
            uptime: `${data[0].uptime}%`,
            latency: `${data[0].latency}ms`,
            throughput: `${data[0].throughput} Mbps`,
            packetLoss: `${data[0].packet_loss}%`
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching network data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworkData();
    
    // Set up polling every 5 seconds
    const interval = setInterval(fetchNetworkData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <GlassCard>
        <div className="p-6 text-center text-gray-400">
          Loading network data...
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard>
        <div className="p-6 text-center text-red-400">
          Error: {error}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="space-y-6 p-6">
        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-medium text-white/80 mb-2">Uptime</h3>
            <div className="text-2xl font-bold">{currentMetrics.uptime}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-medium text-white/80 mb-2">Latency</h3>
            <div className="text-2xl font-bold">{currentMetrics.latency}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-medium text-white/80 mb-2">Throughput</h3>
            <div className="text-2xl font-bold">{currentMetrics.throughput}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
            <h3 className="text-sm font-medium text-white/80 mb-2">Packet Loss</h3>
            <div className="text-2xl font-bold">{currentMetrics.packetLoss}</div>
          </div>
        </div>

        {/* Network Metrics Chart */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Network Performance</h3>
          <div className="h-[400px]">
            {networkData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={networkData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No network data available
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default NetworkTab;
