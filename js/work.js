// 프로젝트 상세 페이지: 주소의 ?p=이름 을 보고 projects.js의 내용을 화면에 그린다.
// 일하는 방식(Lab) 사례는 window.LABS에 따로 두어, 대표 프로젝트의 번호·순서·목록에 섞이지 않게 한다.
const list = window.PROJECTS || [];
const labs = window.LABS || [];
const slug = new URLSearchParams(location.search).get('p');
const LAB = labs.find(l => l.slug === slug);
const idx = Math.max(0, list.findIndex(p => p.slug === slug));
const P = LAB || list[idx];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nm = p => esc(p.title);
const li = items => items.map(t => `<li>${esc(t)}</li>`).join('');
// 흐림 처리한 이미지(blur)는 확대해도 보이는 것이 없으므로 누를 수 없게 그린다.
const fig = f => `<figure>${[].concat(f.src).map(src => f.blur ? `<div class="zoom still"><img src="${src}" alt="${esc(f.cap)}" loading="lazy"></div>` : `<button class="zoom" data-src="${src}" aria-label="${esc(f.cap)} 크게 보기"><img src="${src}" alt="${esc(f.cap)}" loading="lazy"></button>`).join('')}<figcaption>${esc(f.cap)}${f.blur ? '<span class="bl">내부 자료 · 흐림 처리</span>' : ''}</figcaption>${f.notes ? `<ul class="dash">${f.notes.map(n => typeof n === 'string' ? `<li>${esc(n)}</li>` : `<li><b>${esc(n.h)}</b>${esc(n.p)}</li>`).join('')}</ul>` : ''}</figure>`;

const BLOCK = {
  list: b => `<ul class="dash big">${li(b.items)}</ul>`,
  steps: b => `<ol class="steps">${b.items.map((s, i) => `<li><span class="mono">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></div></li>`).join('')}</ol>`,
  chips: b => `<div class="chips pad">${b.items.map(t => `<i>${esc(t)}</i>`).join('')}</div>`,
  flow: b => `<div class="flow3${b.plain ? ' plain' : ''}${b.cols.length === 4 ? ' c4' : ''}">${b.cols.map((c, i) => `<div><h3><span class="mono">${i + 1}</span>${esc(c.h)}</h3><ul class="dash">${li(c.items)}</ul></div>`).join('')}</div>`,
  compare: b => `<div class="cmp${b.small ? ' sm' : ''}">${b.items.map(c => `<div class="cmp-row"><p class="cmp-l">${esc(c.l)}</p><div class="cmp-b"><small class="mono">${esc(c.bn)}</small><b>${esc(c.before)}</b></div><span class="cmp-ar">→</span><div class="cmp-a"><small class="mono">${esc(c.an)}</small><b>${esc(c.after)}</b></div></div>`).join('')}</div>`,
  figures: b => `<div class="figs ${b.layout}${b.nobg ? ' nobg' : ''}${b.same ? ' same' : ''}"${b.ratio ? ` style="--ar:${b.ratio}"` : ''}>${b.items.map(fig).join('')}</div>`,
  results: b => `<div class="res2"><div><h3>정량 성과</h3><ul class="dash">${li(b.quant)}</ul></div><div><h3>정성 성과</h3><ul class="dash">${li(b.qual)}</ul></div></div>`,
  table: b => `<div class="tbl" style="--grid:${b.grid || `repeat(${b.head.length},1fr)`}"><div class="tbl-h mono">${b.head.map(h => `<span>${esc(h)}</span>`).join('')}</div>${b.rows.map(r => `<div class="tbl-r">${r.map((c, i) => `<span data-h="${esc(b.head[i])}">${esc(c)}</span>`).join('')}</div>`).join('')}</div>${b.note ? `<p class="code-note">${esc(b.note)}</p>` : ''}`,
  code: b => `<pre class="code mono"><code>${esc(b.code)}</code></pre>${b.note ? `<p class="code-note">${esc(b.note)}</p>` : ''}`,
  todo: b => `<p class="todo mono">${esc(b.text)}</p>`,
  link: b => `<p class="pad link"><a class="btn-line" href="${b.href}" target="_blank" rel="noopener">${esc(b.text)} ↗</a>${b.note ? `<small>${esc(b.note)}</small>` : ''}</p>`,
};

// Lab 사례 하단: 다른 일하는 방식 사례와, 이 방식을 실제로 쓴 프로젝트로 연결한다.
function labNav() {
  const other = labs[(labs.indexOf(P) + 1) % labs.length];
  const R = list.find(p => p.slug === P.related);
  if ((!other || other === P) && !R) return `
      <a class="panel" href="index.html#lab"><small class="mono">← 돌아가기</small><b>일하는 방식</b></a>`;
  return `
      ${other && other !== P ? `<a class="panel" href="work.html?p=${other.slug}"><small class="mono">← 다른 일하는 방식</small><b>${esc(other.title)}</b></a>` : '<span></span>'}
      ${R ? `<a class="panel" href="work.html?p=${R.slug}"><small class="mono">이 방식을 쓴 프로젝트 · ${R.no} →</small><b>${nm(R)}</b></a>` : ''}`;
}

// Lab 사례에서는 왼쪽 메뉴에서 Work 대신 Lab을 켜고, 상단 경로도 Lab으로 바꾼다.
function labChrome() {
  const nav = document.getElementById('nav');
  nav.querySelector('a[href="index.html#work"]').classList.remove('on', 'open');
  nav.querySelector('a[href="index.html#lab"]').classList.add('on');
  document.getElementById('sub').classList.add('fold');
  const bar = document.querySelector('.bar a[href="index.html#work"]');
  bar.href = 'index.html#lab'; bar.textContent = 'Lab';
}

