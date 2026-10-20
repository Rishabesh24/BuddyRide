import { NextRequest, NextResponse } from 'next/server';
import { rideRepository } from '@/lib/db/repository';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // TC-M6-02: Enforce administrator authorization
    if (!isAdminAuthorized(request)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Administrator authorization required.' },
        },
        { status: 403 }
      );
    }

    const reports = await rideRepository.getAdminReports();
    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. If resolving an existing report (Admin action)
    if (body.reportId || body.action === 'resolve') {
      if (!isAdminAuthorized(request)) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Administrator authorization required.' } },
          { status: 403 }
        );
      }
      await rideRepository.resolveReport(body.reportId);
      return NextResponse.json({ success: true, message: 'Report resolved.' });
    }

    // 2. Incident report submission (TC-M6-05, TC-M6-06)
    if (!body.reason || typeof body.reason !== 'string' || body.reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Report description cannot be empty.' } },
        { status: 400 }
      );
    }

    if (body.reason.length > 1000) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Report description exceeds maximum length (1000 characters).' } },
        { status: 400 }
      );
    }

    if (!body.targetId || typeof body.targetId !== 'string' || body.targetId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Valid target ID is required.' } },
        { status: 400 }
      );
    }

    const newReport = await rideRepository.submitReport({
      reporterId: body.reporterId || 'u-demo-passenger',
      targetId: body.targetId.trim(),
      targetType: body.targetType || 'ride',
      reason: body.reason,
      status: 'open',
    });

    return NextResponse.json(
      {
        success: true,
        data: newReport,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'REPORT_ERROR', message: error.message },
      },
      { status: 400 }
    );
  }
}
