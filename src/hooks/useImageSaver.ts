"use client";

import { useState, useRef, useCallback, RefObject } from "react";
import { domToBlob } from "modern-screenshot";

// 프록시 환경에서는 상대 경로 사용 (동일 출처)

// 비디오 대체 정보 타입
type VideoReplacement = {
  video: HTMLVideoElement;
  img: HTMLImageElement | null;
  parent: HTMLElement;
};

type OriginalImageState = {
  src: string;
  srcset: string | null;
  sizes: string | null;
  loading: string | null;
};

type CachedImage =
  | { kind: "blob"; blob: Blob }
  | { kind: "dataUrl"; dataUrl: string };

type ExternalImageConversionResult = {
  originalSrcs: Map<HTMLImageElement, OriginalImageState>;
  objectUrls: string[];
};

// 이미지 저장 옵션 타입
export type SaveProgressStage =
  | "prepare"
  | "freeze"
  | "gather"
  | "render"
  | "encode"
  | "finish";

type SaveImageOptions = {
  fileName: string;
  backgroundColor?: string;
  pixelRatio?: number;
  onBeforeCapture?: () => void | Promise<void>;
  onAfterCapture?: () => void | Promise<void>;
  onProgress?: (value: number, stage: SaveProgressStage) => void;
};

// video 요소를 canvas 이미지로 대체하는 함수 (Safari 모바일 대응)
const replaceVideosWithImages = (element: HTMLElement): VideoReplacement[] => {
  const videos = element.querySelectorAll("video");
  const replacements: VideoReplacement[] = [];

  videos.forEach((video) => {
    const parent = video.parentElement;
    if (!parent) return;

    try {
      // video가 충분히 로드되었는지 확인
      if (video.readyState < 2) {
        // 로드가 안된 경우 비디오 숨기고 placeholder 사용
        const placeholder = document.createElement("div");
        placeholder.style.width = "100%";
        placeholder.style.height = "100%";
        placeholder.style.backgroundColor = getVideoPlaceholderColor();
        placeholder.style.borderRadius = "inherit";
        placeholder.setAttribute("data-video-placeholder", "true");

        parent.insertBefore(placeholder, video);
        video.style.display = "none";
        replacements.push({
          video,
          img: placeholder as unknown as HTMLImageElement,
          parent,
        });
        return;
      }

      const canvas = document.createElement("canvas");
      // 실제 비디오 해상도 또는 표시 크기 사용
      const width = video.videoWidth || video.offsetWidth || 80;
      const height = video.videoHeight || video.offsetHeight || 80;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // 비디오 프레임을 canvas에 그리기
        ctx.drawImage(video, 0, 0, width, height);

        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL("image/png");
        } catch (canvasError) {
          // CORS 또는 보안 오류 시 fallback
          console.warn("Canvas toDataURL 실패 (CORS?):", canvasError);
          dataUrl = "";
        }

        if (dataUrl && dataUrl !== "data:,") {
          const img = document.createElement("img");
          img.src = dataUrl;
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "cover";
          img.style.borderRadius = "inherit";
          img.className = video.className;

          parent.insertBefore(img, video);
          video.style.display = "none";
          replacements.push({ video, img, parent });
        } else {
          // dataUrl이 비어있으면 그냥 비디오 숨기기
          video.style.display = "none";
          replacements.push({ video, img: null, parent });
        }
      }
    } catch (e) {
      console.warn("비디오 캡처 실패:", e);
      // 실패해도 비디오를 숨기지 않고 그대로 둠
    }
  });

  return replacements;
};

// video 요소 복원 함수
const restoreVideos = (replacements: VideoReplacement[]) => {
  replacements.forEach(({ video, img, parent }) => {
    video.style.display = "";
    if (img && parent.contains(img)) {
      parent.removeChild(img);
    }
    // placeholder div도 제거
    const placeholder = parent.querySelector("[data-video-placeholder]");
    if (placeholder) {
      parent.removeChild(placeholder);
    }
  });
};

