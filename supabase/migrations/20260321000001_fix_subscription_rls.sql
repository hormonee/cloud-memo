-- subscriptions 테이블에 대한 추가 RLS 정책 설정
-- 기존에 SELECT 정책만 있으므로 INSERT와 UPDATE 권한이 없어 42501 에러가 발생함

-- 1. INSERT 정책 추가: 자신의 user_id로 행을 추가할 수 있음
CREATE POLICY "Users can insert their own subscription"
    ON public.subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 2. UPDATE 정책 추가: 자신의 구독 정보를 수정할 수 있음
CREATE POLICY "Users can update their own subscription"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. (참고) 대시보드에서 모든 메모 수가 0으로 오표기될 수 있는 부분이나 빌드 오류를 방지하기 위해 
-- 이 시점에는 RLS 정책만 확실히 적용합니다.
