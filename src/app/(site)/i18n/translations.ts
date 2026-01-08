export type Locale = "ko" | "en";

export const translations = {
  ko: {
    nav: {
      documentation: "Docs",
    },
    hero: {
      available: "v1.4.1 Available Now",
      title: "Custom",
      titleHighlight: "Key Viewer",
      description: "게이머를 위한 커스텀 키뷰어",
      descriptionSub: "커스터마이징과 직관적인 인터페이스를 제공합니다.",
      download: "Download",
      release: "Release",
    },
    features: {
      sectionLabel: "Features",
      title: "Fully",
      titleHighlight: "Customizable",
      description: "DM Note는 완벽한 커스터마이징을 지원합니다.",
      descriptionSub: "당신만의 키뷰어를 만들어보세요.",
      items: {
        realtime: {
          title: "실시간 입력 감지",
          description:
            "Windows Raw Input API를 사용하여 키보드와 마우스 입력을 실시간으로 감지하고 시각화합니다.",
        },
        grid: {
          title: "그리드 기반 레이아웃",
          description:
            "직관적인 그리드 시스템으로 키의 크기와 위치를 자유롭게 조절할 수 있습니다.",
        },
        css: {
          title: "커스텀 CSS 지원",
          description:
            "CSS로 키뷰어를 세밀하게 커스터마이징하여 원하는 스타일을 적용할 수 있습니다.",
        },
        preset: {
          title: "프리셋 시스템",
          description:
            "자신만의 설정을 프리셋으로 저장하고, 언제든지 불러와 사용할 수 있습니다.",
        },
        overlay: {
          title: "오버레이 모드",
          description:
            "게임 위에 투명하게 표시하거나 OBS로 크로마키 없이 캡처할 수 있습니다.",
        },
        noteEffect: {
          title: "노트 효과",
          description:
            "리듬게임에 최적화된 노트 이펙트로 시각적 피드백을 제공합니다.",
        },
        keyCounter: {
          title: "키 카운터",
          description: "키 입력 횟수를 실시간으로 표시합니다.",
        },
        settings: {
          title: "다양한 설정",
          description:
            "한국어/영어 다국어 지원과 다양한 그래픽 렌더링 옵션을 제공합니다.",
        },
      },
    },
    footer: {
      copyright: "© 2025 DM Note. Licensed under GPL-3.0",
    },
    showcase: {
      sectionLabel: "Showcase",
      title: "Quick",
      titleHighlight: "Preview",
      titleSuffix: "",
      description: "주요 기능들을 빠르게 살펴보세요.",
      download: "다운로드",
      items: {
        css: {
          title: "CSS 커스터마이징",
          description: "자유로운 스타일링",
        },
        grid: {
          title: "그리드 레이아웃",
          description: "직관적인 배치",
        },
        counter: {
          title: "키 카운터",
          description: "실시간 입력 통계",
        },
        plugin: {
          title: "플러그인",
          description: "JavaScript 확장",
        },
      },
    },
  },
  en: {
    nav: {
      documentation: "Docs",
    },
    hero: {
      available: "v1.4.1 Available Now",
      title: "Custom",
      titleHighlight: "Key Viewer",
      description: "Custom Key Viewer for Gamers",
      descriptionSub: "Offering full customization and an intuitive UI",
      download: "Download",
      release: "Release",
    },
    features: {
      sectionLabel: "Features",
      title: "Fully",
      titleHighlight: "Customizable",
      description: "DM Note supports complete customization",
      descriptionSub: "Create your own unique key viewer",
      items: {
        realtime: {
          title: "Real-time Input",
          description:
            "Detects and visualizes keyboard and mouse inputs in real-time using the Windows Raw Input API",
        },
        grid: {
          title: "Grid-based Layout",
          description:
            "Freely adjust key size and position with an intuitive grid system",
        },
        css: {
          title: "Custom CSS",
          description:
            "Apply your desired styles by finely customizing the key viewer with CSS",
        },
        preset: {
          title: "Presets",
          description:
            "Save your own settings as presets and load them anytime",
        },
        overlay: {
          title: "Overlay Mode",
          description:
            "Display transparently over games or capture with OBS without chroma key",
        },
        noteEffect: {
          title: "Note Effects",
          description:
            "Provides visual feedback with note effects optimized for rhythm games",
        },
        keyCounter: {
          title: "Key Counter",
          description: "Displays key press counts in real-time",
        },
        settings: {
          title: "Settings",
          description:
            "Supports Korean/English and offers various graphics rendering options",
        },
      },
    },
    footer: {
      copyright: "© 2025 DM Note. Licensed under GPL-3.0",
    },
    showcase: {
      sectionLabel: "Showcase",
      title: "Quick",
      titleHighlight: "Preview",
      titleSuffix: "",
      description: "Take a quick look at the key features of DM Note",
      download: "Download",
      items: {
        css: {
          title: "CSS Customization",
          description: "Unlimited styling",
        },
        grid: {
          title: "Grid Layout",
          description: "Intuitive positioning",
        },
        counter: {
          title: "Key Counter",
          description: "Real-time statistics",
        },
        plugin: {
          title: "Plugins",
          description: "Extend with JavaScript",
        },
      },
    },
  },
};

// 일반적인 타입으로 정의하여 두 언어 모두 호환되도록 함
export type Translations = {
  nav: { documentation: string };
  hero: {
    available: string;
    title: string;
    titleHighlight: string;
    description: string;
    descriptionSub: string;
    download: string;
    release: string;
  };
  features: {
    sectionLabel: string;
    title: string;
    titleHighlight: string;
    description: string;
    descriptionSub: string;
    items: {
      realtime: { title: string; description: string };
      grid: { title: string; description: string };
      css: { title: string; description: string };
      preset: { title: string; description: string };
      overlay: { title: string; description: string };
      noteEffect: { title: string; description: string };
      keyCounter: { title: string; description: string };
      settings: { title: string; description: string };
    };
  };
  footer: { copyright: string };
  showcase: {
    sectionLabel: string;
    title: string;
    titleHighlight: string;
    titleSuffix: string;
    description: string;
    download: string;
    items: {
      css: { title: string; description: string };
      grid: { title: string; description: string };
      counter: { title: string; description: string };
      plugin: { title: string; description: string };
    };
  };
};
