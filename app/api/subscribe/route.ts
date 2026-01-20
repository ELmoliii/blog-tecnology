import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ status: 'error', message: 'Name and email are required' }, { status: 400 })
    }

    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL
    const API_SECRET = process.env.API_SECRET

    if (!GOOGLE_SCRIPT_URL || !API_SECRET) {
      console.error('Missing environment variables for newsletter')
      return NextResponse.json({ status: 'error', message: 'Configuration error' }, { status: 500 })
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, secret: API_SECRET }),
    })

    const data = await response.json()

    if (data.status === 'success') {
      return NextResponse.json({ status: 'success' })
    } else {
      return NextResponse.json({ status: 'error', message: data.message }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in subscribe API:', error)
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 })
  }
}