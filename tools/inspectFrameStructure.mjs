import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 575 } });
await page.goto('http://localhost:9311/', { waitUntil: 'domcontentloaded' });

const info = await page.evaluate(() => {
  const stage = document.querySelector('.stage');
  const footer = document.querySelector('.frame-footer');
  const frame = document.querySelector('.portfolio-frame');
  const rS = stage.getBoundingClientRect();
  const rF = footer ? footer.getBoundingClientRect() : null;
  const rFr = frame.getBoundingClientRect();
  const sS = getComputedStyle(stage);
  const sF = footer ? getComputedStyle(footer) : null;
  const sFr = getComputedStyle(frame);

  return {
    frame: { rect: rFr, display: sFr.display, flexDirection: sFr.flexDirection, gridTemplate: sFr.gridTemplate },
    stage: { rect: rS, overflow: sS.overflow, overflowY: sS.overflowY },
    footer: footer ? { rect: rF, position: sF.position, zIndex: sF.zIndex } : null,
    stageParent: stage.parentElement ? { tag: stage.parentElement.tagName, cls: stage.parentElement.className } : null
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
