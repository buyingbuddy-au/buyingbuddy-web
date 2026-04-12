import "@/lib/pdfkit-compat";
import PDFDocument from "pdfkit";
import type { OrderRecord, JsonValue } from "@/lib/types";

const TEAL = "#0D9488";
const TEAL_RGB: [number, number, number] = [13, 148, 136];
const DARK_TEXT = "#1F2937";
const LIGHT_GRAY = "#F3F4F6";
const BORDER_GRAY = "#D1D5DB";
const RED_FLAG_COLOR = "#DC2626";
const GREEN_COLOR = "#16A34A";
const PAGE_WIDTH = 595.28;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function format_currency(value: number | null): string {
  if (value === null) return "N/A";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function rgb(...args: [number, number, number]): string {
  return `rgb(${args[0]},${args[1]},${args[2]})`;
}

function draw_footer(doc: InstanceType<typeof PDFDocument>, page_num: number, total_pages: number) {
  doc
    .fontSize(9)
    .fillColor("#6B7280")
    .text(
      "buyingbuddy.com.au | info@buyingbuddy.com.au",
      MARGIN,
      doc.page.height - 40,
      { align: "center", width: CONTENT_WIDTH },
    );
  doc.text(
    `Page ${page_num} of ${total_pages}`,
    MARGIN,
    doc.page.height - 28,
    { align: "center", width: CONTENT_WIDTH },
  );
}

function draw_header(doc: InstanceType<typeof PDFDocument>, is_cover_page = true) {
  doc.fillColor(rgb(...TEAL_RGB)).fontSize(24).text("Buying Buddy", MARGIN, 45, {
    align: "left",
    width: CONTENT_WIDTH,
  });

  if (is_cover_page) {
    doc.fillColor("#374151").fontSize(13).text("Vehicle Report", MARGIN, 78, {
      align: "left",
      width: CONTENT_WIDTH,
    });
  }

  doc
    .moveTo(MARGIN, is_cover_page ? 98 : 78)
    .lineTo(PAGE_WIDTH - MARGIN, is_cover_page ? 98 : 78)
    .strokeColor(rgb(...TEAL_RGB))
    .lineWidth(2)
    .stroke();
}

function draw_vehicle_summary_table(
  doc: InstanceType<typeof PDFDocument>,
  order: OrderRecord,
): number {
  doc.fontSize(13).fillColor(DARK_TEXT).text("Vehicle Details", MARGIN, 115);

  const rows: [string, string][] = [
    ["Make", order.vehicle_make ?? "N/A"],
    ["Model", order.vehicle_model ?? "N/A"],
    ["Year", order.vehicle_year?.toString() ?? "N/A"],
    [
      "Mileage",
      order.vehicle_mileage
        ? `${order.vehicle_mileage.toLocaleString("en-AU")} km`
        : "N/A",
    ],
    ["Rego", order.vehicle_rego ?? "N/A"],
    ["VIN", order.vehicle_vin ?? "N/A"],
    ["Listed Price", format_currency(order.vehicle_price_listed)],
  ];

  let y = 135;

  // Header row
  doc.rect(MARGIN, y, CONTENT_WIDTH, 20).fillColor(LIGHT_GRAY).fill();
  doc.strokeColor(BORDER_GRAY).lineWidth(0.5).stroke();
  doc.fillColor(DARK_TEXT).fontSize(10).text("Field", MARGIN + 5, y + 5, { width: 180 });
  doc.text("Value", MARGIN + 185, y + 5, { width: CONTENT_WIDTH - 190 });
  y += 20;

  for (const [field, value] of rows) {
    if (y + 18 > doc.page.height - 60) {
      doc.addPage();
      y = 50;
    }
    doc.rect(MARGIN, y, CONTENT_WIDTH, 18).fillColor("#FFFFFF").fill();
    doc.strokeColor(BORDER_GRAY).lineWidth(0.5).stroke();
    doc.fillColor("#4B5563").text(field, MARGIN + 5, y + 3, { width: 180 });
    doc.fillColor(DARK_TEXT).text(value, MARGIN + 185, y + 3, {
      width: CONTENT_WIDTH - 190,
      ellipsis: true,
    });
    y += 18;
  }

  return y;
}

function draw_market_value_bar(
  doc: InstanceType<typeof PDFDocument>,
  order: OrderRecord,
  start_y: number,
): number {
  if (start_y + 90 > doc.page.height - 60) {
    doc.addPage();
    start_y = 50;
  }

  doc.fontSize(13).fillColor(DARK_TEXT).text("Market Value Range", MARGIN, start_y);
  start_y += 28;

  const low = order.market_value_low ?? 0;
  const high = order.market_value_high ?? 0;
  const listed = order.vehicle_price_listed ?? 0;

  const bar_width = CONTENT_WIDTH - 160;
  const bar_x = MARGIN + 160;
  const bar_y = start_y;

  // Bar background
  doc.rect(bar_x, bar_y, bar_width, 22).fillColor("#E5E7EB").fill();
  doc.strokeColor(BORDER_GRAY).lineWidth(0.5).stroke();

  if (high > low) {
    const range = high - low;
    const min_val = low - range * 0.5;
    const norm = (v: number) => Math.max(0, Math.min(1, (v - min_val) / (range * 1.5)));
    const low_norm = norm(low);
    const high_norm = norm(high);

    const fill_x = bar_x + low_norm * bar_width;
    const fill_w = (high_norm - low_norm) * bar_width;

    doc.rect(fill_x, bar_y, fill_w, 22).fillColor(rgb(...TEAL_RGB)).fill();

    if (listed > 0) {
      const marker_norm = norm(listed);
      const marker_x = bar_x + marker_norm * bar_width;
      doc
        .circle(marker_x, bar_y + 11, 8)
        .fillColor(RED_FLAG_COLOR)
        .fill()
        .strokeColor("#FFFFFF")
        .lineWidth(2)
        .stroke()
        .fillColor("#FFFFFF")
        .fontSize(8)
        .text("★", marker_x - 4, bar_y + 6, { width: 8 });
    }
  }

  // Labels
  doc.fontSize(9).fillColor("#6B7280");
  doc.text("Below market", MARGIN, bar_y + 26, { width: 150 });
  doc.text(format_currency(low), MARGIN, bar_y + 26, { width: 150, align: "right" });
  doc.text("Above market", bar_x + bar_width - 150, bar_y + 26, { width: 150 });
  doc.text(format_currency(high), bar_x + bar_width - 150, bar_y + 26, {
    width: 150,
    align: "left",
  });

  // Legend
  let legend_x = MARGIN;
  if (listed > 0 && high > low) {
    doc.circle(MARGIN + 6, bar_y + 48, 5).fillColor(RED_FLAG_COLOR).fill();
    doc.fillColor("#4B5563").fontSize(9).text("★ Listed price", MARGIN + 16, bar_y + 43);
    legend_x = MARGIN + 120;
  }

  doc
    .rect(legend_x, bar_y + 43, 12, 12)
    .fillColor(rgb(...TEAL_RGB))
    .fill();
  doc.fillColor("#4B5563").fontSize(9).text("Market range", legend_x + 16, bar_y + 46);

  return start_y + 60;
}

function draw_red_flags(
  doc: InstanceType<typeof PDFDocument>,
  red_flags: string[],
  start_y: number,
): number {
  if (start_y + 70 > doc.page.height - 60) {
    doc.addPage();
    start_y = 50;
  }

  doc.fontSize(13).fillColor(DARK_TEXT).text("Red Flags", MARGIN, start_y);
  start_y += 22;

  if (!red_flags || red_flags.length === 0) {
    doc.fontSize(11).fillColor(GREEN_COLOR).text("✓ No red flags detected.", MARGIN, start_y);
    return start_y + 24;
  }

  for (const flag of red_flags) {
    if (start_y + 20 > doc.page.height - 60) {
      doc.addPage();
      start_y = 50;
    }
    doc
      .fillColor(RED_FLAG_COLOR)
      .fontSize(11)
      .text("⚠", MARGIN, start_y, { width: 20 })
      .fillColor(DARK_TEXT)
      .text(flag, MARGIN + 20, start_y, { width: CONTENT_WIDTH - 20 });
    start_y += 20;
  }

  return start_y + 8;
}

function draw_verdict(
  doc: InstanceType<typeof PDFDocument>,
  verdict: string | null,
  start_y: number,
): number {
  if (start_y + 70 > doc.page.height - 60) {
    doc.addPage();
    start_y = 50;
  }

  doc.fontSize(13).fillColor(DARK_TEXT).text("Quick Verdict", MARGIN, start_y);
  start_y += 22;

  doc.fontSize(11).fillColor("#374151").text(verdict ?? "Pending review.", MARGIN, start_y, {
    width: CONTENT_WIDTH,
    lineGap: 4,
  });

  return start_y + 30;
}

function draw_ppsr_page(doc: InstanceType<typeof PDFDocument>, ppsr_result: JsonValue | null) {
  doc.addPage();
  let y = 50;

  doc.fillColor(rgb(...TEAL_RGB)).fontSize(20).text("PPSR Check Results", MARGIN, y, {
    align: "left",
    width: CONTENT_WIDTH,
  });
  y += 28;

  doc
    .moveTo(MARGIN, y)
    .lineTo(PAGE_WIDTH - MARGIN, y)
    .strokeColor(rgb(...TEAL_RGB))
    .lineWidth(2)
    .stroke();
  y += 20;

  if (!ppsr_result) {
    doc.fontSize(11).fillColor("#6B7280").text("No PPSR data available.", MARGIN, y);
    return;
  }

  const ppsr = ppsr_result as Record<string, JsonValue>;

  const items: [string, string | null][] = [
    [
      "Finance Owing",
      ppsr.finance_owing !== undefined ? String(ppsr.finance_owing) : null,
    ],
    [
      "Stolen Status",
      ppsr.stolen !== undefined ? String(ppsr.stolen) : null,
    ],
    [
      "Write-off Status",
      ppsr.writeoff !== undefined ? String(ppsr.writeoff) : null,
    ],
    [
      "Security Interests",
      ppsr.security_interests !== undefined ? String(ppsr.security_interests) : null,
    ],
    [
      "PPSR Checked At",
      ppsr.checked_at !== undefined ? String(ppsr.checked_at) : null,
    ],
  ];

  for (const [label, value] of items) {
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 50;
    }
    if (value === null) continue;
    doc.fontSize(11).fillColor(DARK_TEXT).text(label + ":", MARGIN, y, { continued: false, width: 160 });
    doc.fillColor(rgb(...TEAL_RGB)).text(value, MARGIN + 165, y, { width: CONTENT_WIDTH - 165 });
    y += 22;
  }

  if (ppsr.notes && typeof ppsr.notes === "string") {
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(11).fillColor(DARK_TEXT).text("Notes:", MARGIN, y);
    y += 18;
    doc.fontSize(10).fillColor("#4B5563").text(ppsr.notes, MARGIN, y, { width: CONTENT_WIDTH });
  }
}

