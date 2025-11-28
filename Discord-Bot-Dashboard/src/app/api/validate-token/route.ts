import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Validate token by making a request to Discord API
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid bot token' }, { status: 401 });
    }

    const botData = await response.json();

    return NextResponse.json({
      success: true,
      bot: {
        id: botData.id,
        username: botData.username,
        discriminator: botData.discriminator,
        avatar: botData.avatar,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to validate token' }, { status: 500 });
  }
}
