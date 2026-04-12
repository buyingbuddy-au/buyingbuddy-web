import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { resend } from "@/lib/email";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
      const vehicleDesc = capture.vehicle_summary || "that car you were checking";

      await resend.emails.send({
        from: "Jordan @ BuyingBuddy <info@buyingbuddy.com.au>",
        to: [capture.email],
        subject: `Don't buy ${vehicleDesc} blind.`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <p>Hey there,</p>
            <p>You recently ran a free check on ${vehicleDesc}.</p>
            <p>If you're still looking at buying it, make sure you don't skip the official PPSR check. It costs less than a coffee ($4.95) and verifies if the car has money owing, is stolen, or has been written off.</p>
            <p><a href="https://buyingbuddy.com.au/ppsr" style="display: inline-block; padding: 10px 20px; background-color: #0D9488; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Run the official PPSR Check here</a></p>
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
