"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamicImport from "next/dynamic";

import NicknameForm from "@/components/NicknameForm";
import KeyViewerBanner from "@/components/KeyViewerBanner";
import { useNicknameStore } from "@/stores/useNicknameStore";
import { checkNicknameExists } from "@/lib/varchive";

// 동적 import로 RecapResult 로드 (코드 스플리팅)
const RecapResult = dynamicImport(() => import("@/components/RecapResult"), {
  loading: () => null,
});

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nickname, setNickname } = useNicknameStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // 쿼리 파라미터에 nickname이 있으면 결과 페이지 표시
  const nicknameParam = searchParams.get("nickname");
  useEffect(() => {
    if (!nicknameParam) {
      setIsChecking(false);
    }
  }, [nicknameParam]);
  if (nicknameParam) {
    return <RecapResult />;
  }

  const handleSubmit = async (value: string) => {
    setErrorMessage(null);
    setIsChecking(true);

    try {
      const exists = await checkNicknameExists(value);
      if (exists) {
        setNickname(value);
        // 쿼리 파라미터만 추가 (같은 페이지에서 결과 표시)
        router.push(`?nickname=${encodeURIComponent(value)}`);
      } else {
        setErrorMessage("닉네임을 다시 확인해주세요.");
        setIsChecking(false);
      }
    } catch {
      // API 에러가 발생해도 일단 이동
      setNickname(value);
      router.push(`?nickname=${encodeURIComponent(value)}`);
    }
  };

  return (
    <main className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-6">
      {/* Background Blobs (Glass Effect) */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-canvas">
        <div className="absolute inset-0 recap-hero-bg" />
      </div>

      <div className="z-10 w-full max-w-lg flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="chip-blue mb-1">2025 DJMAX</div>
          <h1 className="text-4xl font-bold leading-tight text-grey-900 md:text-5xl word-keep">
            <span className="text-brand">V-ARCHIVE</span> RECAP
          </h1>
          <p className="text-grey-600 leading-relaxed word-keep">
            한 해 동안의 기록을 되돌아보는 시간
          </p>
        </div>

        {/* Input Form (Simplified) */}
        <div className="w-full">
          <NicknameForm
            defaultNickname={nickname}
            onSubmit={handleSubmit}
            buttonLabel={isChecking ? "확인 중..." : "리캡 시작하기"}
            helperText="V-ARCHIVE에 등록된 닉네임으로 조회됩니다."
            errorMessage={errorMessage ?? undefined}
          />
        </div>

        {/* Advertisement Banner */}
        <div className="w-full">
          <KeyViewerBanner />
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center text-sm text-grey-500">
        <p>
          Developed by{" "}
          <span className="font-medium text-grey-700">DM Note</span> · API
          provided by{" "}
          <span className="font-medium text-grey-700">V-ARCHIVE</span>
        </p>
      </footer>
    </main>
  );
}

export default function RecapPageClient() {
  return <HomeContent />;
}
