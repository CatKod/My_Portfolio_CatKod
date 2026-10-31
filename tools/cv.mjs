/**
 * Sinh CV HTML cho Hoàng Kim Vĩnh từ `profile.mjs`.
 *
 * Nguồn duy nhất cho nội dung CV là `tools/profile.mjs` — cùng nguồn với
 * các trang của site, để CV không lệch với portfolio.
 */
import {
  profile, hero, capabilities, workHistory, education,
  projects, skillGroups, credentials,
} from './profile.mjs';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const PROFILE_LINK = (label, href) =>
  `<a href="${href}">${esc(label)}</a>`;

const line = (l) => `<span class="sep">·</span>${esc(l)}`;

export function buildCvHtml() {
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  const projectBlock = (p) => `
      <div class="item">
        <div class="item-head">
          <h3>${esc(p.title)}</h3>
          <span class="meta">${esc(p.year)} · ${esc(p.category)}</span>
        </div>
        <p class="body">${esc(p.description)}</p>
        <p class="impact">${esc(p.impact)}</p>
        <p class="stack">${p.stack.map(line).join(' ')}</p>
        ${p.githubUrl ? `<p class="link">${PROFILE_LINK(p.githubUrl.replace('https://github.com/', 'github.com/'), p.githubUrl)}</p>` : ''}
      </div>`;

  const certBlock = (c) => `
      <div class="item">
        <div class="item-head">
          <h3>${esc(c.title)}</h3>
          <span class="meta">${esc(c.code)}</span>
        </div>
        <p class="body">${esc(c.issuer)} — ${esc(c.summary)}</p>
        <p class="link">${PROFILE_LINK(c.href, c.href)}</p>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${esc(profile.name)} — CV 2026</title>
<style>
  @page { size: A4; margin: 13mm 14mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 9.6pt;
    line-height: 1.42;
    color: #14171a;
  }
  a { color: #0b5fa5; text-decoration: none; }
  h1 { font-size: 21pt; margin: 0 0 2pt; letter-spacing: -0.4pt; }
  .role { font-size: 11pt; color: #1c5d99; font-weight: 600; margin: 0 0 5pt; }
  .contact { font-size: 8.8pt; color: #444; margin: 0 0 9pt; }
  .contact a { color: #444; }
  .summary { font-size: 9.6pt; margin: 0 0 10pt; }
  h2 {
    font-size: 9.4pt; text-transform: uppercase; letter-spacing: 1.4pt;
    color: #0b5fa5; border-bottom: 1px solid #c9d6e2;
    margin: 12pt 0 6pt; padding-bottom: 2.5pt;
  }
  .item { margin-bottom: 7pt; }
  .item-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10pt; }
  .item-head h3 { font-size: 10pt; margin: 0; }
  .meta { font-size: 8.4pt; color: #666; white-space: nowrap; }
  p { margin: 1.5pt 0 0; }
  .body { color: #1e2226; }
  .impact { color: #3b4148; }
  .stack, .link { font-size: 8.4pt; color: #666; }
  .sep { margin: 0 4pt; color: #b0b0b0; }
  .grid { column-count: 2; column-gap: 16pt; }
  .skills li { margin-bottom: 2.5pt; break-inside: avoid; }
  .skills strong { font-size: 9.4pt; }
  .skills p { color: #3b4148; font-size: 8.8pt; }
  ul { margin: 0; padding-left: 12pt; }
  .caps { column-count: 2; column-gap: 16pt; }
  .caps div { break-inside: avoid; margin-bottom: 5pt; }
  .caps b { font-size: 9.2pt; }
  .caps span { color: #666; font-size: 8.6pt; }
</style>
</head>
<body>

<h1>${esc(profile.name)}</h1>
<p class="role">${esc(profile.role)} — ${esc(profile.target)}</p>
<p class="contact">
  ${PROFILE_LINK(profile.email, 'mailto:' + profile.email)} ${line(profile.phone)} ${line(profile.location)}
  ${line(profile.studentId)}<br/>
  ${PROFILE_LINK('github.com/CatKod', profile.links.github)} ${line('LinkedIn')} ${line('JLPT N3')} ${line('Hanoi, Vietnam')}
</p>

<h2>Profile</h2>
<p class="summary">${esc(hero.copy)}</p>

<h2>Core capability</h2>
<div class="caps">
${capabilities.map((c) => `  <div><b>${esc(c.title)}</b><br/><span>${esc(c.body)}</span></div>`).join('\n')}
</div>

<h2>Experience</h2>
${workHistory.map((w) => `
<div class="item">
  <div class="item-head">
    <h3>${esc(w.title)}</h3>
    <span class="meta">${esc(w.year)}</span>
  </div>
  <p class="body">${esc(w.org)}</p>
  <p class="impact">${esc(w.body)}</p>
</div>`).join('\n')}

<h2>Selected projects</h2>
${featured.map(projectBlock).join('\n')}
${others.map(projectBlock).join('\n')}

<h2>Technical skills</h2>
<div class="grid">
<ul class="skills">
${skillGroups.map((g) => `  <li><strong>${esc(g.title)}</strong><p>${esc(g.body)}</p></li>`).join('\n')}
</ul>
</div>

<h2>Education</h2>
${education.map((e) => `
<div class="item">
  <div class="item-head">
    <h3>${esc(e.title)}</h3>
    <span class="meta">${esc(e.year)}</span>
  </div>
  <p class="body">${esc(e.org)}</p>
  <p class="impact">${esc(e.body)}</p>
</div>`).join('\n')}

<h2>Certifications</h2>
${credentials.map(certBlock).join('\n')}

</body>
</html>`;
}
