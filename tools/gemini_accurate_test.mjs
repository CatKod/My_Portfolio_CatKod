import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const VIEWPORTS = [
  { width: 1492, height: 751, label: '1492x751 (user exact)' },
  { width: 1440, height: 751, label: '1440x751' },
  { width: 1536, height: 751, label: '1536x751' },
  { width: 1492, height: 700, label: '1492x700' },
  { width: 1492, height: 800, label: '1492x800' },
  { width: 1600, height: 751, label: '1600x751' },
  { width: 1366, height: 768, label: '1366x768' },
  { width: 1280, height: 800, label: '1280x800 (comparison)' },
];

const SHOTS_DIR = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini';
if (!fs.existsSync(SHOTS_DIR)) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
}

async function inspectSkillsPage(page) {
  return await page.evaluate(() => {
    const results = {
      cardDetails: [],
      chips: [],
      pills: [],
      overlapErrors: [],
      containerStyles: {}
    };

    // 1. Check skill-index-card
    const cards = Array.from(document.querySelectorAll('.skill-index-card'));
    cards.forEach((card, i) => {
      const h2 = card.querySelector('h2');
      const p = card.querySelector('p');
      const tools = card.querySelector('.skill-index-tools');
      const loop = card.querySelector('.logo-loop');

      const h2Rect = h2 ? h2.getBoundingClientRect() : null;
      const pRect = p ? p.getBoundingClientRect() : null;
      const toolsRect = tools ? tools.getBoundingClientRect() : null;
      const cardRect = card.getBoundingClientRect();

      let textOverlap = null;
      // Check if p overlaps h2
      if (h2Rect && pRect) {
        const yOverlap = h2Rect.bottom - pRect.top;
        if (yOverlap > 0.5) {
          textOverlap = { type: 'h2-p overlap', yOverlap };
          results.overlapErrors.push({
            type: 'h2-p overlap',
            card: i,
            title: h2.innerText.trim(),
            yOverlap
          });
        }
      }
      // Check if tools overlaps p
      if (pRect && toolsRect) {
        const yOverlap = pRect.bottom - toolsRect.top;
        if (yOverlap > 0.5) {
          textOverlap = { type: 'p-tools overlap', yOverlap };
          results.overlapErrors.push({
            type: 'p-tools overlap',
            card: i,
            title: h2 ? h2.innerText.trim() : '',
            yOverlap
          });
        }
      }

      results.cardDetails.push({
        index: i,
        title: h2 ? h2.innerText.trim() : '',
        cardRect: { top: cardRect.top, bottom: cardRect.bottom, height: cardRect.height },
        h2Rect: h2Rect ? { top: h2Rect.top, bottom: h2Rect.bottom, height: h2Rect.height } : null,
        pRect: pRect ? { top: pRect.top, bottom: pRect.bottom, height: pRect.height } : null,
        toolsRect: toolsRect ? { top: toolsRect.top, bottom: toolsRect.bottom, height: toolsRect.height } : null,
        textOverlap
      });
    });

    // 2. Check chips inside loop
    const loopItems = Array.from(document.querySelectorAll('.logo-loop-item'));
    loopItems.forEach((item, i) => {
      const mark = item.querySelector('.logo-loop-mark');
      const name = item.querySelector('.logo-loop-name');
      const itemRect = item.getBoundingClientRect();
      const markRect = mark ? mark.getBoundingClientRect() : null;
      const nameRect = name ? name.getBoundingClientRect() : null;

      let internalOverlap = null;
      if (markRect && nameRect) {
        const xOverlap = Math.max(0, Math.min(markRect.right, nameRect.right) - Math.max(markRect.left, nameRect.left));
        const yOverlap = Math.max(0, Math.min(markRect.bottom, nameRect.bottom) - Math.max(markRect.top, nameRect.top));
        if (xOverlap > 1 && yOverlap > 1) {
          internalOverlap = { xOverlap, yOverlap };
          results.overlapErrors.push({
            type: 'chip-mark-name overlap',
            index: i,
            text: name.innerText.trim(),
            internalOverlap
          });
        }
      }

      const style = window.getComputedStyle(item);
      results.chips.push({
        index: i,
        text: item.innerText.trim(),
        rect: { top: itemRect.top, bottom: itemRect.bottom, left: itemRect.left, right: itemRect.right, width: itemRect.width, height: itemRect.height },
        lineHeight: style.lineHeight,
        fontSize: style.fontSize,
        height: style.height,
        internalOverlap
      });
    });

    // 3. Check skill-tool-pill
    const pills = Array.from(document.querySelectorAll('.skill-tool-pill'));
    pills.forEach((pill, i) => {
      const rect = pill.getBoundingClientRect();
      const style = window.getComputedStyle(pill);
      results.pills.push({
        index: i,
        text: pill.innerText.trim(),
        rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
        lineHeight: style.lineHeight,
        fontSize: style.fontSize,
        height: style.height
      });
    });

    // 4. Check sibling pills overlap
    const pillGroups = Array.from(document.querySelectorAll('.skill-tool-group div'));
    pillGroups.forEach((group, gIdx) => {
      const groupPills = Array.from(group.querySelectorAll('.skill-tool-pill'));
      for (let a = 0; a < groupPills.length; a++) {
        for (let b = a + 1; b < groupPills.length; b++) {
          const r1 = groupPills[a].getBoundingClientRect();
          const r2 = groupPills[b].getBoundingClientRect();
          const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
          const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
          if (xOverlap > 1 && yOverlap > 1) {
            results.overlapErrors.push({
              type: 'tool-pill sibling overlap',
              group: gIdx,
              pill1: groupPills[a].innerText.trim(),
              pill2: groupPills[b].innerText.trim(),
              xOverlap,
              yOverlap
            });
          }
        }
      }
    });

    // Container styles
    const containers = ['.skill-index-panel', '.skill-tool-panel', '.skill-minimal', '.logo-loop', '.logo-loop-track'];
    containers.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        const cs = window.getComputedStyle(el);
        results.containerStyles[sel] = {
          display: cs.display,
          overflow: cs.overflow,
          textOverflow: cs.textOverflow,
          width: cs.width,
          height: cs.height,
          gridTemplateColumns: cs.gridTemplateColumns,
          gridTemplateRows: cs.gridTemplateRows
        };
      }
    });

    return results;
  });
}

