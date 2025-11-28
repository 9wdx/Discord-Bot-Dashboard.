import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { channelId, content } = await request.json();

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!channelId || !content) {
      return NextResponse.json({ error: 'Channel ID and content required' }, { status: 400 });
    }

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: response.status });
    }

    const message = await response.json();
    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
