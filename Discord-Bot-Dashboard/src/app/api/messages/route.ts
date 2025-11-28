import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const channelId = request.nextUrl.searchParams.get('channelId');
    const limit = request.nextUrl.searchParams.get('limit') || '50';

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 });
    }

    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
      {
        headers: {
          Authorization: authorization,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: response.status });
    }

    const messages = await response.json();
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
