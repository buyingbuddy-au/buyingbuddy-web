import { permanentRedirect } from "next/navigation";

export default function PrintChecklistPage() {
  permanentRedirect("/inspect/full");
}
