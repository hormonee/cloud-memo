import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import NotesSidebar from '../NotesSidebar'
import NotesList from '../NotesList'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import NotesPaneLayout from '../NotesPaneLayout'
import TrashEmptyView from './TrashEmptyView'
import React from 'react'

export default async function TrashPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // 1. Fetch folders
  const { data: folders } = await supabase
    .from('folders')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name')

  // 2. Fetch trashed notes
  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, content, updated_at, folder_id')
    .eq('user_id', user.id)
    .eq('is_trashed', true)
    .order('updated_at', { ascending: false })

  return (
    <NotesPaneLayout
      sidebar={<NotesSidebar folders={folders || []} isTrash={true} />}
      list={<NotesList notes={notes || []} isTrashView={true} />}
      editor={<TrashEmptyView notesCount={notes?.length || 0} />}
    />
  )
}
