-- Seed initial network metrics data
INSERT INTO public.network_metrics (latency, throughput, packet_loss, uptime)
VALUES
  (18, 62, 0.1, 99.9),
  (22, 58, 0.2, 99.8),
  (25, 55, 0.5, 99.7),
  (20, 60, 0.3, 99.8),
  (19, 61, 0.2, 99.9),
  (23, 57, 0.4, 99.7),
  (21, 59, 0.3, 99.8),
  (24, 56, 0.6, 99.6),
  (17, 63, 0.1, 99.9),
  (26, 54, 0.7, 99.5);

-- Update timestamps to simulate data over time
WITH numbered_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as row_num
  FROM public.network_metrics
)
UPDATE public.network_metrics nm
SET created_at = NOW() - (nr.row_num % 10) * INTERVAL '1 hour'
FROM numbered_rows nr
WHERE nm.id = nr.id;
