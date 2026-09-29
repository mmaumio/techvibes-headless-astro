// Homepage interactions from the design: hero parallax, delivery stepper,
// AI workflow tabs and the count-up numbers.

const flows = [
  { title: 'AI Agents', steps: [['Trigger', 'Customer enquiry arrives'], ['AI', 'Agent reads order history and policies'], ['Action', 'Answers, or routes to your team'], ['Outcome', 'Resolved and logged in your CRM']] },
  { title: 'Workflow Automation', steps: [['Trigger', 'New order placed in your store'], ['Sync', 'Stock and accounting updated'], ['Action', 'Fulfilment team notified'], ['Outcome', 'Customer kept informed automatically']] },
  { title: 'AI-Powered eCommerce', steps: [['Trigger', 'Shopper searches in their own words'], ['AI', 'Catalogue matched by meaning'], ['Action', 'Personalised recommendations shown'], ['Outcome', 'Faster route to checkout']] },
  { title: 'Business Intelligence', steps: [['Source', 'Sales, stock and marketing data'], ['Prepare', 'Consolidated and cleaned'], ['AI', 'Trends and anomalies summarised'], ['Outcome', 'Clear insight report for the team']] },
];

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = (sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<HTMLElement>(sel));
const q = (sel: string, root: ParentNode = document) => root.querySelector<HTMLElement>(sel);

/* Hero parallax */
const glow = q('[data-parallax]');
if (glow && !reduce) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      glow.style.transform = `translateY(${window.scrollY * 0.25}px)`;
      ticking = false;
    });
  }, { passive: true });
}

/* Delivery stepper: Business -> Technology -> AI -> Automation -> Growth */
const stages = $$('[data-stage]');
const rail = q('[data-rail]');
function renderStep(step: number) {
  stages.forEach((row, i) => {
    const on = i === step;
    const done = i < step;
    row.style.background = on ? '#F0F7F6' : 'transparent';
    const dot = q('[data-stage-dot]', row);
    const num = q('[data-stage-num]', row);
    if (dot) {
      dot.style.background = on || done ? (i < 2 ? '#1B9C85' : i < 4 ? '#159FA8' : '#2A74CE') : '#FFFFFF';
      dot.style.borderColor = on || done ? 'transparent' : '#C9D4D7';
    }
    if (num) num.style.color = on ? '#137565' : '#8A99A2';
  });
  if (rail) rail.style.height = `calc(${(step / 4) * 100}% - ${(step / 4) * 44}px)`;
}
if (stages.length) {
  let step = reduce ? 4 : 0;
  renderStep(step);
  if (!reduce) setInterval(() => renderStep((step = (step + 1) % 5)), 1700);
}

/* AI workflow tabs */
const tabs = $$('[data-ai-tab]');
const rows = $$('[data-flow]');
const aiTitle = q('[data-ai-title]');
let ai = 0;
let aiStep = reduce ? 4 : 0;

function renderTabs() {
  tabs.forEach((tab, i) => {
    const sel = i === ai;
    tab.setAttribute('aria-selected', String(sel));
    tab.tabIndex = sel ? 0 : -1;
    tab.style.background = sel ? 'rgba(27,156,133,.12)' : 'rgba(255,255,255,.02)';
    tab.style.borderColor = sel ? '#1B9C85' : '#22384A';
    const num = q('[data-tab-num]', tab);
    const desc = q('[data-tab-desc]', tab);
    if (num) num.style.color = sel ? '#8FE0D0' : '#6E8594';
    if (desc) desc.style.color = sel ? '#D3E0E6' : '#93A6B1';
  });
  if (aiTitle) aiTitle.textContent = flows[ai].title;
}

function renderFlow() {
  rows.forEach((row, i) => {
    const [kind, text] = flows[ai].steps[i];
    const lit = aiStep >= 4 ? true : i <= aiStep;
    const cur = i === aiStep;
    const node = q('[data-flow-node]', row);
    const line = q('[data-flow-line]', row);
    const card = q('[data-flow-card]', row);
    const kindEl = q('[data-flow-kind]', row);
    const textEl = q('[data-flow-text]', row);
    if (node) {
      node.style.background = lit ? (i === 3 ? 'linear-gradient(135deg,#1B9C85,#2A74CE)' : '#123A3E') : 'transparent';
      node.style.color = lit ? '#FFFFFF' : '#6E8594';
      node.style.borderColor = lit ? (i === 3 ? 'transparent' : '#1B9C85') : '#2A4152';
    }
    if (line) line.style.background = i === 3 ? 'transparent' : i < aiStep ? '#1B9C85' : '#22384A';
    if (card) {
      card.style.background = cur ? 'rgba(27,156,133,.14)' : 'rgba(255,255,255,.03)';
      card.style.borderColor = cur ? '#1B9C85' : '#22384A';
    }
    if (kindEl) { kindEl.textContent = kind; kindEl.style.color = lit ? '#8FE0D0' : '#6E8594'; }
    if (textEl) { textEl.textContent = text; textEl.style.color = lit ? '#FFFFFF' : '#93A6B1'; }
  });
}

if (tabs.length) {
  const select = (i: number, focus = false) => {
    ai = i;
    aiStep = reduce ? 4 : 0;
    renderTabs();
    renderFlow();
    if (focus) tabs[i].focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select((i + tabs.length - 1) % tabs.length, true); }
    });
  });
  renderTabs();
  renderFlow();
  if (!reduce) setInterval(() => { aiStep = (aiStep + 1) % 5; renderFlow(); }, 1300);
}

/* Count-up numbers (the final values are already in the HTML) */
const counters = $$('[data-count]');
const fmt = (el: HTMLElement, k: number) => {
  const target = Number(el.dataset.count);
  switch (el.dataset.format) {
    case 'int-plus': return Math.round(target * k).toLocaleString('en-GB') + '+';
    case 'dec2': return (target * k).toFixed(2);
    case 'plus': return Math.round(target * k) + '+';
    default: return String(Math.round(target * k));
  }
};
if (counters.length && !reduce && 'IntersectionObserver' in window) {
  const section = counters[0].closest('section');
  if (section && section.getBoundingClientRect().top > window.innerHeight) {
    counters.forEach((el) => (el.textContent = fmt(el, 0)));
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / 1400);
        const k = 1 - Math.pow(1 - p, 3);
        counters.forEach((el) => (el.textContent = fmt(el, k)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    io.observe(section);
  }
}
