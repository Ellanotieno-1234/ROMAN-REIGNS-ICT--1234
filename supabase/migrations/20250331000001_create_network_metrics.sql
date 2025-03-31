-- Create network metrics table
CREATE TABLE IF NOT EXISTS public.network_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latency NUMERIC NOT NULL,
  throughput NUMERIC NOT NULL,
  packet_loss NUMERIC NOT NULL,
  uptime NUMERIC NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.network_metrics ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_network_metrics_created_at ON public.network_metrics (created_at);

-- Add comments
COMMENT ON TABLE public.network_metrics IS 'Stores network performance metrics for monitoring';
COMMENT ON COLUMN public.network_metrics.latency IS 'Network latency in milliseconds';
COMMENT ON COLUMN public.network_metrics.throughput IS 'Network throughput in Mbps';
COMMENT ON COLUMN public.network_metrics.packet_loss IS 'Packet loss percentage';
COMMENT ON COLUMN public.network_metrics.uptime IS 'Uptime percentage';
