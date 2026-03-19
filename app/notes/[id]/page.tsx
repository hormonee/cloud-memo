import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import NotesSidebar from '../NotesSidebar'
import NotesList from '../NotesList'
import NoteEditor from '@/app/notes/[id]/NoteEditor'
import NotesPaneLayout from '../NotesPaneLayout'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ folder?: string; filter?: string }>
}

export default async function NotePage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { folder: folderId, filter } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // 1. Fetch folders
  const { data: folders } = await supabase
    .from('folders')
    .select('id, name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // 2. Fetch notes list (filtered by folder or all)
  let notesQuery = supabase
    .from('notes')
    .select('id, title, content, updated_at, folder_id')
    .eq('user_id', user.id)
    .eq('is_trashed', false)
    .order('updated_at', { ascending: false })

  if (folderId) {
    notesQuery = notesQuery.eq('folder_id', folderId)
  }

  if (filter === 'shared') {
    // Show notes shared with me (collaborator)
    const { data: sharedNoteIds } = await supabase
      .from('collaborators')
      .select('note_id')
      .eq('user_id', user.id)

    const ids = sharedNoteIds?.map(c => c.note_id) || []
    if (ids.length === 0) {
      notesQuery = notesQuery.in('id', ['00000000-0000-0000-0000-000000000000']) // empty result
    } else {
      notesQuery = supabase
        .from('notes')
        .select('id, title, content, updated_at, folder_id')
        .in('id', ids)
        .order('updated_at', { ascending: false })
    }
  } else if (filter === 'trash') {
    notesQuery = supabase
      .from('notes')
      .select('id, title, content, updated_at, folder_id')
      .eq('user_id', user.id)
      .eq('is_trashed', true)
      .order('updated_at', { ascending: false })
  }

  const { data: notes } = await notesQuery

  // 3. Fetch current note + collaborators
  let note = null
  let canEdit = false
  let canView = false
  let isTrashed = false

  if (id !== 'none') {
    const { data: fetchedNote } = await supabase
      .from('notes')
      .select('id, title, content, updated_at, folder_id, is_trashed')
      .eq('id', id)
      .single()
    
    note = fetchedNote

    if (note) {
      isTrashed = note.is_trashed
      
      const { data: ownedNote } = await supabase
        .from('notes')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (ownedNote) {
        canEdit = true
        canView = true
      } else {
        const { data: collab } = await supabase
          .from('collaborators')
          .select('role')
          .eq('note_id', id)
          .eq('user_id', user.id)
          .single()

        if (collab) {
          canView = true
          canEdit = collab.role === 'editor'
        }
      }

      if (!canView) redirect('/notes')
    } else {
      redirect('/notes')
    }
  } else {
    // id 가 'none' 인 경우 (예: 공유된 메모가 하나도 없을 때)
    canView = true 
    canEdit = false
  }

  // 4. Fetch collaborators for share modal (only if owner can manage)
  const { data: collaborators } = canEdit
    ? await supabase
        .from('collaborators')
        .select('user_id, role, user_profiles(email, nickname, full_name, avatar_url)')
        .eq('note_id', id)
    : { data: [] }

  return (
    <NotesPaneLayout
      sidebar={
        <NotesSidebar
          folders={folders || []}
          currentFolderId={folderId}
          noteId={id}
          isTrash={isTrashed}
        />
      }
      list={
        <NotesList
          notes={notes || []}
          activeNoteId={id}
          folderId={folderId}
          isTrashView={filter === 'trash' || isTrashed}
        />
      }
      editor={
        <NoteEditor
          noteId={id}
          initialTitle={note?.title || ''}
          initialContent={note?.content || ''}
          lastUpdated={note?.updated_at || null}
          canEdit={canEdit}
          collaborators={(collaborators ?? []) as any}
          isTrashed={isTrashed}
        />
      }
    />
  )
}
