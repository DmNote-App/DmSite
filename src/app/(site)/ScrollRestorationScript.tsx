import Script from "next/script";

const STORAGE_KEY = "dm-site:scrollY";

export function ScrollRestorationScript() {
  const code = `
(function() {
  try {
    var key = ${JSON.stringify(STORAGE_KEY)};

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    var restore = function() {
      var raw = sessionStorage.getItem(key);
      var y = raw ? Number(raw) : 0;
      if (!Number.isFinite(y) || y <= 0) return;
      window.scrollTo(0, y);
    };

    // Restore as early as possible to avoid a visible jump after first paint.
    restore();

    // Save on hard reload / tab close.
    window.addEventListener("pagehide", function() {
      try {
        sessionStorage.setItem(key, String(window.scrollY || 0));
      } catch (e) {}
    });
  } catch (e) {}
})();
`;

  return (
    <Script
      id="scroll-restoration"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
