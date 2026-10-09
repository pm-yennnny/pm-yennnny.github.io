// 프로젝트 상세 페이지: 주소의 ?p=이름 을 보고 projects.js의 내용을 화면에 그린다.
const list = window.PROJECTS || [];
const slug = new URLSearchParams(location.search).get('p');
const idx = Math.max(0, list.findIndex(p => p.slug === slug));
const P = list[idx];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const li = items => items.map(t => `<li>${esc(t)}</li>`).join('');
const fig = f => `<figure><button class="zoom" data-src="${f.src}" aria-label="${esc(f.cap)} 크게 보기"><img src="${f.src}" alt="${esc(f.cap)}" loading="lazy"></button><figcaption>${esc(f.cap)}${f.blur ? '<span class="bl">내부 자료 · 흐림 처리</span>' : ''}</figcaption>${f.notes ? `<ul class="dash">${li(f.notes)}</ul>` : ''}</figure>`;

const BLOCK = {
  list: b => `<ul class="dash big">${li(b.items)}</ul>`,
  steps: b => `<ol class="steps">${b.items.map((s, i) => `<li><span class="mono">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div></li>`).join('')}</ol>`,
  chips: b => `<div class="chips pad">${b.items.map(t => `<i>${esc(t)}</i>`).join('')}</div>`,
  flow: b => `<div class="flow3${b.plain ? ' plain' : ''}">${b.cols.map((c, i) => `<div><h3><span class="mono">${i + 1}</span>${esc(c.h)}</h3><ul class="dash">${li(c.items)}</ul></div>`).join('')}</div>`,
  compare: b => `<div class="cmp">${b.items.map(c => `<div class="cmp-row"><p class="cmp-l">${esc(c.l)}</p><div class="cmp-b"><small class="mono">${esc(c.bn)}</small><b>${esc(c.before)}</b></div><span class="cmp-ar">→</span><div class="cmp-a"><small class="mono">${esc(c.an)}</small><b>${esc(c.after)}</b></div></div>`).join('')}</div>`,
  figures: b => `<div class="figs ${b.layout}">${b.items.map(fig).join('')}</div>`,
  results: b => `<div class="res2"><div><h3>정량 성과</h3><ul class="dash">${li(b.quant)}</ul></div><div><h3>정성 성과</h3><ul class="dash">${li(b.qual)}</ul></div></div>`,
  code: b => `<pre class="code mono"><code>${esc(b.code)}</code></pre>${b.note ? `<p class="code-note">${esc(b.note)}</p>` : ''}`,
  todo: b => `<p class="todo mono">${esc(b.text)}</p>`,
};

function render() {
  document.title = `${P.title} — 지예은`;
  document.getElementById('crumb').textContent = `${P.no} ${P.title}`;
  const dots = P.contrib ? '●'.repeat(P.contrib) + '○'.repeat(5 - P.contrib) : '';
  const prev = list[(idx - 1 + list.length) % list.length], next = list[(idx + 1) % list.length];

  document.getElementById('detail').innerHTML = `
    <header class="d-head">
      <p class="mono">#${P.no} · ${esc(P.type)} · ${esc(P.period)} <em class="st ${P.status === '완료' ? '' : 'run'}">${esc(P.status)}</em></p>
      <h1>${esc(P.title)}</h1>
      <p class="lead">${esc(P.summary)}</p>
    </header>
    <div class="d-top">
      <dl class="panel spec">
        <div><dt class="mono">회사</dt><dd>${esc(P.company)}</dd></div>
        <div><dt class="mono">기간</dt><dd>${esc(P.period)}</dd></div>
        <div><dt class="mono">역할</dt><dd>${esc(P.role)}</dd></div>
        ${P.team ? `<div><dt class="mono">함께한 사람</dt><dd>${esc(P.team)}</dd></div>` : ''}
        ${dots ? `<div><dt class="mono">기여도</dt><dd class="dots">${dots}</dd></div>` : ''}
      </dl>
      <div class="d-kpis">${P.kpis.map((k, i) => `<div class="kpi${i ? '' : ' pt'}"><p class="v">${esc(k.v)}</p><p class="l">${esc(k.l)}</p></div>`).join('')}</div>
    </div>
    ${P.blocks.map(b => `<section class="blk">${b.title ? `<div class="sh"><h2>${esc(b.title)}</h2></div>` : ''}<div class="panel${b.type === 'figures' || b.type === 'todo' ? ' bare' : ''}">${BLOCK[b.type](b)}</div></section>`).join('')}
    <nav class="pn">
      <a class="panel" href="work.html?p=${prev.slug}"><small class="mono">← 이전 · ${prev.no}</small><b>${esc(prev.title)}</b></a>
      <a class="panel" href="work.html?p=${next.slug}"><small class="mono">다음 · ${next.no} →</small><b>${esc(next.title)}</b></a>
    </nav>`;

  // 왼쪽 메뉴의 프로젝트 목록
  document.getElementById('sub').innerHTML = list.map(p =>
    `<a href="work.html?p=${p.slug}"${p === P ? ' class="on"' : ''}><span class="mono">${p.no}</span>${esc(p.title)}</a>`).join('');
}
if (P) render();

// 이미지 크게 보기
const lb = document.getElementById('lb'), lbImg = lb.querySelector('img');
document.addEventListener('click', e => {
  const z = e.target.closest('.zoom');
  if (z) { lbImg.src = z.dataset.src; lbImg.alt = z.querySelector('img').alt; lb.hidden = false; lb.querySelector('button').focus(); }
  else if (e.target.closest('#lb')) lb.hidden = true;
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });

// 메일 주소 복사
document.querySelectorAll('.copy').forEach(btn => {
  const label = btn.querySelector('span'), original = label.textContent;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      label.textContent = '복사했습니다';
      btn.classList.add('done');
      setTimeout(() => { label.textContent = original; btn.classList.remove('done'); }, 1800);
    } catch {
      location.href = 'mailto:' + btn.dataset.copy;
    }
  });
});
