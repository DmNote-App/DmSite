export type Locale = "ko" | "en";

// satisfies로 ko/en 키 누락을 선언 지점에서 바로 잡는다
export const translations = {
  ko: {
    nav: {
      documentation: "Docs",
      utils: "유틸",
    },
    hero: {
      title: "Custom",
      titleHighlight: "Key Viewer",
      description: "실시간 입력 표시와 자유로운 커스터마이징을",
      descriptionSub: "지원하는 키뷰어입니다.",
      download: "Download",
      release: "Release",
      screenshotAlt: "DM NOTE 앱 화면 — 그리드 키 편집기",
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
          description: "CSS를 넣어 키 모양부터 배치까지 원하는 대로 바꿉니다.",
        },
        plugin: {
          title: "플러그인",
          description: "JavaScript로 필요한 기능을 직접 만들어 붙입니다.",
        },
        noteEffect: {
          title: "노트 효과",
          description:
            "리듬게임에 맞춰 다듬은 노트 효과로 입력이 한눈에 들어옵니다.",
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
    },
    utils: {
      title: "유틸리티",
      description: "DM NOTE를 활용하기 위한 웹 도구 모음",
      cards: {
        syncCalc: {
          title: "노트 싱크 계산",
          description:
            "인게임 배속에 맞춰 노트 속도와 OBS 렌더 지연값을 계산합니다.",
        },
      },
      sync: {
        title: "노트 싱크 계산",
        description:
          "노트 효과를 리버스로 뒤집고 OBS 렌더 지연을 걸면\n오버레이 노트를 게임 노트 낙하와 겹쳐 보이게 만들 수 있습니다.\n인게임 배속과 트랙 높이를 입력하면 필요한 값을 계산합니다.",
        form: {
          profile: "게임",
          speed: "인게임 배속",
          trackHeight: "트랙 높이 (px)",
          trackHeightHint: "DM NOTE 노트 설정의 트랙 높이와 같은 값",
          delayNote: "단노트 일관성 유지 (딜레이 노트)",
          delayNoteHint:
            "구분 시간 이하의 짧은 입력을 균일한 단노트로 표시하는 기능입니다.",
          gap: "구분 시간 (ms)",
          advanced: "고급 설정",
          offset: "보정 오프셋 (ms)",
          offsetHint:
            "캡처 지연이나 게임 내 타이밍 조정 차이를 흡수하는 값입니다. 결과가 미세하게 어긋나면 눈으로 보며 조정하세요.",
        },
        result: {
          title: "결과",
          noteSpeed: "노트 속도",
          noteSpeedHint: "DM NOTE 노트 설정의 '속도'에 입력",
          obsDelay: "OBS 렌더 지연",
          obsDelayHint: "게임·키 파트·사운드 소스에 적용",
          gameFall: "게임 노트 낙하 시간",
          copy: "복사",
          copied: "복사됨",
          unavailable: "배속과 트랙 높이를 입력하면 결과가 표시됩니다.",
          filterSplit:
            "렌더 지연 필터는 개당 최대 500ms라 여러 개로 나눠 적용해야 합니다.",
          negativeWarning:
            "계산값이 음수라 0으로 표시했습니다. 보정 오프셋을 확인하세요.",
        },
        notes: {
          title: "주의사항",
          reverse:
            "이 계산기는 노트 효과를 리버스(위에서 아래로 낙하)로 쓰는 구성 기준입니다.",
          variableBpm:
            "변속곡과 CHAOS·Slide처럼 속도가 변하는 이펙터는 동기화할 수 없습니다.",
          recalc:
            "인게임 배속이나 트랙 높이를 바꾸면 다시 계산해 적용해야 합니다.",
          obsSetup:
            "OBS에서 노트(DM NOTE) 소스는 지연 없이 두고, 게임·키 파트·사운드 소스에 렌더 지연 필터를 적용하세요.",
          audio:
            "렌더 지연은 오디오에 적용되지 않아 소리는 별도 싱크 오프셋이 필요할 수 있습니다.",
        },
      },
    },
  },
  en: {
    nav: {
      documentation: "Docs",
      utils: "Utils",
    },
    hero: {
      title: "Custom",
      titleHighlight: "Key Viewer",
      description: "A key viewer with real-time input display",
      descriptionSub: "and full customization.",
      download: "Download",
      release: "Release",
      screenshotAlt: "DM NOTE app window — grid key editor",
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
            "Write your own CSS to restyle every key, from shape to layout.",
        },
        plugin: {
          title: "Plugins",
          description: "Build the features you need in JavaScript and drop them in.",
        },
        noteEffect: {
          title: "Note Effects",
          description:
            "Note effects tuned for rhythm games show every input at a glance.",
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
    },
    utils: {
      title: "Utilities",
      description: "Web tools for DM NOTE",
      cards: {
        syncCalc: {
          title: "Note Sync Calculator",
          description:
            "Calculate the note speed and OBS render delay that match your in-game scroll speed.",
        },
      },
      sync: {
        title: "Note Sync Calculator",
        description:
          "With reversed note effects and an OBS render delay,\nthe overlay notes can mirror the game's falling notes.\nEnter your in-game scroll speed and track height to get the values you need.",
        form: {
          profile: "Game",
          speed: "In-game scroll speed",
          trackHeight: "Track height (px)",
          trackHeightHint: "Same as the track height in your DM NOTE note settings",
          delayNote: "Consistent short notes (delayed notes)",
          delayNoteHint:
            "Renders taps shorter than the threshold as uniform short notes.",
          gap: "Threshold (ms)",
          advanced: "Advanced",
          offset: "Sync offset (ms)",
          offsetHint:
            "Absorbs capture latency and in-game timing adjustments. Fine-tune by eye if the result looks slightly off.",
        },
        result: {
          title: "Results",
          noteSpeed: "Note speed",
          noteSpeedHint: "Enter as 'Speed' in DM NOTE note settings",
          obsDelay: "OBS render delay",
          obsDelayHint: "Apply to the game, key part and sound sources",
          gameFall: "Game note fall time",
          copy: "Copy",
          copied: "Copied",
          unavailable:
            "Fill in the scroll speed and track height to see results.",
          filterSplit:
            "A render delay filter caps at 500ms each — stack multiple filters.",
          negativeWarning:
            "The result was negative and clamped to 0. Check the sync offset.",
        },
        notes: {
          title: "Notes",
          reverse:
            "This calculator assumes reversed note effects (falling from top to bottom).",
          variableBpm:
            "Songs with BPM changes and speed-changing gear effects like CHAOS or Slide cannot be synced.",
          recalc:
            "Recalculate whenever you change the in-game scroll speed or track height.",
          obsSetup:
            "In OBS, keep the note (DM NOTE) source at 0ms and apply render delay filters to the game, key part and sound sources.",
          audio:
            "Render delay does not apply to audio — you may need a separate audio sync offset.",
        },
      },
    },
  },
} satisfies Record<Locale, Translations>;

// 일반적인 타입으로 정의하여 두 언어 모두 호환되도록 함
export type Translations = {
  nav: { documentation: string; utils: string };
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
  };
  utils: {
    title: string;
    description: string;
    cards: { syncCalc: { title: string; description: string } };
    sync: {
      title: string;
      description: string;
      form: {
        profile: string;
        speed: string;
        trackHeight: string;
        trackHeightHint: string;
        delayNote: string;
        delayNoteHint: string;
        gap: string;
        advanced: string;
        offset: string;
        offsetHint: string;
      };
      result: {
        title: string;
        noteSpeed: string;
        noteSpeedHint: string;
        obsDelay: string;
        obsDelayHint: string;
        gameFall: string;
        copy: string;
        copied: string;
        unavailable: string;
        filterSplit: string;
        negativeWarning: string;
      };
      notes: {
        title: string;
        reverse: string;
        variableBpm: string;
        recalc: string;
        obsSetup: string;
        audio: string;
      };
    };
  };
};
