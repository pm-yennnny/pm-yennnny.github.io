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

// ── 프로젝트 로그: 무엇을 어떤 역할로 했는지 경력 순서대로 한 줄씩 쌓인다 ──
// 성과 수치는 위쪽 카드와 대표 프로젝트에 이미 있으므로 여기서는 반복하지 않는다.
const LOG = [
  ['2016', '전용 플레이어 앱', 'PM · 스토어 출시'],
  ['2017', '신규 카테고리 서비스', '수익 모델 · 정책 수립'],
  ['2019', '쿠폰 서비스', '프로젝트 리드'],
  ['2020', '콘텐츠 파트너 플랫폼', 'PM · 외주 개발사 관리'],
  ['2021', '글로벌 런칭 TH·TW', '런칭 리드'],
  ['2022', '국내 서비스 리뉴얼', 'Agile 스쿼드 운영'],
  ['2023', '개인화 추천', 'PM · 기획'],
  ['2024', '자사몰 리뉴얼', 'PM · 30~40명 협업'],
  ['2024', '상품 CMS', 'PM · 기획'],
  ['2025', 'CRM 타겟팅 자동화', '연동 로직 설계'],
  ['2026', 'GEO 구조화 데이터', '데이터 설계 · 정책'],
  ['2026', '하이브리드 검색', '검색 설계 · 품질 검증'],
  ['2026', 'AI 에이전트', '에이전트 기획'],
];
onceVisible(document.getElementById('log'), log => {
  let i = 0;
  (function next() {
    log.querySelector('.cur')?.classList.remove('cur');
    const [y, name, res] = LOG[i++];
    const p = document.createElement('p');
    p.className = 'cur';
    p.innerHTML = `<span class="y">${y}</span> ${name} <span class="y">·</span> <b>${res}</b> `;
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
