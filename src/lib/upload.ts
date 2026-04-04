import { put } from "@vercel/blob";

export async function uploadBase64Image(
  base64String: string,
  filenamePrefix: string
): Promise<string | null> {
  if (!base64String || !base64String.startsWith("data:image/")) {
    return null;
  }

  try {
    // Extract base64 data and mime type
    const matches = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    
    // Determine extension
    const ext = mimeType.split("/")[1] || "jpeg";
    const filename = `${filenamePrefix}-${Date.now()}.${ext}`;

    // Upload to Vercel Blob
    // The BLOB_READ_WRITE_TOKEN env var is automatically read by the put() function.
    const { url } = await put(filename, buffer, {
      access: "public",
      contentType: mimeType,
    });

    return url;
  } catch (error) {
    console.error("Vercel Blob upload failed:", error);
    // If upload fails, fallback to storing the massive base64 string directly
    // This provides resilience if Blob isn't configured yet.
    return base64String;
  }
}
