import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { guildId, roleId } = await request.json();

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    if (!guildId || !roleId) {
      return NextResponse.json({ error: 'Guild ID and Role ID required' }, { status: 400 });
    }

    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to delete role' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
