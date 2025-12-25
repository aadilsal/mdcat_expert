-- ============================================================================
-- Upload History Table Migration
-- ============================================================================
-- Tracks all bulk question upload operations by admins
-- ============================================================================

-- Create upload_history table
CREATE TABLE upload_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    total_rows INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    duplicate_count INTEGER NOT NULL DEFAULT 0,
    error_details JSONB,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('success', 'partial', 'failed')) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_upload_history_admin ON upload_history(admin_id);
CREATE INDEX idx_upload_history_status ON upload_history(status);
CREATE INDEX idx_upload_history_uploaded_at ON upload_history(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can view all upload history
CREATE POLICY "Admins can view all upload history"
    ON upload_history FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- RLS Policy: Admins can insert upload history
CREATE POLICY "Admins can insert upload history"
    ON upload_history FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Add comment
COMMENT ON TABLE upload_history IS 'Tracks bulk question upload operations by admin users';
