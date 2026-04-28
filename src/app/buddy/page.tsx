import { redirect } from "next/navigation";

export const metadata = {
  title: "Free Used Car Check",
  description: "Start with the free Buying Buddy listing check.",
};

export default function BuddyPage() {
  redirect("/check");
}
