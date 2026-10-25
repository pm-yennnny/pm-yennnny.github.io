// "동작 줄이기"를 켠 사람에게도 숫자, 로그, 색 변화는 그대로 보여준다.
// 화면 요소의 위치가 움직이는 효과만 css에서 뺀다 (어지러움을 일으키는 것은 위치 이동이기 때문).

// 화면에 들어올 때 한 번만 실행한다.
function onceVisible(el, fn, threshold = 0.3) {
  if (!el) return;
  if (!('IntersectionObserver' in window)) return fn(el);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { io.disconnect(); fn(el); } });
  }, { threshold });
  io.observe(el);
}

// ── 수치 카운트업 ──
document.querySelectorAll('.v[data-n]').forEach(el => onceVisible(el, () => {
  const n = +el.dataset.n, dur = 1300, t0 = performance.now();
  (function tick(t) {
    const k = dur ? Math.min((t - t0) / dur, 1) : 1;
    el.textContent = el.dataset.p + Math.round(n * (1 - Math.pow(1 - k, 3))) + el.dataset.s;
    if (k < 1) requestAnimationFrame(tick);
  })(t0);
}));

// ── 층별 막대와 프로젝트 로그 ──
// 왼쪽: 서비스의 어느 층까지 설계했는지(13건 중 몇 건). 오른쪽: 프로젝트 로그.
// 층을 누르면 로그가 그 층을 설계한 프로젝트만 남기고, 설명을 "그 층에서 한 일"로 바꾼다.
// 맨 위 "전체"가 처음부터 선택되어 있어, 나머지 줄도 고를 수 있다는 것을 문구 없이 알린다.
// 성과 수치는 위쪽 카드와 대표 프로젝트에 이미 있으므로 여기서는 반복하지 않는다.
const LAYERS = [
  ['', '전체'],
  ['s', '고객이 보는 화면'],
  ['l', '서비스 로직'],
  ['d', '데이터 분석 · 연동'],
  ['b', '백오피스 · 정산'],
  ['p', '운영 정책 · 문서'],
];
// [연도, 프로젝트, 역할, { 층: 그 층에서 한 일 }] — 최신순
const LOG = [
  ['2026', 'QA 자동화 에이전트', '개인 과제 · 기획', { l: '자동 검증 흐름', d: '기획서 분석, 테스트 케이스 생성', p: '결함 등록 표준' }],
  ['2026', '유비쿼터스 언어 시스템', '용어 체계 · 검색 설계', { s: '용어 사전, 조직도·역할·권한 이력 화면', l: 'MCP 검색, OAuth 인증과 권한', d: '기능·화면·데이터·상태 관계 정의', p: '용어 기준' }],
  ['2026', 'AI 하이브리드 검색', '검색 설계 · 품질 검증', { s: '검색 화면, AI 추천순 정렬', l: '키워드 + 의미 검색 결합 기준', d: '검색 로그 설계', p: '검색 정책 가이드, 테스트 케이스' }],
  ['2026', 'GEO 검색 최적화', '데이터 설계 · 정책', { d: '구조화 데이터 설계와 매핑', p: '구조화 데이터 운영 정책' }],
  ['2026', '상품 상세 에디터 V2', 'PM · 기획', { s: '자사몰 · 외부몰 상세 노출', d: '재편집용 JSON + 노출용 HTML 저장', b: '에디터 V2, 이력과 복원', p: 'GEO 대응 작성 기준' }],
  ['2025', 'CRM 타겟팅 자동화', '연동 로직 설계', { l: '세그먼트와 타겟팅 조건', d: '내부 DB와 CRM 연동, 정합성', p: '정합성 정책, 전 구간 QA' }],
  ['2024', '상품 상세 에디터 V1', 'PM · 기획', { s: '상품 상세 페이지 반영 구조', d: '콘텐츠 데이터 정형화', b: '모듈형 에디터, 관리자 화면', p: '필수값 검증, 입력 가이드' }],
  ['2024', '자사몰 리뉴얼 (PC/MO)', 'PM · 30~40명 협업', { s: 'PC · Mobile 화면, 정보 구조', l: '개인화 화면과 프로모션 정책', d: 'GA · CRM 데이터로 이탈 구간 분석', b: '백오피스 정책', p: '운영 매뉴얼, 테스트 케이스' }],
  ['2023', 'AI 상품 추천', 'PM · 기획', { s: '메인과 상품 상세의 추천 영역', l: '하이브리드 추천 로직', d: '추천 데이터셋 구성', b: '불용어 · 동의어 등록 화면', p: '기능 문서화' }],
  ['2022', '국내 서비스 리뉴얼', 'Agile 스쿼드 운영', { s: '프론트 화면 설계', l: '참여-보상 구조', d: 'GA · 로그 데이터로 행동 분석', b: '보상 · 디지털 굿즈 백오피스', p: '전사 운영 정책, 매뉴얼' }],
  ['2021', '글로벌 런칭 TH·TW', '런칭 리드', { s: '국가별 화면, 다국어', d: '해외 결제 연동, 지표 대시보드', b: '국가별 통합 어드민', p: '글로벌 통합 운영 정책서' }],
  ['2020', '콘텐츠 파트너 플랫폼', 'PM · 외주 개발사 관리', { s: '작가 등록 · 온보딩 화면', b: '등록 · 승인 · 정산 자동화', p: '온보딩과 운영 정책' }],
  ['2019', '쿠폰 서비스', '프로젝트 리드', { s: '쿠폰 화면, 결제 경로', l: '세그먼트별 자동 발송', d: '쿠폰 지표 대시보드', b: '쿠폰 생성 · 발행 · 정산', p: '쿠폰 정책 표준화' }],
  ['2017', '신규 카테고리 서비스', '수익 모델 · 정책 수립', { s: 'PC · Mobile · Tablet 화면', d: '고객 성향 · 판매량 데이터 분석', b: '매출 통계 · 정산', p: '수익 모델과 이용 정책' }],
  ['2016', '전용 플레이어 앱', 'PM · 스토어 출시', { s: '앱 화면과 사용 경험', d: '행동 데이터 수집, 웹 연동', p: '운영 정책, 스토어 배포' }],
  ['2012', 'LG전자 모바일 SW 테스트', 'QA · 테스트 설계', { l: 'SW 테스트 케이스 분석·설계', p: '산출물 검수, QA 리포트' }],
];
const layersBox = document.getElementById('layers');
const logBox = document.getElementById('log');
const logHead = document.getElementById('log-head');
let curLayer = null;   // 선택한 층 (null이면 전체)
let typing = false;    // 처음 한 줄씩 쌓이는 중인지

