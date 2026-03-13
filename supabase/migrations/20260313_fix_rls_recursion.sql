-- 1. 무한 루프 방지를 위한 보안 정의자 함수 생성 (RLS 우회)

-- 이 함수는 현재 사용자가 해당 노트의 소유자인지 확인합니다.
CREATE OR REPLACE FUNCTION public.check_is_note_owner(_note_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.notes
    WHERE id = _note_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 이 함수는 현재 사용자가 해당 노트의 협업자(viewer or editor)인지 확인합니다.
CREATE OR REPLACE FUNCTION public.check_is_note_collaborator(_note_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.collaborators
    WHERE note_id = _note_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 이 함수는 현재 사용자가 해당 노트의 편집자(editor) 권한을 가졌는지 확인합니다.
CREATE OR REPLACE FUNCTION public.check_is_note_editor(_note_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.collaborators
    WHERE note_id = _note_id AND user_id = auth.uid() AND role = 'editor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. 기존 정책 삭제 및 재생성 (함수 사용)

-- 2-1. notes 테이블 정책
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.notes;
DROP POLICY IF EXISTS "Collaborators can view shared notes" ON public.notes;
DROP POLICY IF EXISTS "Editors can update shared notes" ON public.notes;

CREATE POLICY "Users can manage their own notes"
    ON public.notes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Collaborators can view shared notes"
    ON public.notes FOR SELECT
    USING (public.check_is_note_collaborator(id));

CREATE POLICY "Editors can update shared notes"
    ON public.notes FOR UPDATE
    USING (public.check_is_note_editor(id));


-- 2-2. collaborators 테이블 정책
DROP POLICY IF EXISTS "Note owners can manage collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Collaborators can view their entries" ON public.collaborators;

CREATE POLICY "Note owners can manage collaborators"
    ON public.collaborators FOR ALL
    USING (public.check_is_note_owner(note_id))
    WITH CHECK (public.check_is_note_owner(note_id));

CREATE POLICY "Collaborators can view their entries"
    ON public.collaborators FOR SELECT
    USING (auth.uid() = user_id);


-- 2-3. note_tags 테이블 정책
DROP POLICY IF EXISTS "Users can manage their own note_tags" ON public.note_tags;

CREATE POLICY "Users can manage their own note_tags"
    ON public.note_tags FOR ALL
    USING (
        auth.uid() = (SELECT user_id FROM public.notes WHERE id = note_id)
        OR public.check_is_note_editor(note_id)
    );
