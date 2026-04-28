import { redirect } from "next/navigation";

export const metadata = {
  title: "Buying Buddy Inspection Checklist",
  description: "Use Buying Buddy's self-serve inspection checklist before buying a used car privately.",
};

export default function PpiRedirectPage() {
  redirect("/inspect");
}
