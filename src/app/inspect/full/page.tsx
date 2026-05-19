import { InspectionApp } from "@/components/inspection-app";

export const metadata = {
  title: "Full Inspection | Buying Buddy",
  description: "Interactive 21-check guided inspection with notes, ratings, and a compact print/PDF record.",
  alternates: { canonical: "https://buyingbuddy.com.au/inspect/full" },
};

export default function InspectFullPage() {
  return (
    <>
      <h1 className="sr-only">Full 21-check used-car inspection checklist</h1>
      <InspectionApp />
    </>
  );
}
