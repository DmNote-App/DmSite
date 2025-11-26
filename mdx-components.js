import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";
import { Callout, Cards, Tabs, Steps, FileTree } from "nextra/components";

// Get the default MDX components
const themeComponents = getThemeComponents();

// Nextra 컴포넌트들을 전역으로 제공 (import 없이 MDX에서 사용 가능)
const nextraComponents = {
  Callout,
  Cards,
  Card: Cards.Card, // Cards.Card를 Card로 별칭
  Tabs,
  Tab: Tabs.Tab,
  Steps,
  FileTree,
};

// Merge components
export function useMDXComponents(components) {
  return {
    ...themeComponents,
    ...nextraComponents,
    ...components,
  };
}
