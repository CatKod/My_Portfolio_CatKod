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

// Function to check overlap between two DOMRect-like objects
function rectsOverlap(r1, r2, tolerance = 1) {
  // r1 and r2 overlap if they intersect in both x and y
  const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
  const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
  return {
    overlaps: xOverlap > tolerance && yOverlap > tolerance,
    xOverlap,
    yOverlap
  };
}

async function inspectPage(page, urlName) {
  return await page.evaluate((urlName) => {
    const results = {
      url: window.location.href,
      pageTitle: document.title,
      discoveredSelectors: [],
      chips: [],
      cards: [],
      overlapErrors: [],
      containerStyles: {},
      summary: ''
    };

    // Find all potential skill elements
    const skillCards = Array.from(document.querySelectorAll('.skill-index-card, .home-capability-card, .skill-hero-card, .skill-tool-group'));
    const loopItems = Array.from(document.querySelectorAll('.logo-loop-item'));
    const toolPills = Array.from(document.querySelectorAll('.skill-tool-pill'));
    const allChips = [...loopItems, ...toolPills];

    results.discoveredSelectors = [
      { name: 'logo-loop-item', count: loopItems.length },
      { name: 'skill-tool-pill', count: toolPills.length },
      { name: 'skill-index-card', count: document.querySelectorAll('.skill-index-card').length },
      { name: 'home-capability-card', count: document.querySelectorAll('.home-capability-card').length },
    ];

    // Measure cards
    skillCards.forEach((card, idx) => {
      const rect = card.getBoundingClientRect();
      const style = window.getComputedStyle(card);
      const h2 = card.querySelector('h2');
      const p = card.querySelector('p');
      const h2Rect = h2 ? h2.getBoundingClientRect() : null;
      const pRect = p ? p.getBoundingClientRect() : null;
      const tools = card.querySelector('.skill-index-tools, .logo-loop');
      const toolsRect = tools ? tools.getBoundingClientRect() : null;

      let cardOverlap = null;
      if (h2Rect && pRect) {
        // check if h2 and p overlap
        const yOverlap = Math.max(0, Math.min(h2Rect.bottom, pRect.bottom) - Math.max(h2Rect.top, pRect.top));
        if (yOverlap > 1) {
          cardOverlap = { type: 'h2-p overlap', yOverlap };
        }
      }
      if (pRect && toolsRect) {
        const yOverlap = Math.max(0, Math.min(pRect.bottom, toolsRect.bottom) - Math.max(pRect.top, toolsRect.top));
        if (yOverlap > 1) {
          cardOverlap = { type: 'p-tools overlap', yOverlap };
        }
      }

      results.cards.push({
        index: idx,
        className: card.className,
        rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
        cardOverlap
      });
    });

    // Check cards vertical overlap
    for (let i = 0; i < results.cards.length - 1; i++) {
      const c1 = results.cards[i];
      const c2 = results.cards[i + 1];
      if (c1.className === c2.className && c1.rect.width > 0 && c2.rect.width > 0) {
        // Same container list
        const yDiff = c2.rect.top - c1.rect.bottom;
        if (yDiff < -1) {
          results.overlapErrors.push({
            type: 'card-to-card vertical overlap',
            card1: c1.index,
            card2: c2.index,
            overlapPx: Math.abs(yDiff)
          });
        }
      }
    }

    // Measure all chips (logo-loop-item and skill-tool-pill)
    allChips.forEach((chip, i) => {
      const rect = chip.getBoundingClientRect();
      const style = window.getComputedStyle(chip);
      const text = chip.innerText.trim();

      // Measure child elements inside chip (e.g. icon/mark and text span)
      const children = Array.from(chip.children).map(child => ({
        tag: child.tagName,
        className: child.className,
        text: child.innerText.trim(),
        rect: child.getBoundingClientRect(),
        computedStyle: {
          fontSize: window.getComputedStyle(child).fontSize,
          lineHeight: window.getComputedStyle(child).lineHeight
        }
      }));

      // Check text overlap inside chip: do mark and name overlap?
      let internalOverlap = null;
      if (children.length >= 2) {
        for (let a = 0; a < children.length; a++) {
          for (let b = a + 1; b < children.length; b++) {
            const r1 = children[a].rect;
            const r2 = children[b].rect;
            const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
            const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
            if (xOverlap > 1 && yOverlap > 1) {
              internalOverlap = { child1: children[a].className || children[a].tag, child2: children[b].className || children[b].tag, xOverlap, yOverlap };
              results.overlapErrors.push({
                type: 'chip-internal child overlap',
                chipIndex: i,
                chipText: text,
                details: internalOverlap
              });
            }
          }
        }
      }

      results.chips.push({
        index: i,
        selector: chip.className,
        text,
        rect: {
          top: Math.round(rect.top * 10) / 10,
          bottom: Math.round(rect.bottom * 10) / 10,
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
        },
        styles: {
          height: style.height,
          lineHeight: style.lineHeight,
          fontSize: style.fontSize,
          display: style.display,
          whiteSpace: style.whiteSpace
        },
        internalOverlap,
        childrenCount: children.length
      });
    });

    // Check sibling chip overlaps (for static tool pills)
    const pills = Array.from(document.querySelectorAll('.skill-tool-group div'));
    pills.forEach((groupDiv, gIdx) => {
      const groupPills = Array.from(groupDiv.querySelectorAll('.skill-tool-pill'));
      for (let a = 0; a < groupPills.length; a++) {
        for (let b = a + 1; b < groupPills.length; b++) {
          const r1 = groupPills[a].getBoundingClientRect();
          const r2 = groupPills[b].getBoundingClientRect();
          const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
          const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
          if (xOverlap > 2 && yOverlap > 2) {
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

    // Containers style check
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
  }, urlName);
}

async function runTests() {
  const browser = await chromium.launch();
  const summaryReport = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n==================================================`);
    console.log(`Testing Viewport: ${vp.label} (${vp.width}x${vp.height})`);
    console.log(`==================================================`);

    const consoleErrors = [];
    const requestFailures = [];

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1.25, // match user 125% DPI
    });

    const page = await context.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('requestfailed', req => {
      requestFailures.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });

    await page.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());

    // 1. Check Home Page
    console.log(`Navigating to https://catkod.github.io/ ...`);
    await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const homeShotPath = path.join(SHOTS_DIR, `home_${vp.width}x${vp.height}.png`);
    await page.screenshot({ path: homeShotPath, fullPage: true });

    const homeData = await inspectPage(page, 'home');

    // 2. Check Skills Page
    console.log(`Navigating to https://catkod.github.io/skills ...`);
    await page.goto('https://catkod.github.io/skills', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const skillsShotPath = path.join(SHOTS_DIR, `skills_${vp.width}x${vp.height}.png`);
    await page.screenshot({ path: skillsShotPath, fullPage: true });

    const skillsData = await inspectPage(page, 'skills');

    const vpSummary = {
      viewport: `${vp.width}x${vp.height}`,
      label: vp.label,
      homeChips: homeData.chips.length,
      homeErrors: homeData.overlapErrors,
      skillsChips: skillsData.chips.length,
      skillsErrors: skillsData.overlapErrors,
      consoleErrorsCount: consoleErrors.length,
      requestFailuresCount: requestFailures.length,
      skillsContainerStyles: skillsData.containerStyles,
      sampleChips: skillsData.chips.slice(0, 5),
      shots: {
        home: homeShotPath,
        skills: skillsShotPath
      }
    };

    summaryReport.push(vpSummary);
    console.log(`Result: Skills chips count = ${skillsData.chips.length}, Overlap errors = ${skillsData.overlapErrors.length}`);
    if (skillsData.overlapErrors.length > 0) {
      console.log('OVERLAPS FOUND:', JSON.stringify(skillsData.overlapErrors, null, 2));
    }

    await context.close();
  }

  // Also test 1492x751 with deviceScaleFactor = 1.0 just to be completely thorough
  console.log(`\n==================================================`);
  console.log(`Testing 1492x751 with deviceScaleFactor = 1.0`);
  console.log(`==================================================`);
  {
    const context = await browser.newContext({
      viewport: { width: 1492, height: 751 },
      deviceScaleFactor: 1.0,
    });
    const page = await context.newPage();
    await page.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());
    await page.goto('https://catkod.github.io/skills', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const shotPath = path.join(SHOTS_DIR, `skills_1492x751_scale10.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    const skillsData = await inspectPage(page, 'skills');
    console.log(`Scale 1.0 Result: Overlap errors = ${skillsData.overlapErrors.length}`);
    if (skillsData.overlapErrors.length > 0) {
      console.log('OVERLAPS FOUND (scale 1.0):', JSON.stringify(skillsData.overlapErrors, null, 2));
    }
    await context.close();
  }

  await browser.close();

  // Save report to JSON
  fs.writeFileSync(path.join(SHOTS_DIR, 'test_report.json'), JSON.stringify(summaryReport, null, 2));
  console.log('\nAll tests complete! Report saved to ' + path.join(SHOTS_DIR, 'test_report.json'));
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
