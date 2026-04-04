import { InspectionApp } from "@/components/inspection-app";

export const metadata = {
  title: "Full Inspection | Buying Buddy",
  description: "Interactive 20-point vehicle inspection with notes, ratings, and a risk score.",
};

export default function InspectFullPage() {
  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-white px-4 py-8 sm:-mx-6 lg:-mx-8">
      <InspectionApp />
    </div>
  );
}
