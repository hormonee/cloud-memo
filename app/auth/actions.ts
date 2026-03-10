'use server'

import { createClient } from '@/utils/supabase/server'
import { type Provider } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function mapSupabaseError(error: any): { error: string; field?: 'email' | 'password' | 'nickname' } {
  const message = error.message.toLowerCase()
  if (message.includes('email already registered') || message.includes('user already exists')) {
    return { error: '이미 등록된 이메일 주소입니다.', field: 'email' }
  }
  if (message.includes('invalid login credentials')) {
    return { error: '이메일 또는 비밀번호가 일치하지 않습니다.', field: 'email' } // Focus email for general creedential error
  }
  if (message.includes('password')) {
    return { error: '비밀번호가 너무 짧거나 올바르지 않습니다. 보안을 위해 최소 6자 이상 입력해주세요.', field: 'password' }
  }
  if (message.includes('email rate limit exceeded')) {
    return { error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.', field: 'email' }
  }
  if (message.includes('nickname')) {
    return { error: '닉네임을 확인해주세요.', field: 'nickname' }
  }
  
  return { error: '인증 중 오류가 발생했습니다. 다시 시도해주세요.' }
}

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return mapSupabaseError(error)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nickname = formData.get('nickname') as string

  if (!password || password.length < 6) {
    return { error: '비밀번호가 너무 짧습니다. 보안을 위해 최소 6자 이상의 비밀번호를 입력해주세요.', field: 'password' }
  }

  const data = {
    email,
    password,
    options: {
      data: {
        nickname: nickname || email?.split('@')[0],
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return mapSupabaseError(error)
  }

  return { message: '회원가입이 완료되었습니다! 이메일 인증을 확인하시거나 로그인을 진행해주세요.' }
}

export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }

  if (error) {
    return redirect(`/auth?error=${encodeURIComponent(error.message)}`)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth')
}
