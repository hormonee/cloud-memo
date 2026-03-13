'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/** 새 메모 생성. folderId 없으면 최상위 레벨 */
export async function createNote(folderId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      folder_id: folderId || null,
      title: '제목 없음',
      content: '',
      is_trashed: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createNote error:', error)
    return { error: error.message }
  }

  revalidatePath('/notes')
  return { id: data.id }
}

/** 메모를 휴지통으로 이동 (soft delete) */
export async function deleteNote(noteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { error } = await supabase
    .from('notes')
    .update({ is_trashed: true, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('user_id', user.id)

  if (error) {
    console.error('deleteNote error:', error)
    return { error: error.message }
  }

  revalidatePath('/notes')
  revalidatePath('/dashboard')
  return { success: true }
}

/** 새 폴더 생성 */
export async function createFolder(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data, error } = await supabase
    .from('folders')
    .insert({
      user_id: user.id,
      name: name.trim(),
    })
    .select('id, name')
    .single()

  if (error) {
    console.error('createFolder error:', error)
    return { error: error.message }
  }

  revalidatePath('/notes')
  return { folder: data }
}

/** 이메일로 메모 공유 */
export async function shareNote(noteId: string, email: string, role: 'viewer' | 'editor') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // 1. 소유권 확인
  const { data: note } = await supabase
    .from('notes')
    .select('id, user_id')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .single()

  if (!note) return { error: '해당 메모에 대한 권한이 없습니다.' }

  // 2. 이메일로 대상 유저 조회
  const { data: targetProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .single()

  if (!targetProfile) return { error: '해당 이메일의 사용자를 찾을 수 없습니다.' }
  if (targetProfile.id === user.id) return { error: '본인과는 공유할 수 없습니다.' }

  // 3. collaborators upsert
  const { error } = await supabase
    .from('collaborators')
    .upsert({
      note_id: noteId,
      user_id: targetProfile.id,
      role,
    }, { onConflict: 'note_id,user_id' })

  if (error) {
    console.error('shareNote error:', error)
    return { error: error.message }
  }

  revalidatePath(`/notes/${noteId}`)
  return { success: true }
}

/** 공유 해제 */
export async function unshareNote(noteId: string, collaboratorUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { error } = await supabase
    .from('collaborators')
    .delete()
    .eq('note_id', noteId)
    .eq('user_id', collaboratorUserId)

  if (error) {
    console.error('unshareNote error:', error)
    return { error: error.message }
  }

  revalidatePath(`/notes/${noteId}`)
  return { success: true }
}

/** 휴지통에서 메모 복구 */
export async function restoreNote(noteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { error } = await supabase
    .from('notes')
    .update({ is_trashed: false, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('user_id', user.id)

  if (error) {
    console.error('restoreNote error:', error)
    return { error: error.message }
  }

  revalidatePath('/notes')
  revalidatePath('/notes/trash')
  return { success: true }
}

/** 메모 영구 삭제 */
export async function permanentlyDeleteNote(noteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', user.id)

  if (error) {
    console.error('permanentlyDeleteNote error:', error)
    return { error: error.message }
  }

  revalidatePath('/notes')
  revalidatePath('/notes/trash')
  return { success: true }
}
