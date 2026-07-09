import type { Metadata } from "next";
import { SyncCalculatorContent } from "./SyncCalculatorContent";

const title = "노트 싱크 계산 - DM NOTE";
const description =
  "인게임 배속과 트랙 높이를 입력하면 DJMAX 노트 낙하와 동기화되는 DM NOTE 노트 속도와 OBS 렌더 지연값을 계산합니다.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/utils/sync-calculator/",
  },
  openGraph: {
    title,
    description,
  },
};

export default function SyncCalculatorPage() {
  return <SyncCalculatorContent />;
}
