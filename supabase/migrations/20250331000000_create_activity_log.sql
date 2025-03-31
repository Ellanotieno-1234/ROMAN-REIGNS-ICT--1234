-- Create activity_log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- Enable Row Level Security
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_log table
CREATE POLICY "Allow all access to admin" 
ON activity_log
FOR ALL
TO authenticated
USING (auth.role() = 'admin');

-- Create function to log activities
CREATE OR REPLACE FUNCTION log_activity(
  user_id UUID,
  action TEXT,
  details JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO activity_log (user_id, action, details)
  VALUES (user_id, action, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
