import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/auth')
  }

  // 2. Fetch user profile data (nickname, avatar, joined date)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('nickname, full_name, avatar_url, created_at, plan_type')
    .eq('id', user.id)
    .single()

  const displayName = profile?.nickname || profile?.full_name || user.email?.split('@')[0] || '사용자'
  const joinedYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear()
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4F6F52&color=fff`

  // 3. Fetch notes statistics
  const { count: totalNotes } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_trashed', false)

  const { count: sharedNotes } = await supabase
    .from('collaborators')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: totalFolders } = await supabase
    .from('folders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // 4. Fetch recent notes
  const { data: recentNotes } = await supabase
    .from('notes')
    .select('id, title, updated_at')
    .eq('user_id', user.id)
    .eq('is_trashed', false)
    .order('updated_at', { ascending: false })
    .limit(4)

  const colors = ['blue', 'amber', 'emerald', 'purple']
  const icons = ['description', 'lightbulb', 'checklist', 'history_edu']

  return (
    <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark custom-scrollbar">
      {/* Dashboard Content */}
      <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-10">
        {/* Welcome Section */}
        <div className="relative">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">반가워요, {displayName}님</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">오늘의 생산성 요약입니다.</p>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Subscription Card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-primary/5 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute -top-12 -right-12 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-[240px] text-primary">workspace_premium</span>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-[12px] font-black rounded-full uppercase tracking-widest border border-primary/20">사용 중인 요금제</span>
                <h3 className="text-3xl font-black mt-4">{profile?.plan_type === 'pro' ? '프로페셔널 플랜' : profile?.plan_type === 'team' ? '팀 플랜' : '베이직 플랜'}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">기본 제공 서비스 혜택을 이용 중입니다.</p>
              </div>
              <div className="mt-10 flex gap-4">
                <button className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">결제 관리</button>
                <button className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">내역 보기</button>
              </div>
            </div>
          </div>

          {/* Usage Card */}
          <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-primary/5 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">이달의 사용량</h3>
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined font-bold">data_usage</span>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className="text-slate-500 font-bold">클라우드 저장공간</span>
                    <span className="font-black text-primary">0 / 5 GB</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full shadow-inner" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className="text-slate-500 font-bold">API 호출</span>
                    <span className="font-black text-primary">0 / 10k</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary shadow-inner" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[14px] text-slate-400 mt-8 leading-relaxed font-medium">사용량은 14일 후에 초기화됩니다.</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-primary/5 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="px-8 py-5 border-b border-primary/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
            <h3 className="font-bold text-xl">최근 활동</h3>
            <button className="text-primary text-sm font-black hover:underline px-3 py-1 rounded-lg hover:bg-primary/5 transition-all">전체 보기</button>
          </div>
          <div className="divide-y divide-primary/5">
            {recentNotes && recentNotes.length > 0 ? recentNotes.map((item, idx) => {
              const color = colors[idx % colors.length]
              const icon = icons[idx % icons.length]
              const date = new Date(item.updated_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

              return (
                <div key={item.id} className="px-8 py-5 flex items-center justify-between hover:bg-primary/5 transition-all cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className={`size-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110
                    ${color === 'blue' ? 'bg-blue-100/50 text-blue-600' : ''}
                    ${color === 'amber' ? 'bg-amber-100/50 text-amber-600' : ''}
                    ${color === 'emerald' ? 'bg-emerald-100/50 text-emerald-600' : ''}
                    ${color === 'purple' ? 'bg-purple-100/50 text-purple-600' : ''}
                  `}>
                      <span className="material-symbols-outlined text-[24px]">{icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-base group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{date} 수정됨</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-300 hover:text-slate-500 transition-colors">more_vert</span>
                  </div>
                </div>
              )
            }) : (
              <div className="p-8 text-center text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">note_stack</span>
                <p className='text-[14px]'>작성된 메모가 없습니다. 첫 메모를 작성해보세요!</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-12">
          {[
            { label: '전체 메모', value: totalNotes?.toString() || '0' },
            { label: '공유된 메모', value: sharedNotes?.toString() || '0' },
            { label: '사용된 태그', value: '0' },
            { label: '폴더 수', value: totalFolders?.toString() || '0' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-primary/10 shadow-sm hover:border-primary/30 transition-all group">
              <p className="text-3xl font-black text-primary group-hover:scale-110 transition-transform">{stat.value}</p>
              <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest mt-3">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
