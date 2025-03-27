-- Add record_count column to analysis_results table
ALTER TABLE analysis_results
ADD COLUMN record_count INTEGER DEFAULT 0;

-- Update existing rows to set record_count based on data array length
UPDATE analysis_results
SET record_count = jsonb_array_length(data->'records')
WHERE jsonb_typeof(data->'records') = 'array';