// 이미지 원본 복원 함수
const restoreOriginalImages = (
  originalSrcs: Map<HTMLImageElement, OriginalImageState>
) => {
  originalSrcs.forEach((state, img) => {
    img.src = state.src;
    if (state.srcset !== null) {
      img.setAttribute("srcset", state.srcset);
    } else {
      img.removeAttribute("srcset");
    }
    if (state.sizes !== null) {
      img.setAttribute("sizes", state.sizes);
    } else {
      img.removeAttribute("sizes");
    }
    if (state.loading !== null) {
      img.setAttribute("loading", state.loading);
    } else {
      img.removeAttribute("loading");
    }
  });
};

const revokeObjectUrls = (objectUrls: string[]) => {
  objectUrls.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Object URL 해제 실패:", error);
    }
  });
};

const toRgbString = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("rgb")) return trimmed;
  const normalized = trimmed.includes(",")
    ? trimmed
    : trimmed.split(/\s+/).join(", ");
  return `rgb(${normalized})`;
};

const getCssVarColor = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return raw ? toRgbString(raw) : fallback;
};

const getCaptureBackgroundColor = (element: HTMLElement) => {
  const elementBg = getComputedStyle(element).backgroundColor;
  if (elementBg && elementBg !== "transparent" && elementBg !== "rgba(0, 0, 0, 0)") {
    return elementBg;
  }
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  return bodyBg || "rgb(242, 244, 246)";
};

const buildPlaceholderDataUrl = (fill: string) => {
  const svg = `<svg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"80\" height=\"80\" fill=\"${fill}\"/></svg>`;
  if (typeof window === "undefined" || typeof window.btoa !== "function") {
    return "";
  }
  return `data:image/svg+xml;base64,${window.btoa(svg)}`;
};

const getImagePlaceholderDataUrl = () => {
  const fallback =
    typeof document !== "undefined" && document.body
      ? getCaptureBackgroundColor(document.body)
      : "rgb(242, 244, 246)";
  const fill = getCssVarColor("--grey-200", fallback);
  const dataUrl = buildPlaceholderDataUrl(fill);
  return dataUrl || "";
};

const getVideoPlaceholderColor = () =>
  getCssVarColor("--video-placeholder", "rgb(26, 26, 26)");

// 캡처 옵션 값
const CAPTURE_DESKTOP_MIN_WIDTH = 1024;
const CAPTURE_SIDE_PADDING = 40;

// 메모리 최적화를 위한 캐시 크기 제한
const MAX_IMAGE_CACHE_SIZE = 50;

// 모바일 감지 함수
const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    (typeof window !== "undefined" && window.innerWidth < 768)
  );
};

// 저사양 모바일 기기 감지 (메모리 제한 필요)
const isLowEndDevice = () => {
  if (typeof navigator === "undefined") return false;
  // 메모리가 4GB 이하인 기기 탐지 (deviceMemory API)
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory && nav.deviceMemory <= 4) return true;
  // iOS Safari 또는 오래된 모바일 브라우저
  const isOlderIOS =
    /iPhone|iPad|iPod/.test(navigator.userAgent) &&
    !/OS (1[5-9]|[2-9]\d)/.test(navigator.userAgent);
  return isOlderIOS;
};

const waitForFonts = async (timeoutMs = 2000) => {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const fontFaceSet = document.fonts;
  const fontLoads = [
    '400 1em "Pretendard JP"',
    '500 1em "Pretendard JP"',
    '600 1em "Pretendard JP"',
    '700 1em "Pretendard JP"',
    '800 1em "Pretendard JP"',
    '900 1em "Pretendard JP"',
  ].map((font) => fontFaceSet.load(font).catch(() => []));
  const readyPromise = fontFaceSet.ready.catch(() => undefined);
  const timeout = new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutMs);
  });
  await Promise.race([
    Promise.all([...fontLoads, readyPromise]).then(() => undefined),
    timeout,
  ]);
};

