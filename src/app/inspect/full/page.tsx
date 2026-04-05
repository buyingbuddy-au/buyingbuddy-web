import { InspectionApp } from "@/components/inspection-app";

export const metadata = {
  title: "Full Inspection | Buying Buddy",
  description: "Interactive 14-point guided inspection with notes, ratings, and a risk score.",
};

export default function InspectFullPage() {
  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-slate-950 px-4 py-8 sm:-mx-6 lg:-mx-8">
      <InspectionApp />
    </div>
  );
}
