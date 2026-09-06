# 의존성 패치

`npm install`의 `postinstall`에서 `patch-package`로 적용한다

## next-themes 0.4.6

문서로 클라이언트 이동할 때 ThemeProvider가 실행용 `<script>`를 새로 렌더해 React 콘솔 경고가 발생한다. 이 스크립트는 첫 HTML에서 테마 깜빡임을 막는 용도이며, 클라이언트 이동에서는 기존 ThemeProvider의 effect가 테마를 적용한다.

ESM과 CommonJS의 ThemeScript에 `useSyncExternalStore`를 적용했다. 서버 렌더링과 hydration의 snapshot은 `true`로 동일하게 유지하고, 클라이언트 snapshot은 `false`로 두어 클라이언트에서 실행되지 않는 script 요소를 만들지 않는다. 테마 선택, 저장, 시스템 테마 감지는 원래 구현을 사용한다.

업데이트 시 홈에서 문서로 이동, 문서 직접 진입의 hydration, Light/Dark 전환을 확인한 뒤 패치 필요 여부를 다시 판단한다.

## nextra 4.6.0

선택 메뉴의 `modal`을 끄는 기존 패치다.