function draw_dealer_review_page(doc: InstanceType<typeof PDFDocument>, dealer_verdict: string | null) {
  doc.addPage();
  let y = 50;

  doc.fillColor(rgb(...TEAL_RGB)).fontSize(20).text("Dealer Review", MARGIN, y, {
    align: "left",
    width: CONTENT_WIDTH,
  });
  y += 28;

  doc
    .moveTo(MARGIN, y)
    .lineTo(PAGE_WIDTH - MARGIN, y)
    .strokeColor(rgb(...TEAL_RGB))
    .lineWidth(2)
    .stroke();
  y += 20;

  if (!dealer_verdict) {
    doc.fontSize(11).fillColor("#6B7280").text("No dealer review available yet.", MARGIN, y);
    return;
  }

  doc.fontSize(11).fillColor("#374151").text(dealer_verdict, MARGIN, y, {
    width: CONTENT_WIDTH,
    lineGap: 6,
  });
}

export async function generate_order_report(
  order: OrderRecord,
  _options?: Record<string, unknown>,
): Promise<{ buffer: Buffer; filename: string }> {
  const filename = `${order.id}.pdf`;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => {
      resolve({ buffer: Buffer.concat(chunks), filename });
    });
    doc.on("error", reject);

    // ─── PAGE 1: Cover ───
    draw_header(doc, true);

    let y = 115;
    y = draw_vehicle_summary_table(doc, order);
    y += 10;
    y = draw_market_value_bar(doc, order, y);
    y += 10;
    y = draw_red_flags(doc, order.red_flags ?? [], y);
    y += 10;
    draw_verdict(doc, order.listing_verdict, y);

    // ─── PAGE 2: PPSR ───
    if (order.ppsr_result) {
      draw_ppsr_page(doc, order.ppsr_result);
    }

    // ─── PAGE 3: Dealer review ───
    if (order.dealer_verdict) {
      draw_dealer_review_page(doc, order.dealer_verdict);
    }

    // ─── Footers on all pages ───
    const total = doc.bufferedPageRange().count;
    for (let i = 0; i < total; i++) {
      doc.switchToPage(i);
      draw_footer(doc, i + 1, total);
    }

    doc.end();
  });
}
