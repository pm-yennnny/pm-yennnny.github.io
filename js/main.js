const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// 화면에 들어올 때 한 번만 실행한다.
function onceVisible(el, fn, threshold = 0.3) {
  if (!el) return;
  if (calm || !('IntersectionObserver' in window)) return fn(el);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { io.disconnect(); fn(el); } });
  }, { threshold });
  io.observe(el);
}

// ── 수치 카운트업 ──
document.querySelectorAll('.v[data-n]').forEach(el => onceVisible(el, () => {
  const n = +el.dataset.n, dur = calm ? 0 : 1300, t0 = performance.now();
  (function tick(t) {
    const k = dur ? Math.min((t - t0) / dur, 1) : 1;
    el.textContent = el.dataset.p + Math.round(n * (1 - Math.pow(1 - k, 3))) + el.dataset.s;
    if (k < 1) requestAnimationFrame(tick);
  })(t0);
}));

// ── 기록 막대 채우기 ──
onceVisible(document.getElementById('bars'), box => {
  box.querySelectorAll('.tr i').forEach(i => { i.style.width = i.dataset.w + '%'; });
});

// ── 전환 로그: 경력 순서대로 한 줄씩 쌓인다 ──
const LOG = [
  ['2016', '전용 플레이어 앱', '결제 전환율 +5%'],
  ['2017', '신규 카테고리 서비스', '매출 300%'],
  ['2019', '쿠폰 발송 자동화', '매출 4억'],
  ['2020', '파트너 정산 자동화', '운영비 −5%'],
  ['2021', '글로벌 앱 런칭 TH·TW', '회원 20만'],
  ['2023', '개인화 추천', '매출 +270%'],
  ['2024', '자사몰 리뉴얼', 'CVR 2배'],
  ['2024', 'CMS 표준화', '공수 −95%'],
  ['2025', 'CRM 타겟팅 자동화', '발송 −80%'],
  ['2026', 'GEO 구조화 데이터', '유입 +174%'],
  ['2026', '하이브리드 검색', '검수 −70% 예상'],
  ['2026', 'AI 에이전트', '진행 중'],
];
onceVisible(document.getElementById('log'), log => {
  let i = 0;
  (function next() {
    log.querySelector('.cur')?.classList.remove('cur');
    const [y, name, res] = LOG[i++];
    const p = document.createElement('p');
    p.className = 'cur';
    p.innerHTML = `<span class="y">${y}</span> ${name} → <b>${res}</b> `;
    log.append(p);
    if (i < LOG.length) calm ? next() : setTimeout(next, 600);
  })();
});

// ── Lab: 손글씨 숫자 그림 (7×7 점으로 그린 3) ──
const DIGIT = ['0111110', '0000011', '0000011', '0011110', '0000011', '0000011', '0111110'];
const px = document.getElementById('px');
if (px) px.innerHTML = DIGIT.join('').split('').map(c => `<i${c === '1' ? ' class="f"' : ''}></i>`).join('');

// ── 메일 주소 복사 ──
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

// ── 현재 보고 있는 섹션을 메뉴와 상단 경로에 표시 ──
const links = [...document.querySelectorAll('#nav a')];
const crumb = document.getElementById('crumb');
const sections = [...document.querySelectorAll('section[id]')];
function spy() {
  const line = innerHeight * 0.35;
  let cur = sections[0];
  for (const s of sections) if (s.getBoundingClientRect().top <= line) cur = s;
  // 맨 아래에 닿으면 마지막 섹션으로 본다.
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = sections[sections.length - 1];
  links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur.id));
  crumb.textContent = cur.dataset.name;
}
addEventListener('scroll', spy, { passive: true });
addEventListener('resize', spy);
spy();

// ── 섹션 등장 모션 ──
document.querySelectorAll('.sh, .panel, .kpi, .box').forEach(el => {
  if (el.closest('#overview') && !el.closest('.two')) return; // 첫 화면은 바로 보인다
  el.classList.add('rv');
  onceVisible(el, () => el.classList.add('in'), 0.12);
});
