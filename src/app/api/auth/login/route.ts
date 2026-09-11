import { NextRequest, NextResponse } from 'next/server';
import { findStaffByDiscord } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { discord_tag, pin } = body;

    if (!discord_tag || typeof discord_tag !== 'string' || !discord_tag.trim()) {
      return NextResponse.json(
        { success: false, error: 'Discord username is required' },
        { status: 400 }
      );
    }

    const staff = await findStaffByDiscord(discord_tag);

    if (!staff) {
      return NextResponse.json({
        success: false,
        notFound: true,
        error: `No staff profile found for "${discord_tag}". You can register below or request an Owner to add you.`,
      });
    }

    // Check if staff has set a PIN yet
    if (!staff.pin) {
      return NextResponse.json({
        success: false,
        needPinSetup: true,
        staff: {
          id: staff.id,
          ign: staff.ign,
          discord_tag: staff.discord_tag,
          role: staff.role,
          department: staff.department,
        },
        message: 'No security PIN has been assigned yet. Please set your unique PIN.',
      });
    }

    // Staff has a PIN, verify it
    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({
        success: false,
        needPinInput: true,
        error: 'Please enter your security PIN',
      });
    }

    if (staff.pin.trim() !== pin.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Incorrect security PIN. Please try again or ask an Owner/Developer to reset your PIN.',
      });
    }

    // Success
    return NextResponse.json({
      success: true,
      user: {
        id: staff.id,
        ign: staff.ign,
        discord_tag: staff.discord_tag,
        role: staff.role,
        department: staff.department,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