const logLine = (row, text) => `<span class="y">${row[0]}</span> ${row[1]} <span class="y">·</span> <b>${text}</b> `;

// 로그 전체를 한 번에 그린다 (층을 고르거나 해제했을 때)
function renderLog() {
  typing = false;
  const rows = curLayer ? LOG.filter(r => r[3][curLayer]) : LOG;
  logBox.innerHTML = rows.map(r => `<p>${logLine(r, curLayer ? r[3][curLayer] : r[2])}</p>`).join('');
  logBox.lastElementChild?.classList.add('cur');
}
function setLayer(key) {
  curLayer = key || null;
  layersBox.querySelectorAll('.lyr').forEach(b => {
    const on = (b.dataset.k || null) === curLayer;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
  });
  logHead.textContent = LAYERS.find(l => (l[0] || null) === curLayer)[1];
  renderLog();
}
if (layersBox) {
  layersBox.innerHTML = LAYERS.map(([k, name]) => {
    const n = k ? LOG.filter(r => r[3][k]).length : LOG.length;
    return `<button class="lyr${k ? '' : ' on'}" data-k="${k}" aria-pressed="${!k}"><span>${name}</span><span class="tr"><i data-w="${Math.round(n / LOG.length * 100)}"></i></span><span class="n">${n}건</span><span class="ch" aria-hidden="true">›</span></button>`;
  }).join('');
  // 고른 층을 다시 누르면 전체로 돌아간다.
  layersBox.addEventListener('click', e => {
    const b = e.target.closest('.lyr');
    if (b) setLayer(curLayer === (b.dataset.k || null) ? null : b.dataset.k);
  });
  onceVisible(layersBox, box => {
    box.querySelectorAll('.tr i').forEach(i => { i.style.width = i.dataset.w + '%'; });
  });
}
// 처음에는 로그가 한 줄씩 쌓인다. 그 사이에 층을 누르면 바로 전체를 그린다.
onceVisible(logBox, () => {
  if (curLayer) return;
  typing = true;
  let i = 0;
  (function next() {
    if (!typing) return;
    logBox.querySelector('.cur')?.classList.remove('cur');
    const p = document.createElement('p');
    p.className = 'cur';
    p.innerHTML = logLine(LOG[i], LOG[i][2]);
    logBox.append(p);
    if (++i < LOG.length) setTimeout(next, 600);
    else typing = false;
  })();
});

// ── 경력: 왼쪽 회사를 누르면 오른쪽에 그 회사의 맡은 일과 성과를 보여 준다 ──
const crr = document.querySelector('.crr');
if (crr) {
  const head = document.getElementById('crr-head');
  // 오른쪽 이름표: 근무 기간만 (회사명과 재직 기간은 왼쪽 목록에 있으므로 뺀다)
  const showHead = b => { head.textContent = b.dataset.h; };
  showHead(crr.querySelector('.crr-co.on'));
  crr.addEventListener('click', e => {
    const b = e.target.closest('.crr-co');
    if (!b) return;
    crr.querySelectorAll('.crr-co').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    crr.querySelectorAll('.crr-d').forEach(d => { d.hidden = d.dataset.c !== b.dataset.c; });
    showHead(b);
  });
}

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

