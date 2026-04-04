import { chromium, Page } from "playwright";
import fs from "fs";
import path from "path";

// Configuration for PPSR search
const PPSR_URL = "https://transact.ppsr.gov.au/ppsr/SearchBySerialNumber";
const PAYMENT_DETAILS = {
  cardNumber: process.env.PPSR_CARD_NUMBER || "",
  expiryMonth: process.env.PPSR_CARD_EXP_MONTH || "",
  expiryYear: process.env.PPSR_CARD_EXP_YEAR || "",
  cvc: process.env.PPSR_CARD_CVC || "",
  cardholderName: process.env.PPSR_CARD_NAME || "Jordan Lansbury",
};
const WEBHOOK_URL = process.env.PPSR_WEBHOOK_URL || "https://buyingbuddy.com.au/api/admin/ppsr/webhook";

async function runPpsrSearch(vin: string, emailToDeliver: string, referenceId: string) {
  if (!PAYMENT_DETAILS.cardNumber) {
    throw new Error("Missing PPSR payment credentials in environment variables");
  }

  console.log(`Starting PPSR automation for VIN: ${vin}`);
  const browser = await chromium.launch({ headless: process.env.HEADLESS !== "false" });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Navigate to PPSR Search
    console.log("Navigating to PPSR search page...");
    await page.goto(PPSR_URL);

    // Accept terms if present
    const termsCheckbox = page.locator('input[type="checkbox"][id*="Disclaimer"]');
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check();
      await page.click('input[value="Accept"]');
    }

    // 2. Fill Search Details
    console.log("Entering VIN details...");
    // These selectors are generic approximations of the gov site structure
    await page.selectOption('select[id*="SerialNumberType"]', { label: "VIN" });
    await page.fill('input[id*="SerialNumber"]', vin);
    
    // Proceed to next step
    await page.click('input[value="Next"], button:has-text("Next"), button:has-text("Search")');
    await page.waitForLoadState("networkidle");

    // 3. Enter Email for receipt
    console.log(`Entering delivery email: ${emailToDeliver}...`);
    await page.fill('input[type="email"]', emailToDeliver);
    await page.fill('input[id*="ConfirmEmail"]', emailToDeliver);
    
    // Proceed to Payment
    await page.click('input[value="Pay Now"], button:has-text("Pay")');
    await page.waitForLoadState("networkidle");

    // 4. Handle Payment Gateway (usually BPOINT or similar)
    console.log("Processing payment ($2.00)...");
    
    // Switch to payment iframe if it exists
    let paymentFrame = page;
    const iframes = page.frames();
    const bpointFrame = iframes.find(f => f.url().includes("bpoint"));
    if (bpointFrame) {
      paymentFrame = bpointFrame as unknown as Page;
    }

    await paymentFrame.fill('input[id*="CardNumber"], input[name*="pan"]', PAYMENT_DETAILS.cardNumber);
    await paymentFrame.selectOption('select[id*="ExpiryMonth"]', PAYMENT_DETAILS.expiryMonth);
    await paymentFrame.selectOption('select[id*="ExpiryYear"]', PAYMENT_DETAILS.expiryYear);
    await paymentFrame.fill('input[id*="CVC"], input[name*="cvv"]', PAYMENT_DETAILS.cvc);
    await paymentFrame.fill('input[id*="CardholderName"], input[name*="cardholder"]', PAYMENT_DETAILS.cardholderName);
    
    await paymentFrame.click('button:has-text("Submit"), input[value="Pay"]');
    
    // 5. Wait for success and PDF download
    console.log("Waiting for payment confirmation and PDF generation...");
    await page.waitForLoadState("networkidle", { timeout: 30000 });
    
    // The gov site generates a search certificate
    const downloadPromise = page.waitForEvent('download');
    await page.click('a:has-text("Download Certificate"), button:has-text("Download PDF")');
    const download = await downloadPromise;
    
    const downloadPath = path.join(__dirname, `certificates`, `${vin}-${Date.now()}.pdf`);
    if (!fs.existsSync(path.join(__dirname, 'certificates'))) {
      fs.mkdirSync(path.join(__dirname, 'certificates'), { recursive: true });
    }
    
    await download.saveAs(downloadPath);
    console.log(`Certificate downloaded to: ${downloadPath}`);

    // 6. Webhook the PDF back to BuyingBuddy Vercel
    console.log("Sending PDF to Vercel webhook...");
    const pdfBuffer = fs.readFileSync(downloadPath);
    const base64Pdf = pdfBuffer.toString("base64");

    const webhookRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.WEBHOOK_SECRET}`
      },
      body: JSON.stringify({
        referenceId,
        vin,
        status: "completed",
        pdfBase64: base64Pdf,
        timestamp: new Date().toISOString()
      })
    });

    if (!webhookRes.ok) {
      console.error("Webhook failed:", await webhookRes.text());
    } else {
      console.log("Successfully posted result to BuyingBuddy backend!");
    }

  } catch (error) {
    console.error("PPSR Automation failed:", error);
    // Send failure webhook
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referenceId, vin, status: "failed", error: String(error) })
    }).catch(console.error);
  } finally {
    await browser.close();
  }
}

// CLI Execution handler
const [,, vinArg, emailArg, refArg] = process.argv;
if (vinArg && emailArg) {
  runPpsrSearch(vinArg, emailArg, refArg || `ref-${Date.now()}`);
}

export { runPpsrSearch };
