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

    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        Authorization: authorization,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: response.status });
    }

    const roles = await response.json();
    return NextResponse.json({ roles });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}