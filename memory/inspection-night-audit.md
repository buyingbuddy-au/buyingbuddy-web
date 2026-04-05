# Inspection UX Night Audit
Date: 6 April 2026

## Objective
Audit `/inspect`, `/inspect/full`, and `/inspect/print` end-to-end to fix broken/awkward interactions, enforce dark styling consistently, and ensure the checklist remains practical for ordinary buyers.

## Findings & Fixes

### 1. `/inspect` (Landing Hub)
* **Issue:** The landing page used a light theme (`bg-gray-50`, `bg-white`) while the inspection tools used a dark theme (`bg-slate-950`). This created a jarring transition.
* **Fix:** Converted the entire landing page to match the dark styling of the tools (`bg-slate-950`, `border-white/10`, text variants of `slate`).
* **Issue:** The dynamic CTA buttons awkwardly generated "Start Full Mode" and "Start Quick Mode".
* **Fix:** Replaced the generation logic with explicit, action-oriented CTAs: "Start Full Inspection" and "Open Print Checklist". 

### 2. `/inspect/full` (Guided Interactive Inspection)
* **Issue:** The "Start fresh" button used a native browser `window.confirm()` popup which feels jarring on mobile devices.
* **Fix:** Replaced it with an inline two-step confirmation state ("Clear & reset" / "Cancel").
* **Issue:** Users landing directly on the full inspection intro had no way to go back to the hub.
* **Fix:** Added a `← All inspection tools` link to the intro section.
* **Issue:** The results page used standard `<a href>` tags for the Pro PPI and PPSR report actions, causing full page reloads instead of fast SPA routing.
* **Fix:** Converted these links to use Next.js `<Link>`.
* **Issue:** The share feature used an base64 encoded URL format (`btoa(JSON.stringify)`) that didn't match the `SharedData` type expected by the `/shared/[id]` route, leading to broken/404 share pages.
* **Fix:** Switched to a plain-text clipboard share payload format to bypass the broken shared-link hydration while retaining shareability, just like the print page.
* **Issue:** There was dead code computing `estimatedSavings` that wasn't displayed. 
* **Fix:** Removed the unused calculation.

### 3. `/inspect/print` (Quick Print Checklist)
* **Issue:** The page was missing a top-level dark background wrapper (it only had `text-white`), so elements rendered semi-transparent white on a white layout body, making them invisible. 
* **Fix:** Added the full-bleed dark background wrapper (`-mx-4 -mt-4 min-h-screen bg-slate-950 print:bg-white`) to ensure dark mode works on screens but preserves the white background for physical printing.
* **Issue:** The share feedback toast could conflict visually or fail if clipboard write isn't awaited properly.
* **Fix:** Share is now a clean text share via `navigator.share()` (native share sheet) with a clipboard fallback + inline toast message that self-dismisses.

## Conclusion
The inspection flow is now unified under the dark theme, navigation is seamless with no dead-ends, sharing is reliable via text payloads, and the interactions are significantly smoother on mobile. The checklist content remains practical without bloating into mechanic-level complexity.