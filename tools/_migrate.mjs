/**
 * Di chuyển script trong `tools/` sang cấu trúc thư mục mới.
 * Chạy 1 lần: node tools/_migrate.mjs
 *
 *   - KEEP (verify/, build/, lib/, data/, cv/, deploy/): git mv, giữ lịch sử.
 *   - SCRATCH: di chuyển trên đĩa vào tools/scratch/ (gitignored) — giữ để tra cứu
 *     cục bộ nhưng không còn làm rò bản repo.
 *   - Còn lại: xoá hẳn (đã có trong lịch sử git).
 */
import { mkdirSync, existsSync, renameSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const T = (p) => path.join(ROOT, 'tools', p);

/** file -> thư mục đích. */
const MAP = {
  'build': ['buildSite.mjs', 'rebrand.mjs', 'patchCss.mjs', 'patchCredLink.mjs',
            'synciconmap.mjs', 'renameChunks.mjs', 'pruneChunks.mjs'],
  'lib': ['dom.mjs', 'flight.mjs', 'flightNode.mjs', 'writeSafe.mjs', 'build.mjs',
          'skillsFlight.mjs', 'calendarDom.mjs', 'logo.mjs', 'socials.mjs', 'common.mjs',
          'cv.mjs', 'transform.mjs', 'replacements.mjs'],
  'data': ['profile.mjs', 'icons.mjs'],
  'cv': ['buildCv.mjs'],
  'deploy': ['deployPages.mjs', 'prepareDeploy.mjs', 'syncPages.mjs', 'syncLegacyChunks.mjs'],
  'verify': ['refcheck.mjs', 'checkroutes.mjs', 'checkicons.mjs', 'iconmapdiff.mjs',
             'parityCheck.mjs', 'assetCheck.mjs', 'checkall.mjs', 'liveverify.mjs',
             'verifyAllRoutes.mjs', 'staticCheck.mjs', 'ssrcheck.mjs', 'validate.mjs',
             'listassets.mjs', 'find404.mjs', 'fetchCdnIcons.mjs', 'fetchFonts.mjs',
             'ghPagesServer.mjs', 'staticServer.mjs', 'genCertImages.mjs', 'calendar.mjs',
             'blocks.mjs', 'pngdiff.mjs', 'diffRoute.mjs', 'textAudit.mjs', 'collapseCheck.mjs',
             'overlapScan.mjs', 'sweepOverlap.mjs', 'inspectHits.mjs', 'checkSkillsDelta.mjs',
             'checkRefs.mjs', 'icons2.mjs', 'plan.mjs'],
};

/** Script điều tra 1-lần -> tools/scratch/ (gitignored). */
const SCRATCH = [
  'about_probe', 'actionsdump', 'adump', 'allkeys', 'analyze_hist', 'analyze_skills',
  'answers', 'askq', 'asst', 'at', 'badtree', 'bctx', 'blockraw', 'blocks2', 'brand',
  'calcount', 'caldom', 'calinfo', 'caljson', 'callevels', 'calpair', 'caltest', 'calverify',
  'chain', 'check2', 'checkFooterOverlap', 'checkOverlay', 'checkUserViewport', 'chunkat',
  'chunkat2', 'chunkexist', 'chunkfind', 'chunklink', 'chunkref', 'chunks', 'chunkslice',
  'classes', 'cmp', 'cmpicon', 'cmpmap', 'cmpmap2', 'cmpRsc', 'compare',
  'compareAgainstOriginal', 'compareBeforeAfter', 'compareHomeCss', 'count', 'countneedle',
  'countpart', 'cprobe', 'cred23', 'cred_probe', 'credchunk', 'crop', 'cropuser', 'cssgrep',
  'cssmedia', 'cssrefs', 'cssslice', 'ctx', 'ctx2', 'ctx3', 'ctx4', 'cvfind', 'dangling',
  'dangling2', 'dbg', 'debug1024', 'decode', 'domdiff', 'domdiff2', 'domdump', 'domfl',
  'domflight', 'domflighttext', 'dump', 'dumpBaseRules', 'dumpFrameCss', 'dumpHomeCss',
  'dumpLayout', 'dumpflight', 'dumpiconmap', 'dumpneedle', 'dumpwork', 'el', 'el2', 'el3',
  'el4', 'el5', 'emptypush', 'escchars', 'experimentPatch', 'experimentPatch2', 'extract',
  'extractHomeRules', 'extracticonmap', 'extractmap', 'fc', 'fchunk', 'fctx', 'fdump',
  'fetchRsc', 'fetchcheck', 'ffind', 'fgrep', 'find', 'find2', 'findExactSnippets',
  'findMediaHome', 'findViewport', 'find_iconmap', 'findrows', 'findskills', 'findtext',
  'fixbroken', 'fixsvg', 'flfind', 'flight2', 'flightHas', 'flightMap', 'flightRefs',
  'flightShow', 'flightTree', 'flightchk', 'flightdec', 'flightdom', 'flighthead', 'flightid',
  'flightlines', 'flightmap2', 'flightonly', 'flightrows', 'flighttexts', 'flighttexts2',
  'flloops', 'flrow', 'flrows', 'flslice', 'fontcheck', 'footer', 'gb', 'gb2',
  'gemini_accurate_test', 'gemini_check_translate', 'gemini_comprehensive_test',
  'gemini_inspect_cards', 'gemini_inspect_dom', 'gemini_inspect_home_and_skills',
  'gemini_test_vi', 'getrow', 'getrow2', 'ghcolor', 'ghcontrib', 'ghcontrib2', 'ghdata',
  'ghlevels', 'ghrepos', 'grepq', 'grepstr', 'hashcmp', 'head', 'hist', 'ic', 'iconvariants',
  'identifyPage', 'igcount', 'igdump', 'imgcheck', 'inspect', 'inspect1024Styles',
  'inspect1024x900', 'inspectFrameStructure', 'inspectLoader', 'jctx', 'js1', 'jsfind',
  'jsgrep', 'keys', 'langfind', 'leafdiff', 'legend', 'legend2', 'letter_probe', 'listparts',
  'logoprobe', 'logoverify', 'mapctx', 'marks', 'matchicons', 'measureBrowser', 'measureCards',
  'measureHomeOverlap', 'measureLive', 'measureRows', 'measureSpill', 'missingref', 'mkdbg',
  'mkdbg2', 'mm', 'netprobe', 'nest', 'nodes', 'occ', 'order', 'orphans', 'outline', 'parity',
  'parity2', 'parity3', 'partmap', 'patchProfile', 'patchRebrand', 'patchRebrand2',
  'patchRebrand3', 'patchRebrand4', 'patchRebrand5', 'patchRebrand6', 'patchCssHome',
  'pathcheck', 'pdfref', 'pdfs', 'pill_probe', 'pillchunk', 'pixelMatch', 'pixdiff',
  'pointCheck', 'probe', 'probe2', 'projects', 'projparse', 'pushes', 'raw', 'rawsnip',
  'region', 'roundtrip', 'roundtrip2', 'row', 'rowdiff', 'rowsdump', 'rowsfind', 'rsc', 'rsc2',
  'rscfind', 'rscprobe', 'rscrowdiff', 'rscrows', 'rsccompare', 'rscequal', 'rsclinediff',
  'rscsrv', 'rsctest', 'sample', 'saveel', 'scan', 'scanchunk', 'scanchunk2', 'scanchunk3',
  'sel', 'setupCompare', 'shot', 'showparts', 'skillOverlap', 'skills_probe',
  'skills_probe2', 'skills_chunk', 'skillsdiff', 'slice', 'slice2', 'slugs', 'snip',
  'social_count', 'social_nav', 'ssrget', 'staticsrv', 't1', 'tcontact', 'tdiag', 'tdiag2',
  'tdiag3', 'tdiv', 'test1280', 'testPatch', 'testPatchCombination', 'test_build',
  'test_focus', 'testarr', 'text', 'textAudit2', 'textall', 'textdiff', 'textparity',
  'textparity2', 'titlecheck', 'trackLoader', 'u2', 'users', 'verify', 'verifyClean',
  'verifyFinal', 'verifyFinal2', 'verifyLocal', 'verifyMinimal', 'wctx', 'workflight',
  'captureLiveHome', 'routecheck', 'measureSpill2', 'setupCompare2',
];

const git = (...args) => execFileSync('git', args, { cwd: ROOT, stdio: 'pipe' });

console.log('=== 1. git mv sang cấu trúc mới ===');
const keep = new Set();
for (const [dir, files] of Object.entries(MAP)) {
  mkdirSync(T(dir), { recursive: true });
  for (const f of files) {
    keep.add(f);
    const src = T(f);
    if (!existsSync(src)) { console.log('  bỏ qua (không có): ' + f); continue; }
    try {
      git('mv', '-f', src, T(dir + '/' + f));
    } catch (e) {
      console.log('  git mv lỗi: ' + f + ' -> ' + e.message.slice(0, 80));
    }
  }
}

console.log('\n=== 2. di chuyển script điều tra sang tools/scratch/ ===');
mkdirSync(T('scratch'), { recursive: true });
let nScratch = 0;
for (const name of SCRATCH) {
  const src = T(name + '.mjs');
  if (!existsSync(src)) continue;
  try {
    git('rm', '-q', '-f', '--cached', src);
  } catch { /* file chưa được track */ }
  renameSync(src, T('scratch/' + name + '.mjs'));
  nScratch++;
}
console.log('  đã chuyển ' + nScratch + ' script vào tools/scratch/');

console.log('\n=== 3. xoá file rác còn lại trong tools/ ===');
let nDel = 0;
for (const f of readdirSync(T(''))) {
  if (!f.endsWith('.mjs')) continue;
  if (keep.has(f) || f.startsWith('_')) continue;
  try { git('rm', '-q', '-f', '--cached', T(f)); } catch { /* chưa track */ }
  rmSync(T(f), { force: true });
  nDel++;
}
console.log('  đã xoá ' + nDel + ' file');

console.log('\n=== 4. xoá script tạm của tôi ===');
for (const f of readdirSync(T(''))) {
  if (f.startsWith('_')) rmSync(T(f), { force: true });
}

console.log('\nXong.');
