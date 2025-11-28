import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { guildId, name } = await request.json();

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!guildId || !name) {
      return NextResponse.json({ error: 'Guild ID and name required' }, { status: 400 });
    }

    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create role' }, { status: response.status });
    }

    const role = await response.json();
    return NextResponse.json({ role });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
