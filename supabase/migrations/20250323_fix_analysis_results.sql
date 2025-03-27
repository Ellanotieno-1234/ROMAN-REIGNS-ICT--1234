-- Add school-specific columns to analysis_results
ALTER TABLE analysis_results
ADD COLUMN session_date DATE,
ADD COLUMN present_students INTEGER DEFAULT 0,
ADD COLUMN total_students INTEGER DEFAULT 0,
ADD COLUMN attendance_rate DECIMAL(5,2),
ADD COLUMN completed_assignments INTEGER DEFAULT 0,
ADD COLUMN total_assignments INTEGER DEFAULT 0,
ADD COLUMN completion_rate DECIMAL(5,2);

-- Update trigger to handle new columns
CREATE OR REPLACE FUNCTION update_school_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate rates when data changes
    NEW.attendance_rate = NEW.present_students::DECIMAL / NULLIF(NEW.total_students, 0);
    NEW.completion_rate = NEW.completed_assignments::DECIMAL / NULLIF(NEW.total_assignments, 0);
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for school metrics
CREATE TRIGGER update_school_metrics_trigger
BEFORE INSERT OR UPDATE ON analysis_results
FOR EACH ROW
EXECUTE FUNCTION update_school_metrics();