// ── 메뉴의 Work·Lab을 누르면 그 아래에 상세 페이지 목록이 열린다 ──
// 스크롤만 할 때는 열리지 않는다. 다시 누르거나 그 영역을 벗어나면 닫힌다.
// 상세 페이지가 있는 영역(Work, Lab)만 목록이 있고, Career·Voice처럼 상세가 없는 영역에는 없다.
const accs = [];
function makeAcc(linkId, boxId, sectionId, items) {
  const link = document.getElementById(linkId), box = document.getElementById(boxId);
  if (!link || !box || !items.length) return;
  const acc = { sectionId, open: false, entered: false };
  acc.set = open => {
    acc.open = open; acc.entered = false;
    box.classList.toggle('open', open);
    link.classList.toggle('open', open);
    link.setAttribute('aria-expanded', open);
  };
  box.innerHTML = items.map(p =>
    `<a href="work.html?p=${p.slug}">${p.title}</a>`).join('');
  link.addEventListener('click', () => {   // 영역으로 이동하는 기본 동작은 그대로 둔다
    accs.forEach(a => { if (a !== acc && a.open) a.set(false); });
    acc.set(!acc.open);
  });
  accs.push(acc);
}
makeAcc('nav-work', 'sub', 'work', window.PROJECTS || []);
makeAcc('nav-lab', 'sub-lab', 'lab', window.LABS || []);

// ── 현재 보고 있는 섹션을 메뉴와 상단 경로에 표시 ──
const links = [...document.querySelectorAll('#nav a')];
const crumb = document.getElementById('crumb');
const sections = [...document.querySelectorAll('section[id]')];
// 메뉴를 눌러 이동하는 동안에는 지나가는 섹션마다 메뉴가 검게 깜빡이지 않도록,
// 누른 메뉴만 켜 두었다가 목적지에 도착하면(또는 손으로 스크롤을 시작하면) 원래대로 돌아간다.
let jumpTo = null, jumpTimer;
function release() { jumpTo = null; clearTimeout(jumpTimer); spy(); }
function hold() { clearTimeout(jumpTimer); jumpTimer = setTimeout(release, 1000); }  // 도착을 못 알아챈 경우의 안전장치
links.forEach(a => a.addEventListener('click', () => {
  const href = a.getAttribute('href') || '';
  const target = href.startsWith('#') && sections.find(s => s.id === href.slice(1));
  if (!target) return;
  jumpTo = target;
  mark(target);
  hold();
  // 바로 이동하는 화면(휴대폰)에서는 도착한 영역이 빈 채로 보였다가 서서히 나타나지 않도록 미리 보여 준다.
  if (getComputedStyle(document.documentElement).scrollBehavior !== 'smooth') {
    const els = [...target.querySelectorAll('.rv:not(.in)')];
    els.forEach(el => { el.style.transition = 'none'; el.classList.add('in'); });
    requestAnimationFrame(() => requestAnimationFrame(() => els.forEach(el => { el.style.transition = ''; })));
  }
}));
['touchstart', 'wheel'].forEach(t => addEventListener(t, () => { if (jumpTo) release(); }, { passive: true }));
function mark(cur) {
  links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur.id));
  crumb.textContent = cur.dataset.name;
}
function current() {
  const line = innerHeight * 0.35;
  let cur = sections[0];
  for (const s of sections) if (s.getBoundingClientRect().top <= line) cur = s;
  // 맨 아래에 닿으면 마지막 섹션으로 본다.
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = sections[sections.length - 1];
  return cur;
}
function spy() {
  const cur = current();
  if (jumpTo) {
    if (cur !== jumpTo) return hold();
    jumpTo = null; clearTimeout(jumpTimer);
  }
  mark(cur);
  // 목록을 열어 둔 채 그 영역을 벗어나면 저절로 닫는다.
  accs.forEach(a => {
    if (!a.open) return;
    if (cur.id === a.sectionId) a.entered = true;
    else if (a.entered) a.set(false);
  });
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

// ── 터치 화면에서도 PC처럼: 마우스를 올릴 수 없으니, 화면 가운데를 지나는 카드에 같은 효과를 준다 ──
function litOnScroll(selector) {
  if (!matchMedia('(hover: none)').matches || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('lit', e.isIntersecting));
  }, { rootMargin: '-45% 0px -45% 0px' });   // 화면 세로 가운데 10% 띠
  document.querySelectorAll(selector).forEach(el => io.observe(el));
}
litOnScroll('.kpi, .wk, a.build');  // '다루는 것' 박스는 스크롤 효과 없음
