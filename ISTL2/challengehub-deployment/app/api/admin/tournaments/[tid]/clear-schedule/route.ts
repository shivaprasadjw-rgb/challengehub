import { NextRequest, NextResponse } from "next/server";
import { clearTournamentSchedule } from "@/lib/tournamentProgression";
import { appendAudit } from "@/lib/audit";
import { requireAdminAuth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { tid: string } }
) {
  try {
    const auth = requireAdminAuth(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const success = clearTournamentSchedule(params.tid, auth.username!);
    
    if (success) {
      // Log the action
      await appendAudit({
        action: 'UPDATE',
        resourceType: 'tournament',
        resourceId: params.tid,
        adminUser: auth.username!,
        details: { message: 'Tournament schedule cleared manually' },
        tournamentId: params.tid
      });

      return NextResponse.json({
        success: true,
        message: 'Tournament schedule cleared successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to clear tournament schedule'
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error clearing tournament schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
