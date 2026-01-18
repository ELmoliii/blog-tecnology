import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ status: 'error', message: 'Name and email are required' }, { status: 400 })
    }

    const response = await fetch('https://script.google.com/macros/s/AKfycbwYPXNcJZD3mrYHmzsrkVb_bVkPWFvZC2g9uFtF26Gt314m4wT818CicqR0IeWuaIfuhw/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, secret: 'techvista_secret_2025' }),
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