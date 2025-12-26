-- =====================================================
-- ENROLLMENT REQUESTS TABLE FOR MANUAL PAYMENT CONFIRMATION
-- =====================================================
-- Run this to add manual payment confirmation feature

-- Create enrollment_requests table
CREATE TABLE IF NOT EXISTS public.enrollment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,

    -- Student information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,

    -- Payment details
    amount_paid DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'IDR',
    bank_account_used TEXT, -- Which bank student used (BCA, Mandiri, etc.)
    payment_date DATE,
    payment_proof_url TEXT, -- Cloudinary URL for proof of payment screenshot
    payment_reference TEXT, -- Transaction reference number if any

    -- Request status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    student_notes TEXT, -- Additional notes from student
    admin_notes TEXT, -- Notes from admin when approving/rejecting

    -- Approval tracking
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES public.profiles(id),
    rejected_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate pending requests
    UNIQUE(student_id, course_id, status)
);

-- Create indexes for better query performance
CREATE INDEX idx_enrollment_requests_student ON public.enrollment_requests(student_id);
CREATE INDEX idx_enrollment_requests_course ON public.enrollment_requests(course_id);
CREATE INDEX idx_enrollment_requests_status ON public.enrollment_requests(status);
CREATE INDEX idx_enrollment_requests_created ON public.enrollment_requests(created_at DESC);

-- RLS Policies
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;

-- Students can create and view their own requests
CREATE POLICY "Students can create enrollment requests"
    ON public.enrollment_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own enrollment requests"
    ON public.enrollment_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = student_id);

-- Students can update their own pending requests (to fix mistakes)
CREATE POLICY "Students can update their pending requests"
    ON public.enrollment_requests
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = student_id AND status = 'pending')
    WITH CHECK (auth.uid() = student_id AND status = 'pending');

-- Admins and mentors can view all requests
CREATE POLICY "Admins can view all enrollment requests"
    ON public.enrollment_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'mentor')
        )
    );

-- Admins can update (approve/reject) requests
CREATE POLICY "Admins can update enrollment requests"
    ON public.enrollment_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enrollment_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER enrollment_requests_updated_at
    BEFORE UPDATE ON public.enrollment_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_enrollment_request_updated_at();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Successfully created enrollment_requests table!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Features:';
    RAISE NOTICE '  - Manual payment confirmation workflow';
    RAISE NOTICE '  - Payment proof upload support';
    RAISE NOTICE '  - Admin approval system';
    RAISE NOTICE '  - Status tracking (pending/approved/rejected)';
    RAISE NOTICE '  - Row Level Security enabled';
    RAISE NOTICE '========================================';
END $$;
