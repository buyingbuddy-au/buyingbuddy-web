import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { resend } from "@/lib/email";
import { escape_html } from "@/lib/security";

function is_authorized_cron_request(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("Authorization") === `Bearer ${secret}`;
}

function clean_subject_fragment(value: unknown) {
  return String(value ?? "that car you were checking")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "that car you were checking";
}

export async function GET(request: Request) {
  if (!is_authorized_cron_request(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: pendingCaptures } = await supabase
      .from("email_captures")
      .select("id, email, vehicle_summary, listing_url")
      .is("converted_to_order", null)
      .lt("created_at", oneHourAgo)
      .gt("created_at", oneDayAgo);

    if (!pendingCaptures?.length) {
      return NextResponse.json({ ok: true, processed: 0, sent: 0 });
    }

    let sentCount = 0;

    for (const capture of pendingCaptures) {
      const vehicleDesc = clean_subject_fragment(capture.vehicle_summary);
      const vehicleDescHtml = escape_html(vehicleDesc);

      await resend.emails.send({
        from: "Jordan @ BuyingBuddy <info@buyingbuddy.com.au>",
        to: [capture.email],
        subject: `Don't buy ${vehicleDesc} blind.`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <p>Hey there,</p>
            <p>You recently ran a free check on ${vehicleDescHtml}.</p>
            <p>If you're still looking at buying it, make sure you don't skip the PPSR check. It costs less than a coffee ($4.95) and verifies if the car has money owing, is stolen, or has been written off.</p>
            <p><a href="https://buyingbuddy.com.au/ppsr" style="display: inline-block; padding: 10px 20px; background-color: #0D9488; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Run the PPSR check here</a></p>
            <p>If you've already moved on, no worries at all.</p>
            <p>Cheers,<br>Jordan<br>BuyingBuddy</p>
          </div>
        `,
      });

      sentCount++;

      await supabase
        .from("email_captures")
        .update({ converted_to_order: "nurture_1_sent" })
        .eq("id", capture.id);
    }

    return NextResponse.json({
      ok: true,
      processed: pendingCaptures.length,
      sent: sentCount,
    });
  } catch (error) {
    console.error("Abandoned cart cron failed:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
