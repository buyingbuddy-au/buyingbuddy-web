import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resend } from "@/lib/email";

// Verify cron job token
export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  console.log("Running abandoned cart email nurture sequence...");

  try {
    // We are looking for email captures that haven't converted to orders yet
    // The query finds captures made more than 1 hour ago
    // In a full production system you'd use a robust queue (Trigger.dev / Inngest)
    // but this lightweight sqlite approach works perfectly for MVP
    
    // We fetch emails that have NO corresponding order
    // (using left join or a subquery)
    const pendingCaptures = db.prepare(`
      SELECT e.id, e.email, e.created_at, e.vehicle_summary, e.listing_url
      FROM email_captures e
      LEFT JOIN orders o ON e.email = o.customer_email
      WHERE o.id IS NULL
        AND e.converted_to_order IS NULL
        AND datetime(e.created_at) < datetime('now', '-1 hour')
        AND datetime(e.created_at) > datetime('now', '-24 hours')
    `).all() as { id: string; email: string; vehicle_summary: string | null; listing_url: string | null }[];

    let sentCount = 0;

    for (const capture of pendingCaptures) {
      console.log(`Sending abandoned cart email to ${capture.email}`);
      
      const vehicleDesc = capture.vehicle_summary || "that car you were checking";

      // Nurture Email 1 (Abandoned Cart)
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
        `
      });

      sentCount++;
      
      // Update record to mark we've sent the first nurture email
      // We'll reuse the converted_to_order column but set a string flag so we don't re-send
      db.prepare(`UPDATE email_captures SET converted_to_order = 'nurture_1_sent' WHERE id = ?`).run(capture.id);
    }

    return NextResponse.json({ 
      ok: true, 
      processed: pendingCaptures.length,
      sent: sentCount 
    });

  } catch (error) {
    console.error("Abandoned cart cron failed:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
