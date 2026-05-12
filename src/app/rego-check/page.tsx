import type { Metadata } from "next";
import QldRegoChecker from "@/components/rego-check/qld-rego-checker";

export const metadata: Metadata = {
  title: "Free QLD Rego Check",
  description:
    "Check a Queensland vehicle registration and get plain-English buyer prompts before you inspect or send money.",
  alternates: {
    canonical: "https://buyingbuddy.com.au/rego-check",
  },
  openGraph: {
    title: "Free QLD Rego Check | Buying Buddy",
    description:
      "Free Queensland rego lookup with buyer-side guidance on what to ask next before you inspect or send money.",
    url: "https://buyingbuddy.com.au/rego-check",
    siteName: "Buying Buddy",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free QLD Rego Check | Buying Buddy",
    description:
      "Check a Queensland rego and get practical next-step questions before you chase the car.",
  },
};

type RegoCheckPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegoCheckPage({ searchParams }: RegoCheckPageProps) {
  const params = (await searchParams) ?? {};
  const initialRego = first(params.rego) ?? first(params.plate) ?? "";
  const start = first(params.start) ?? first(params.autocheck) ?? "";

  return <QldRegoChecker initialRego={initialRego} autoRun={start === "1"} />;
}
