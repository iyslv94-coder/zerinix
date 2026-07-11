import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { sendReportReadyEmail } from "@/app/lib/integrations/email-events";
import { checkRateLimit, getClientIpFromRequest } from "@/app/lib/security/rate-limit";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const rateLimit = checkRateLimit(
    `email:report-ready:${user.id}:${getClientIpFromRequest(request)}`,
    {
      limit: 8,
      windowMs: 10 * 60 * 1000,
    }
  );

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many email attempts." }, { status: 429 });
  }

  const { data: report, error } = await supabase
    .from("reports")
    .select("id,user_id,title,report_type,status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  if (report.status !== "completed") {
    return NextResponse.json({ error: "Report is not complete." }, { status: 409 });
  }

  const result = await sendReportReadyEmail({
    userId: user.id,
    reportId: report.id as string,
    reportTitle: report.title as string,
    reportType: report.report_type as string,
    recipientEmail: user.email || "",
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, missing: result.missing || [] },
      { status: result.reason === "not_configured" ? 503 : 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
