import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/google-fit/callback`

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json({ error: "Google Fit configuration missing on server" }, { status: 500 })
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: "Failed to exchange code for token", details: tokenData }, { status: 400 })
    }

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    })
  } catch (error) {
    console.error("Google Fit auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
