import { InspectionApp } from "@/components/inspection-app";

export const metadata = {
  title: "Vehicle Inspection | Buying Buddy",
  description: "A guided 25-point pre-purchase inspection tool for private buyers.",
};

export default function InspectPage() {
  return (
    <div className="container py-8">
      <InspectionApp />
    </div>
  );
}
