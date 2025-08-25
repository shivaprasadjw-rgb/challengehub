import { NextRequest, NextResponse } from "next/server";
import { updateTournamentDeadline } from "@/lib/deadlineManagement";
import { appendAudit } from "@/lib/audit";
import { requireAdminAuth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { tid: string } }
) {
  try {
    const auth = requireAdminAuth(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { deadline, date } = await req.json();

    if (!deadline && !date) {
      return NextResponse.json({ error: 'Either deadline or date must be provided' }, { status: 400 });
    }

    const result = await updateTournamentDeadline(params.tid, deadline, date, auth.username!);.\istl2-backup.bat
    
    if (result) {
      // Log the action
      await appendAudit({
        action: 'UPDATE',
        resourceType: 'tournament',
        resourceId: params.tid,
        adminUser: auth.username!,
        details: { message: `Tournament deadline updated: ${deadline ? `deadline=${deadline}` : ''}${date ? `date=${date}` : ''}` },
        tournamentId: params.tid
      });

      return NextResponse.json({
        success: true,
        message: 'Tournament deadline updated successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to update tournament deadline'
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating tournament deadline:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
