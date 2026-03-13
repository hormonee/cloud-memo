-- 1. notes.content 컬럼을 JSONB에서 TEXT로 변경 (HTML 문자열 저장)
ALTER TABLE public.notes
  ALTER COLUMN content TYPE TEXT USING (
    CASE
      WHEN content IS NULL THEN NULL
      WHEN content::text = '{}' THEN ''
      ELSE content::text
    END
  );

-- 2. user_profiles INSERT 정책 추가 (트리거 오류 fallback 대응)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. folders 정책: INSERT 시 WITH CHECK 추가 (기존 ALL 정책 보완)
DROP POLICY IF EXISTS "Users can manage their own folders" ON public.folders;
CREATE POLICY "Users can manage their own folders"
    ON public.folders FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. notes 정책: INSERT 시 WITH CHECK 추가
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.notes;
CREATE POLICY "Users can manage their own notes"
    ON public.notes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. collaborators 정책: INSERT/SELECT WITH CHECK 보완
DROP POLICY IF EXISTS "Note owners can manage collaborators" ON public.collaborators;
CREATE POLICY "Note owners can manage collaborators"
    ON public.collaborators FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = collaborators.note_id
            AND notes.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = collaborators.note_id
            AND notes.user_id = auth.uid()
        )
    );

-- 6. note_tags 정책: WITH CHECK 추가
DROP POLICY IF EXISTS "Users can manage their own note_tags" ON public.note_tags;
CREATE POLICY "Users can manage their own note_tags"
    ON public.note_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = note_tags.note_id
            AND notes.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = note_tags.note_id
            AND notes.user_id = auth.uid()
        )
    );

-- 7. tags 정책: WITH CHECK 추가
DROP POLICY IF EXISTS "Users can manage their own tags" ON public.tags;
CREATE POLICY "Users can manage their own tags"
    ON public.tags FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
