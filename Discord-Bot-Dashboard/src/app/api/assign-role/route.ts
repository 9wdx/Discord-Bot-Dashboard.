import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { guildId, userId, roleId } = await request.json();

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!guildId || !userId || !roleId) {
      return NextResponse.json({ error: 'Guild ID, User ID, and Role ID required' }, { status: 400 });
    }

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: authorization,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to assign role' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { guildId, userId, roleId } = await request.json();

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!guildId || !userId || !roleId) {
      return NextResponse.json({ error: 'Guild ID, User ID, and Role ID required' }, { status: 400 });
    }

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: authorization,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to remove role' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
