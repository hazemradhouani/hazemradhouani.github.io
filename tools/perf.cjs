// Run: npm run perf  (needs the local server: npm run serve)
// Lab substitute (not Lighthouse): Chrome LCP/CLS observers, mobile 412x823, slow 4G (150 ms RTT, 1.6 Mbps down), 4x CPU. Median of 3.
const { chromium } = require('playwright-core');
const BASE = 'http://127.0.0.1:8090/';
const pages = ['', 'architecture.html', 'projects/project-al-arg.html', 'projects/project-belhomme.html', 'projects/project-zenata.html', 'books.html', 'about.html', 'motion.html'];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  for (const pg of pages) {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 2, isMobile: true });
      const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page);
      await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      let bytes = 0; cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; });
      await page.addInitScript(() => { window.__lcp = 0; window.__cls = 0;
        new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__lcp = e.startTime; window.__lcpEl = e.element ? e.element.tagName.toLowerCase() : '?'; } }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
      await page.goto(BASE + pg, { waitUntil: 'load' }); await page.waitForTimeout(2500);
      const m = await page.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls, el: window.__lcpEl }));
      runs.push({ ...m, kb: Math.round(bytes / 1024) }); await ctx.close();
    }
    runs.sort((a, c) => a.lcp - c.lcp); const r = runs[1];
    console.log(`${(pg || 'index').padEnd(34)} LCP ${(r.lcp / 1000).toFixed(2)} s (${r.el})  CLS ${r.cls.toFixed(3)}  transfer ${r.kb} KB`);
  }
  await b.close();
})();
