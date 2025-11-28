import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const guildId = request.nextUrl.searchParams.get('guildId');

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!guildId) {
      return NextResponse.json({ error: 'Guild ID required' }, { status: 400 });
    }

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}`,
      {
        headers: {
          Authorization: authorization,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch guild settings' }, { status: response.status });
    }

    const guild = await response.json();
    return NextResponse.json({ guild });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { guildId, ...settings } = await request.json();

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!guildId) {
      return NextResponse.json({ error: 'Guild ID required' }, { status: 400 });
    }

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to update guild settings' }, { status: response.status });
    }

    const guild = await response.json();
    return NextResponse.json({ guild });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
