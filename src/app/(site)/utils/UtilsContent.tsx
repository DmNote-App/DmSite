"use client";

import Link from "next/link";
import { useLanguage } from "../i18n";
import { Reveal } from "../Reveal";

export function UtilsContent() {
  const { t } = useLanguage();

  const tools = [
    {
      href: "/utils/sync-calculator",
      title: t.utils.cards.syncCalc.title,
      description: t.utils.cards.syncCalc.description,
    },
  ];

  return (
    <div className="landing-bg relative z-10 min-h-screen text-grey-900 font-sans selection:bg-accent-500 selection:text-white">
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="site-rail">
          <div className="max-w-2xl">
            <Reveal>
              <h1 className="text-headline font-semibold text-grey-900">
                {t.utils.title}
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-4 text-lead font-normal text-grey-400 break-keep">
                {t.utils.description}
              </p>
            </Reveal>
            <Reveal delay={140}>
              <div className="dm-card mt-12 overflow-hidden">
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group flex items-center justify-between gap-6 p-6 transition-colors hover:bg-surface-hover md:p-7"
                  >
                    <span className="min-w-0">
                      <span className="block text-base font-semibold text-grey-900">
                        {tool.title}
                      </span>
                      <span className="mt-1.5 block text-sm leading-6 text-grey-400 break-keep">
                        {tool.description}
                      </span>
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="shrink-0 text-grey-300 transition-all group-hover:translate-x-0.5 group-hover:text-grey-900"
                    >
                      <path
                        d="M3 8h10m0 0L9 4m4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
