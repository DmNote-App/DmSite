export type Locale = "ko" | "en";

// satisfies로 ko/en 키 누락을 선언 지점에서 바로 잡는다
export const translations = {
  ko: {
    nav: {
      documentation: "Docs",
    },
    hero: {
      title: "Custom",
      titleHighlight: "Key Viewer",
      description: "실시간 입력 표시와 자유로운 커스터마이징을",
      descriptionSub: "지원하는 키뷰어입니다.",
      download: "Download",
      release: "Release",
      screenshotAlt: "DM NOTE 앱 화면, 그리드 키 편집기",
    },
    features: {
      title: "Make it",
      titleHighlight: "yours",
      description: "키 배치부터 스타일, 동작까지",
      descriptionSub: "전부 직접 설정할 수 있습니다.",
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
        preset: {
          title: "프리셋 시스템",
          description:
            "자신만의 설정을 프리셋으로 저장하고, 언제든지 불러와 사용할 수 있습니다.",
        },
        settings: {
          title: "다양한 설정",
          description:
            "한국어/영어 다국어 지원과 다양한 그래픽 렌더링 옵션을 제공합니다.",
        },
      },
    },
    footer: {
      copyright: "© 2026 DM NOTE. Licensed under GPL-3.0",
      links: {
        docs: "문서",
        github: "GitHub",
        releases: "릴리즈",
      },
    },
    showcase: {
      items: {
        css: {
          title: "CSS 커스터마이징",
          description:
            "CSS로 키뷰어를 세밀하게 다듬어 원하는 스타일을 적용할 수 있습니다.",
        },
        plugin: {
          title: "플러그인",
          description:
            "JavaScript로 나만의 기능을 자유롭게 확장할 수 있습니다.",
        },
        noteEffect: {
          title: "노트 효과",
          description:
            "리듬게임에 최적화된 노트 효과로 시각적 피드백을 제공합니다.",
        },
      },
    },
    previews: {
      items: {
        keyCounter: {
          title: "키 카운터 표시",
          description: "각 키 입력 횟수를 기록하고 표시합니다.",
        },
        obsMode: {
          title: "OBS 모드",
          description: "OBS에서 브라우저 소스로 오버레이를 표시합니다.",
        },
        overlayLock: {
          title: "오버레이 창 고정",
          description: "오버레이 창이 움직이지 않도록 고정시킵니다.",
        },
        alwaysOnTop: {
          title: "항상 위에 표시",
          description: "오버레이 창을 항상 다른 창 위에 표시합니다.",
        },
        resizeAnchor: {
          title: "리사이즈 기준점",
          description: "오버레이 창의 리사이즈 기준점을 선택합니다.",
        },
        trayEnabled: {
          title: "트레이 기능 활성화",
          description: "창을 닫아도 종료하지 않고 트레이에 남깁니다.",
        },
      },
    },
    cta: {
      title: "설치 없이",
      titleHighlight: "바로 실행",
      description: "무료 오픈소스로 제공됩니다.",
      button: "다운로드",
      secondary: "문서 보기",
    },  },
  en: {
    nav: {
      documentation: "Docs",
    },
    hero: {
      title: "Custom",
      titleHighlight: "Key Viewer",
      description: "A key viewer with real-time input display",
      descriptionSub: "and full customization.",
      download: "Download",
      release: "Release",
      screenshotAlt: "DM NOTE app window, grid key editor",
    },
    features: {
      title: "Make it",
      titleHighlight: "yours",
      description: "Adjust everything from key layout",
      descriptionSub: "to style and behavior.",
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
        preset: {
          title: "Presets",
          description:
            "Save your own settings as presets and load them anytime",
        },
        settings: {
          title: "Settings",
          description:
            "Supports Korean/English and offers various graphics rendering options",
        },
      },
    },
    footer: {
      copyright: "© 2026 DM NOTE. Licensed under GPL-3.0",
      links: {
        docs: "Docs",
        github: "GitHub",
        releases: "Releases",
      },
    },
    showcase: {
      items: {
        css: {
          title: "CSS Customization",
          description:
            "Apply the styles you want by finely customizing the key viewer with CSS.",
        },
        plugin: {
          title: "Plugins",
          description:
            "Extend it freely with your own features using JavaScript.",
        },
        noteEffect: {
          title: "Note Effects",
          description:
            "Provides visual feedback with note effects optimized for rhythm games.",
        },
      },
    },
    previews: {
      items: {
        keyCounter: {
          title: "Show Key Counter",
          description: "Track and display the number of presses for each key.",
        },
        obsMode: {
          title: "OBS Mode",
          description: "Displays the overlay via a browser source in OBS.",
        },
        overlayLock: {
          title: "Lock Overlay Window",
          description: "Locks the overlay window so it doesn't move.",
        },
        alwaysOnTop: {
          title: "Always on Top",
          description: "Keeps the overlay window always on top of other windows.",
        },
        resizeAnchor: {
          title: "Resize Anchor",
          description: "Selects the resize anchor point for the overlay window.",
        },
        trayEnabled: {
          title: "Enable tray mode",
          description:
            "Keeps the app in the tray instead of quitting when the window closes.",
        },
      },
    },
    cta: {
      title: "No install,",
      titleHighlight: "just run",
      description: "Free and open source.",
      button: "Download",
      secondary: "Read the docs",
    },  },
} satisfies Record<Locale, Translations>;

// 일반적인 타입으로 정의하여 두 언어 모두 호환되도록 함
export type Translations = {
  nav: { documentation: string };
  hero: {
    title: string;
    titleHighlight: string;
    description: string;
    descriptionSub: string;
    download: string;
    release: string;
    screenshotAlt: string;
  };
  features: {
    title: string;
    titleHighlight: string;
    description: string;
    descriptionSub: string;
    items: {
      realtime: { title: string; description: string };
      grid: { title: string; description: string };
      preset: { title: string; description: string };
      settings: { title: string; description: string };
    };
  };
  footer: {
    copyright: string;
    links: { docs: string; github: string; releases: string };
  };
  cta: {
    title: string;
    titleHighlight: string;
    description: string;
    button: string;
    secondary: string;
  };
  showcase: {
    items: {
      css: { title: string; description: string };
      plugin: { title: string; description: string };
      noteEffect: { title: string; description: string };
    };
  };
  previews: {
    items: {
      keyCounter: { title: string; description: string };
      obsMode: { title: string; description: string };
      overlayLock: { title: string; description: string };
      alwaysOnTop: { title: string; description: string };
      resizeAnchor: { title: string; description: string };
      trayEnabled: { title: string; description: string };
    };
  };};
