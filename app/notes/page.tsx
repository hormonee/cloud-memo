import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function NotesIndexPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch the most recently updated note for the user
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
  } else {
    // Redirect to the default/mock note if no notes exist
    redirect('/notes/1')
  }
}
