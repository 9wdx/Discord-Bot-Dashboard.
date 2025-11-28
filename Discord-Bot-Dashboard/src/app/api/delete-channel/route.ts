import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { channelId } = await request.json();

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 });
    }

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to delete channel' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
