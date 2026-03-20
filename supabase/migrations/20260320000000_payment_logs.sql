-- 결제 로그 테이블 생성
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    order_id TEXT UNIQUE NOT NULL,
    amount BIGINT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'CANCELLED', 'FAILED', 'SUCCESS')),
    fail_reason TEXT,
    payment_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 설정
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment logs"
    ON public.payment_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment logs"
    ON public.payment_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment logs"
    ON public.payment_logs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can all payment logs"
    ON public.payment_logs FOR ALL
    USING (true);
