import type { NextRequest } from 'next/server'
import {
  verifyPassword,
  getSessionToken,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
  getAdminAuthConfigError,
} from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const configError = await getAdminAuthConfigError()
    if (configError) {
      return Response.json({ error: configError }, { status: 503 })
    }

    const { password } = (await req.json()) as { password?: string }

    if (!password || !(await verifyPassword(password))) {
      return Response.json({ error: '密码错误' }, { status: 401 })
    }

    const token = await getSessionToken()
    if (!token) {
      return Response.json({ error: '管理员鉴权初始化失败，请检查环境变量配置' }, { status: 503 })
    }
    const response = Response.json({ success: true })

    response.headers.append(
      'Set-Cookie',
      `${COOKIE_NAME}=${token}; Max-Age=${COOKIE_MAX_AGE}; Path=/; HttpOnly; SameSite=Lax`,
    )

    return response
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 })
  }
}