async function main() {
  const browser = await chromium.launch();
  const fullReport = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n==================================================`);
    console.log(`Running accurate test for ${vp.label} (${vp.width}x${vp.height})`);
    console.log(`==================================================`);

    const consoleErrors = [];
    const requestFailures = [];

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1.25,
    });
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('requestfailed', req => {
      requestFailures.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });

    await page.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());

    // Navigate to skills
    await page.goto('https://catkod.github.io/skills', { waitUntil: 'networkidle' });

    // Wait for loader to completely vanish!
    try {
      await page.waitForSelector('.initial-loader', { state: 'detached', timeout: 8000 });
    } catch {
      console.log('Loader detach wait timeout, continuing...');
    }
    // Also wait 2.5s as requested by user prompt
    await page.waitForTimeout(2500);

    const shotPath = path.join(SHOTS_DIR, `skills_${vp.width}x${vp.height}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });

    // Also take screenshot of Home
    await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
    try {
      await page.waitForSelector('.initial-loader', { state: 'detached', timeout: 8000 });
    } catch {}
    await page.waitForTimeout(2500);
    const homeShotPath = path.join(SHOTS_DIR, `home_${vp.width}x${vp.height}.png`);
    await page.screenshot({ path: homeShotPath, fullPage: true });

    // Re-inspect skills
    await page.goto('https://catkod.github.io/skills', { waitUntil: 'networkidle' });
    try {
      await page.waitForSelector('.initial-loader', { state: 'detached', timeout: 8000 });
    } catch {}
    await page.waitForTimeout(2500);
    const metrics = await inspectSkillsPage(page);

    const reportItem = {
      viewport: `${vp.width}x${vp.height}`,
      label: vp.label,
      totalChips: metrics.chips.length,
      totalPills: metrics.pills.length,
      overlapErrorsCount: metrics.overlapErrors.length,
      overlapErrors: metrics.overlapErrors,
      cardDetails: metrics.cardDetails,
      consoleErrors,
      requestFailures,
      containerStyles: metrics.containerStyles,
      sampleChips: metrics.chips.slice(0, 3),
      shotPath
    };

    fullReport.push(reportItem);
    console.log(`Viewport ${vp.width}x${vp.height}: Chips=${metrics.chips.length}, Pills=${metrics.pills.length}, Overlaps=${metrics.overlapErrors.length}`);
    if (metrics.overlapErrors.length > 0) {
      console.log('Errors:', JSON.stringify(metrics.overlapErrors, null, 2));
    }

    await context.close();
  }

  await browser.close();

  fs.writeFileSync(path.join(SHOTS_DIR, 'accurate_report.json'), JSON.stringify(fullReport, null, 2));
  console.log('\nAccurate report saved to accurate_report.json');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