function render() {
  document.title = `${P.title} — 지예은`;
  document.getElementById('crumb').textContent = LAB ? P.title : `${P.no} ${P.title}`;
  const dots = P.contrib ? '●'.repeat(P.contrib) + '○'.repeat(5 - P.contrib) : '';
  const prev = list[(idx - 1 + list.length) % list.length], next = list[(idx + 1) % list.length];

  document.getElementById('detail').innerHTML = `
    <header class="d-head">
      <p class="mono">${LAB ? 'Lab' : `#${P.no}`} · ${esc(P.type)} · ${esc(P.period)} <em class="st ${P.status === '완료' ? '' : 'run'}">${esc(P.status)}</em></p>
      <h1>${esc(P.title)}</h1>
      <p class="lead">${esc(P.summary)}</p>
    </header>
    <div class="d-top">
      <dl class="panel spec">
        ${P.company ? `<div><dt class="mono">회사</dt><dd>${esc(P.company)}</dd></div>` : ''}
        <div><dt class="mono">기간</dt><dd>${esc(P.period)}</dd></div>
        <div><dt class="mono">역할</dt><dd>${esc(P.role)}</dd></div>
        ${P.tools ? `<div><dt class="mono">${esc(P.toolsLabel || '만든 도구')}</dt><dd>${esc(P.tools)}</dd></div>` : ''}
        ${P.team ? `<div><dt class="mono">함께한 사람</dt><dd>${esc(P.team)}</dd></div>` : ''}
        ${dots ? `<div><dt class="mono">기여도</dt><dd class="dots">${dots}</dd></div>` : ''}
      </dl>
      ${P.kpis && P.kpis.length ? `<div class="d-kpis">${P.kpis.map((k, i) => `<div class="kpi${i ? '' : ' pt'}"><p class="v">${esc(k.v)}</p><p class="l">${esc(k.l)}</p></div>`).join('')}</div>` : ''}
    </div>
    ${P.blocks.map(b => b.type === 'phase' ? `<section class="phase"><span class="tag mono">${esc(b.tag)}</span><h2>${esc(b.title)}</h2>${b.p ? `<p>${esc(b.p)}</p>` : ''}</section>` : `<section class="blk${b.title ? '' : ' cont'}">${b.title ? `<div class="sh"><h2>${esc(b.title)}</h2></div>` : ''}<div class="panel${b.type === 'figures' || b.type === 'todo' ? ' bare' : ''}">${BLOCK[b.type](b)}</div></section>`).join('')}
    <nav class="pn">${LAB ? labNav() : `
      <a class="panel" href="work.html?p=${prev.slug}"><small class="mono">← 이전 · ${prev.no}</small><b>${nm(prev)}</b></a>
      <a class="panel" href="work.html?p=${next.slug}"><small class="mono">다음 · ${next.no} →</small><b>${nm(next)}</b></a>`}
    </nav>`;

  // 왼쪽 메뉴의 프로젝트 목록
  document.getElementById('sub').innerHTML = list.map(p =>
    `<a href="work.html?p=${p.slug}"${p === P ? ' class="on"' : ''}><span class="mono">${p.no}</span>${nm(p)}</a>`).join('');
}
if (P) { render(); if (LAB) labChrome(); }

// ── 휴대폰: 상단 Work 탭을 누르면 바 아래로 프로젝트 목록이 펼쳐진다 ──
// (PC는 왼쪽 메뉴에 목록이 늘 보이므로 이 동작은 화면이 좁을 때만 쓴다)
const workTab = document.querySelector('#nav a[href="index.html#work"]');
const mq = matchMedia('(max-width: 820px)');
const drop = document.createElement('div');
drop.id = 'msub';
drop.className = 'msub';
drop.hidden = true;
drop.innerHTML = list.map(p =>
  `<a href="work.html?p=${p.slug}"${p === P ? ' class="on" aria-current="page"' : ''}><span class="mono">${p.no}</span>${nm(p)}</a>`).join('') +
  '<a class="all" href="index.html#work">전체 목록 보기 →</a>';
document.body.appendChild(drop);
function setDrop(open) {
  drop.hidden = !open;
  workTab.classList.toggle('mopen', open);
  workTab.setAttribute('aria-expanded', open);
}
workTab.addEventListener('click', e => {
  if (!mq.matches) return;   // PC는 원래대로 첫 화면 Work 영역으로 이동
  e.preventDefault();
  setDrop(drop.hidden);
});
document.addEventListener('click', e => {
  if (!drop.hidden && !drop.contains(e.target) && !workTab.contains(e.target)) setDrop(false);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') setDrop(false); });
mq.addEventListener('change', () => setDrop(false));

// 이미지 크게 보기
const lb = document.getElementById('lb'), lbImg = lb.querySelector('img');
document.addEventListener('click', e => {
  const z = e.target.closest('button.zoom');
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

// ── 터치 화면에서도 PC처럼: 마우스를 올릴 수 없으니, 화면 가운데를 지나는 카드에 같은 효과를 준다 ──
function litOnScroll(selector) {
  if (!matchMedia('(hover: none)').matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('lit', e.isIntersecting));
  }, { rootMargin: '-45% 0px -45% 0px' });   // 화면 세로 가운데 10% 띠
  document.querySelectorAll(selector).forEach(el => io.observe(el));
}
litOnScroll('.pn a');
