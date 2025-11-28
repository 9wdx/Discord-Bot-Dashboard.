import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { guildId, name, type } = await request.json();

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!guildId || !name) {
      return NextResponse.json({ error: 'Guild ID and name required' }, { status: 400 });
    }

    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, type: type || 0 }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create channel' }, { status: response.status });
    }

    const channel = await response.json();
    return NextResponse.json({ channel });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
