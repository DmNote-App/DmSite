export { middleware as default } from "nextra/locales";

export const config = {
  // Only apply locale redirect to docs entrypoint.
  matcher: ["/docs/:path*"],
};
