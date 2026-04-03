import { InspectionApp } from "@/components/inspection-app";

export const metadata = {
  title: "Vehicle Inspection | Buying Buddy",
  description: "A guided 25-point pre-purchase inspection tool for private buyers.",
};

export default function InspectPage() {
  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-slate-950 px-4 py-8 sm:-mx-6 lg:-mx-8">
      <InspectionApp />
    </div>
  );
}
