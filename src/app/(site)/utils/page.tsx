import type { Metadata } from "next";
import { UtilsContent } from "./UtilsContent";

const title = "유틸리티 - DM NOTE";
const description = "DM NOTE를 활용하기 위한 웹 도구 모음";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/utils/",
  },
  openGraph: {
    title,
    description,
  },
};

export default function UtilsPage() {
  return <UtilsContent />;
}
