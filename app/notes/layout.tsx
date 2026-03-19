import React from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function NotesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.plan_type !== 'pro' && profile.plan_type !== 'team')) {
    redirect('/payment')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100">
      <Header variant="dashboard" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  )
}