/**
 * 이미지 저장 기능을 제공하는 커스텀 훅
 * modern-screenshot를 사용하여 크로스 브라우저 호환성 보장 (Firefox, Chrome, Safari, iOS, Android)
 */
export function useImageSaver() {
  const [isSaving, setIsSaving] = useState(false);
  // 이미지 Blob 캐시 (중복 요청 방지, base64 메모리 절감)
  const imageCache = useRef<Map<string, CachedImage>>(new Map());

  // 이미지를 프록시를 통해 Blob/Object URL로 변환하는 함수
  const convertExternalImages = useCallback(
    async (element: HTMLElement): Promise<ExternalImageConversionResult> => {
      const originalSrcs = new Map<HTMLImageElement, OriginalImageState>();
      const objectUrls: string[] = [];
      const images = element.querySelectorAll("img");
      const placeholderDataUrl = getImagePlaceholderDataUrl();

      const applyReplacement = (img: HTMLImageElement, dataUrl: string) => {
        img.src = dataUrl;
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.setAttribute("loading", "eager");
      };

      const applyBlobReplacement = (img: HTMLImageElement, blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        objectUrls.push(objectUrl);
        applyReplacement(img, objectUrl);
      };

      const promises = Array.from(images).map(async (img) => {
        const currentSrc = img.currentSrc || img.src;
        if (!currentSrc || currentSrc.startsWith("data:")) {
          return;
        }

        const isNextImage =
          img.dataset.nimg === "1" || currentSrc.includes("/_next/image");
        const isSameOrigin = currentSrc.startsWith(window.location.origin);
        if (isSameOrigin && !isNextImage) {
          return;
        }

        // 원본 src 저장
        originalSrcs.set(img, {
          src: img.src,
          srcset: img.getAttribute("srcset"),
          sizes: img.getAttribute("sizes"),
          loading: img.getAttribute("loading"),
        });

        let sourceUrl = currentSrc;
        if (isNextImage) {
          try {
            const parsed = new URL(currentSrc, window.location.origin);
            sourceUrl = parsed.searchParams.get("url") ?? currentSrc;
          } catch {
            sourceUrl = currentSrc;
          }
        }
        const sourceOrigin = new URL(sourceUrl, window.location.origin).origin;
        const shouldProxy = sourceOrigin !== window.location.origin;
        const cacheKey = sourceUrl;

        // 캐시에 있으면 재사용 (중복 API 요청 방지)
        const cached = imageCache.current.get(cacheKey);
        if (cached) {
          if (cached.kind === "blob") {
            applyBlobReplacement(img, cached.blob);
          } else {
            applyReplacement(img, cached.dataUrl);
          }
          return;
        }

        try {
        // 동일 출처 API 경로 사용
        const fetchUrl = shouldProxy
          ? `/api/image-proxy?url=${encodeURIComponent(sourceUrl)}`
          : sourceUrl;
          const response = await fetch(fetchUrl);

          if (!response.ok) throw new Error("Proxy failed");

          const blob = await response.blob();

          // 캐시에 저장 (크기 제한 적용)
          if (imageCache.current.size >= MAX_IMAGE_CACHE_SIZE) {
            // 가장 오래된 항목 제거
            const firstKey = imageCache.current.keys().next().value;
            if (firstKey) imageCache.current.delete(firstKey);
          }
          imageCache.current.set(cacheKey, { kind: "blob", blob });
          applyBlobReplacement(img, blob);
        } catch {
          console.warn("이미지 변환 실패:", sourceUrl);
          // 실패시 회색 placeholder로 대체
          imageCache.current.set(cacheKey, {
            kind: "dataUrl",
            dataUrl: placeholderDataUrl,
          });
          if (placeholderDataUrl) {
            applyReplacement(img, placeholderDataUrl);
          }
        }
      });

      await Promise.all(promises);
      return { originalSrcs, objectUrls };
    },
    []
  );

  const waitForImages = useCallback(async (element: HTMLElement) => {
    const images = Array.from(element.querySelectorAll("img"));
    if (images.length === 0) return;

    const decodePromises = images
      .map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return null;
        }

        if (typeof img.decode === "function") {
          return img.decode().catch(() => undefined);
        }

        return new Promise<void>((resolve) => {
          const handleDone = () => resolve();
          img.addEventListener("load", handleDone, { once: true });
          img.addEventListener("error", handleDone, { once: true });
        });
      })
      .filter(Boolean) as Promise<void>[];

    if (decodePromises.length > 0) {
      await Promise.all(decodePromises);
    }
  }, []);

  // 요소를 이미지로 저장하는 함수
  const saveAsImage = useCallback(
    async (
      elementRef: RefObject<HTMLElement | null>,
      options: SaveImageOptions
    ) => {
      if (!elementRef.current || isSaving) return;

      setIsSaving(true);
      options.onProgress?.(5, "prepare");
      const rootElement = elementRef.current;
      const captureContainer =
        rootElement.querySelector<HTMLElement>(".recap-container");
      const captureTarget = captureContainer ?? rootElement;
      const originalScroll = {
        x: window.scrollX,
        y: window.scrollY,
      };
      const originalBodyStyles = {
        position: document.body.style.position,
        top: document.body.style.top,
        left: document.body.style.left,
        right: document.body.style.right,
        width: document.body.style.width,
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      };
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      const originalCaptureStyles = {
        width: captureTarget.style.width,
        maxWidth: captureTarget.style.maxWidth,
        minWidth: captureTarget.style.minWidth,
        boxSizing: captureTarget.style.boxSizing,
      };
      const captureRootAttr = "data-capture-root";
      const hadCaptureRootAttr = captureTarget.hasAttribute(captureRootAttr);
      const originalLang = rootElement.getAttribute("lang");
      let externalImages: ExternalImageConversionResult | null = null;
      let videoReplacements: VideoReplacement[] = [];
      let downloadUrl = "";
      let revokeDownloadUrl: (() => void) | null = null;

      try {
        document.documentElement.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${originalScroll.y}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        if (options.onBeforeCapture) {
          await options.onBeforeCapture();
        }
        options.onProgress?.(18, "freeze");
        if (!hadCaptureRootAttr) {
          captureTarget.setAttribute(captureRootAttr, "true");
        }
        rootElement.setAttribute("lang", document.documentElement.lang || "ko");
        rootElement.classList.add("capture-mode");
        await waitForFonts();
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(null))
        );
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(null))
        );

        if (captureContainer) {
          const targetWidth =
            CAPTURE_DESKTOP_MIN_WIDTH + CAPTURE_SIDE_PADDING * 2;
          captureTarget.style.boxSizing = "border-box";
          captureTarget.style.maxWidth = "none";
          captureTarget.style.minWidth = "0";
          captureTarget.style.width = `${Math.ceil(targetWidth)}px`;
        }

        // 페이지 스크롤을 맨 위로 이동
        window.scrollTo(0, 0);

        // video 요소를 이미지로 대체 (Safari 모바일 대응) - 먼저 실행
        try {
          videoReplacements = replaceVideosWithImages(captureTarget);
          options.onProgress?.(32, "gather");
        } catch (videoError) {
          console.warn("비디오 대체 실패, 계속 진행:", videoError);
        }

        // 외부 이미지를 Blob/Object URL로 변환 (병렬 처리됨)
        try {
          externalImages = await convertExternalImages(captureTarget);
          options.onProgress?.(55, "gather");
        } catch (imgError) {
          console.warn("외부 이미지 변환 실패, 계속 진행:", imgError);
        }

        // 렌더링 완료 대기 (단축된 대기 시간)
        await waitForImages(captureTarget);
        options.onProgress?.(70, "render");
        // 모바일에서는 더 짧은 대기, 데스크톱에서는 안정성을 위해 약간 더 대기
        await new Promise((resolve) =>
          setTimeout(resolve, isMobileDevice() ? 50 : 100)
        );
        options.onProgress?.(75, "render");

        // 모바일/저사양 기기에서는 낮은 해상도로 메모리 절약
        const isMobile = isMobileDevice();
        const isLowEnd = isLowEndDevice();
        let effectivePixelRatio = options.pixelRatio ?? 3;
        if (isLowEnd) {
          effectivePixelRatio = Math.min(effectivePixelRatio, 1.5);
        } else if (isMobile) {
          effectivePixelRatio = Math.min(effectivePixelRatio, 2);
        }

        // modern-screenshot를 사용하여 캡처 (메모리 최적화 적용)
        try {
          const blob = await domToBlob(captureTarget, {
            scale: effectivePixelRatio,
            backgroundColor:
              options.backgroundColor ??
              getCaptureBackgroundColor(captureTarget),
            filter: (node) => {
              // video 요소 제외
              if (node instanceof HTMLVideoElement) return false;
              return true;
            },
            // 폰트 임베딩 활성화 (크로스 브라우저 지원)
            fetch: {
              requestInit: {
                mode: "cors",
              },
            },
          });

          if (blob) {
            downloadUrl = URL.createObjectURL(blob);
            revokeDownloadUrl = () => URL.revokeObjectURL(downloadUrl);
            options.onProgress?.(90, "encode");
          } else {
            throw new Error("Blob 생성 실패");
          }
        } catch (captureError) {
          console.error("이미지 캡처 실패:", captureError);
          throw captureError;
        }

        // 다운로드 링크 생성
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = options.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        options.onProgress?.(100, "finish");
        // Object URL 즉시 해제 (메모리 절약)
        if (revokeDownloadUrl) {
          // 다운로드 완료 후 즉시 해제
          revokeDownloadUrl();
        }

        // 모바일에서 캐시 정리 (메모리 절약)
        if (isMobile) {
          imageCache.current.clear();
        }
      } catch (error) {
        console.error("이미지 저장 중 오류가 발생했습니다:", error);
        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        alert("이미지 저장에 실패했습니다. 다시 시도해주세요.");
      } finally {
        // 원본 이미지 복원
        if (externalImages) {
          restoreOriginalImages(externalImages.originalSrcs);
          revokeObjectUrls(externalImages.objectUrls);
        }
        // video 요소 복원
        if (videoReplacements.length > 0) {
          restoreVideos(videoReplacements);
        }
        rootElement.classList.remove("capture-mode");
        if (originalLang === null) {
          rootElement.removeAttribute("lang");
        } else {
          rootElement.setAttribute("lang", originalLang);
        }
        if (options.onAfterCapture) {
          await options.onAfterCapture();
        }
        document.body.style.position = originalBodyStyles.position;
        document.body.style.top = originalBodyStyles.top;
        document.body.style.left = originalBodyStyles.left;
        document.body.style.right = originalBodyStyles.right;
        document.body.style.width = originalBodyStyles.width;
        document.body.style.overflow = originalBodyStyles.overflow;
        document.body.style.paddingRight = originalBodyStyles.paddingRight;
        document.documentElement.style.overflow = originalHtmlOverflow;
        window.scrollTo(originalScroll.x, originalScroll.y);
        if (!hadCaptureRootAttr) {
          captureTarget.removeAttribute(captureRootAttr);
        }
        captureTarget.style.width = originalCaptureStyles.width;
        captureTarget.style.maxWidth = originalCaptureStyles.maxWidth;
        captureTarget.style.minWidth = originalCaptureStyles.minWidth;
        captureTarget.style.boxSizing = originalCaptureStyles.boxSizing;
        setIsSaving(false);
      }
    },
    [isSaving, convertExternalImages, waitForImages]
  );

  // 캐시 초기화 함수
  const clearCache = useCallback(() => {
    imageCache.current.clear();
  }, []);

  return {
    isSaving,
    saveAsImage,
    clearCache,
  };
}
