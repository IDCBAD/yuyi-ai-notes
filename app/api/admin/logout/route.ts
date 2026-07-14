import { COOKIE_NAME } from '@/lib/admin-auth'

export async function POST() {
  const response = Response.json({ success: true })
  response.headers.append('Set-Cookie', `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`)
  return response
}

