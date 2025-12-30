import Link from 'next/link';

export default function KeyViewerBanner() {
    return (
        <Link
            href="https://dmnote.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-surface px-6 py-5 transition-all hover:bg-surface-hover active:scale-[0.99]"
        >
            <div className="flex items-center gap-4">
                {/* Placeholder Icon / Logo Area */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01" />
                        <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01" />
                        <path d="M7 16h10" />
                    </svg>
                </div>

                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-grey-900">
                            DM Note Viewer
                        </h3>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                            NEW
                        </span>
                    </div>
                    <p className="text-[15px] font-medium text-grey-600">
                        커스터마이징을 지원하는 키뷰어
                    </p>
                </div>
            </div>

            <div className="text-grey-400 transition-transform group-hover:translate-x-1">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                </svg>
            </div>
        </Link>
    );
}
