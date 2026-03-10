-- 1. 유저 프로필 테이블 생성
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nickname TEXT,
    full_name TEXT,
    avatar_url TEXT,
    plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic', 'pro', 'team')),
    storage_usage_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 유저 동기화 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url, nickname)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'nickname'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users -> public.user_profiles 트리거 설정
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 폴더 및 메모 테이블 생성
CREATE TABLE public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    title TEXT DEFAULT 'Untitled',
    content JSONB DEFAULT '{}'::jsonb,
    is_trashed BOOLEAN DEFAULT false,
    size_bytes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 태그 테이블 생성
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE TABLE public.note_tags (
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

-- 5. 협업자/공유 테이블 생성
CREATE TABLE public.collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'editor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(note_id, user_id)
);

-- 6. RLS(Row Level Security) 설정
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- 6-1. user_profiles 정책
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.user_profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- 6-2. folders 정책
CREATE POLICY "Users can manage their own folders"
    ON public.folders FOR ALL
    USING (auth.uid() = user_id);

-- 6-3. notes 정책 (본인 소유 + 공유)
CREATE POLICY "Users can manage their own notes"
    ON public.notes FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Collaborators can view shared notes"
    ON public.notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.collaborators
            WHERE collaborators.note_id = notes.id
            AND collaborators.user_id = auth.uid()
        )
    );

CREATE POLICY "Editors can update shared notes"
    ON public.notes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.collaborators
            WHERE collaborators.note_id = notes.id
            AND collaborators.user_id = auth.uid()
            AND collaborators.role = 'editor'
        )
    );

-- 6-4. tags & note_tags 정책
CREATE POLICY "Users can manage their own tags"
    ON public.tags FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own note_tags"
    ON public.note_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = note_tags.note_id
            AND notes.user_id = auth.uid()
        )
    );

-- 6-5. collaborators 정책
CREATE POLICY "Note owners can manage collaborators"
    ON public.collaborators FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.notes
            WHERE notes.id = collaborators.note_id
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Collaborators can view their entries"
    ON public.collaborators FOR SELECT
    USING (auth.uid() = user_id);
