import { NextRequest, NextResponse } from "next/server";
import { getLocale, isLocale, localizeDocsHref } from "./lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  if (pathname === "/ko" || pathname === "/ko/") {
    url.pathname = "/";
    return NextResponse.redirect(url, 308);
  }
  if (/^\/(ko|en)\/docs\/api-reference\/index\/?$/.test(pathname)) {
    url.pathname = pathname.replace(/\/index\/?$/, "/");
    return NextResponse.redirect(url, 308);
  }
  if (/^\/docs(?:\/|$)/.test(pathname)) {
    const preference = request.cookies.get("NEXT_LOCALE")?.value;
    const locale = isLocale(preference) ? preference : getLocale(request.headers);
    url.pathname = localizeDocsHref(pathname, locale);
    const response = NextResponse.redirect(url, 307);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/ko",
    "/docs/:path*",
    "/ko/docs/api-reference/index",
    "/en/docs/api-reference/index",
  ],
};
