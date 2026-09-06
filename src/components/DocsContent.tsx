import type { ComponentProps } from "react";
import { Cards } from "nextra/components";
import { useMDXComponents } from "../../mdx-components";
import { localizeDocsHref, type Locale } from "@/lib/i18n";

export function getDocsComponents(locale: Locale) {
  const components = useMDXComponents({});
  const Anchor = components.a;
  const Card = (props: ComponentProps<typeof Cards.Card>) => (
    <Cards.Card {...props} href={localizeDocsHref(props.href, locale)} />
  );
  const LocalizedCards = Object.assign(
    (props: ComponentProps<typeof Cards>) => <Cards {...props} />,
    { Card },
  );

  return {
    ...components,
    a: (props: ComponentProps<typeof Anchor>) => (
      <Anchor {...props} href={typeof props.href === "string" ? localizeDocsHref(props.href, locale) : props.href} />
    ),
    Cards: LocalizedCards,
    Card,
  };
}
