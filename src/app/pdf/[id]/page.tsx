import { redirect } from "next/navigation";

export default async function LegacyPdfWorkspaceRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/deal/${id}`);
}
