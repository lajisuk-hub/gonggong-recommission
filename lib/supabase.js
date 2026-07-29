import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경변수가 없으면 null 을 반환해서, 화면에서 "저장소 연결이 필요합니다" 안내를 띄운다.
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const BUCKET = 'recommission'
export const SETTINGS_ID = 'main'

// 파일(사진)을 Supabase 저장소에 올리고 공개 주소를 돌려준다.
export async function uploadFile(file, folder) {
  if (!supabase) throw new Error('저장소 연결이 필요합니다.')
  const safeName = file.name.replace(/[^\w.\-]/g, '_')
  const path = `${folder}/${Date.now()}_${safeName}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
