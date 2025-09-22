import { NextResponse } from "next/server"

export async function GET() {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const hasConfig = !!(CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

  return NextResponse.json({
    hasConfig,
    clientId: CLIENT_ID || null,
    authUrl: hasConfig
      ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/google-fit/callback&response_type=code&scope=https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.location.read&access_type=offline`
      : null,
  })
}
