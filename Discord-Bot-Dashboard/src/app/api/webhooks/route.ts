import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const channelId = request.nextUrl.searchParams.get('channelId');

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 });
    }

    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/webhooks`,
      {
        headers: {
          Authorization: authorization,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: response.status });
    }

    const webhooks = await response.json();
    return NextResponse.json({ webhooks });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { channelId, name } = await request.json();

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!channelId || !name) {
      return NextResponse.json({ error: 'Channel ID and name required' }, { status: 400 });
    }

    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/webhooks`,
      {
        method: 'POST',
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create webhook' }, { status: response.status });
    }

    const webhook = await response.json();
    return NextResponse.json({ webhook });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
