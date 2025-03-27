-- Drop and recreate the table to ensure correct schema
DROP TABLE IF EXISTS analysis_results;

CREATE TABLE analysis_results (
    id BIGSERIAL PRIMARY KEY,
    file_name TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the data column for better query performance
CREATE INDEX idx_analysis_results_data ON analysis_results USING GIN (data);

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function before each update
CREATE TRIGGER update_analysis_results_updated_at
    BEFORE UPDATE ON analysis_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();