import { redirect } from "next/navigation";

export const metadata = {
  title: "Buying Buddy",
  description: "Used-car checks, PPSR reports, inspection tools, and QLD private-sale paperwork.",
};

export default function LegacyLocalSeoRedirectPage() {
  redirect("/");
}
