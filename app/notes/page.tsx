import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Cloud Memo - 나의 메모",
  description: "실시간 동기화되는 나만의 스마트 메모 라이브러리. 모든 아이디어를 체계적으로 관리하세요.",
  openGraph: {
    title: "Cloud Memo - 나의 메모",
    description: "실시간 동기화되는 나만의 스마트 메모 라이브러리. 모든 아이디어를 체계적으로 관리하세요.",
  }
}

interface PageProps {
  searchParams: Promise<{ folder?: string; filter?: string }>
}

export default async function NotesIndexPage({ searchParams }: PageProps) {
  const { folder: folderId, filter } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // 1. If filter is SHARED
  if (filter === 'shared') {
    const { data: sharedNote } = await supabase
      .from('collaborators')
      .select('note_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (sharedNote?.note_id) {
      redirect(`/notes/${sharedNote.note_id}?filter=shared`)
    } else {
      // 공유된 메모가 하나도 없는 경우
      redirect('/notes/none?filter=shared')
    }
  }

  // 2. If FOLDER is specified
  if (folderId) {
    const { data: folderNote } = await supabase
      .from('notes')
      .select('id')
      .eq('user_id', user.id)
      .eq('folder_id', folderId)
      .eq('is_trashed', false)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (folderNote) {
      redirect(`/notes/${folderNote.id}?folder=${folderId}`)
    }
  }

  // 3. Default: Redirect to the most recently updated personal note
  const { data: recentNote } = await supabase
    .from('notes')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_trashed', false)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (recentNote) {
    redirect(`/notes/${recentNote.id}`)
  }

  // No notes exist — auto-create the first one
  const { data: newNote } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: '첫 번째 메모',
      content: '<p>여기에 메모를 입력하세요. Cloud Memo에 오신 것을 환영합니다! ☁️</p>',
      is_trashed: false,
    })
    .select('id')
    .single()

  if (newNote) {
    redirect(`/notes/${newNote.id}`)
  }

  // Final fallback (should not reach here)
  redirect('/dashboard')
}
