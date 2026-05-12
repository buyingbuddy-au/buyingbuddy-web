import FreeCheckForm from "@/components/free-check-form";

export const metadata = {
  title: "Free Listing Check | Buying Buddy",
  description:
    "Paste a car listing URL or enter make, model, and year for a fast buyer-side red-flag check.",
};

export default function CheckPage() {
  return <FreeCheckForm />;
}
