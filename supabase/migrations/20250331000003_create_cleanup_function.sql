-- Create function to delete old network metrics
CREATE OR REPLACE FUNCTION delete_old_network_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM public.network_metrics
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
