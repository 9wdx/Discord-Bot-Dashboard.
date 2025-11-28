import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: authorization,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch guilds' }, { status: response.status });
    }

    const guilds = await response.json();
    return NextResponse.json({ guilds });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
