import { NextRequest, NextResponse } from 'next/server';
import { setStaffPin, findStaffByDiscord, updateStaff } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, discord_tag, pin } = body;

    if (!pin || typeof pin !== 'string' || pin.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'PIN must be at least 4 characters/digits' },
        { status: 400 }
      );
    }

    let staffMember = null;
    if (id) {
      staffMember = await setStaffPin(id, pin.trim());
    } else if (discord_tag) {
      const existing = await findStaffByDiscord(discord_tag);
      if (existing) {
        staffMember = await setStaffPin(existing.id, pin.trim());
      }
    }

    if (!staffMember) {
      return NextResponse.json(
        { success: false, error: 'Staff account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: staffMember.id,
        ign: staffMember.ign,
        discord_tag: staffMember.discord_tag,
        role: staffMember.role,
        department: staffMember.department,
      },
      message: 'Security PIN assigned successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to set PIN' },
      { status: 500 }
    );
  }
}
