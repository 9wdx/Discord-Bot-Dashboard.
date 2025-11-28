import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { guildId, userId } = await request.json();

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!guildId || !userId) {
      return NextResponse.json({ error: 'Guild ID and User ID required' }, { status: 400 });
    }

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/bans/${userId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: authorization,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to ban member' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
