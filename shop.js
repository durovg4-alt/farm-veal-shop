/* Общая логика магазина для всех вариантов дизайна: каталог, корзина, заказ в мессенджеры. */

// TODO: подставить реальные контакты магазина
const CFG = {
  tg: 'your_shop',        // t.me/<username>
  wa: '70000000000',      // wa.me/<номер без +>
  max: 'https://max.ru/', // ссылка на чат в MAX (текст заказа копируется в буфер)
  step: 0.5, min: 1,      // шаг и минимальный вес, кг
};

const PRODUCTS = [
  { id: 'yablochko', cat: 'Телятина', name: 'Яблочко', tag: 'Телятина', img: 'img/yablochko.jpg', price: 990,
    sub: 'Мякоть задней части',
    desc: 'Постная и особенно нежная мякоть с аккуратной текстурой. Один из самых удобных и востребованных отрубов.',
    uses: ['Запекание целым куском', 'Медальоны и быстрая обжарка', 'Тушение и томление', 'Холодные мясные закуски'],
    how: [{ t: 'Запечь целым куском', d: 'Обжарьте со всех сторон до корочки, доведите в духовке и дайте отдохнуть перед нарезкой.' }, { t: 'Медальоны', d: 'Нарежьте толстыми кусками поперёк волокон и быстро обжарьте на сильном огне.' }, { t: 'Тушение', d: 'Нежное мясо, ему хватает недолгого тушения с овощами или в сливочном соусе.' }, { t: 'Холодные закуски', d: 'Запеките или отварите кусок, остудите и нарежьте тонко для бутербродов и мясной тарелки.' }] },
  { id: 'lopatka', cat: 'Телятина', name: 'Лопатка', tag: 'Телятина · без кости', img: 'img/lopatka.jpg', price: 790,
    sub: 'Универсальный отруб',
    desc: 'Для повседневной домашней кухни: нежный, ароматный и удобный в приготовлении.',
    uses: ['Гуляш и рагу', 'Жаркое с картофелем', 'Тушение с овощами', 'Запекание крупным куском'],
    how: [{ t: 'Гуляш и рагу', d: 'Нарежьте кубиками, обжарьте и потушите с луком и томатами до мягкости.' }, { t: 'Жаркое с картофелем', d: 'Тушите кусочки вместе с картофелем и морковью в казане или утятнице.' }, { t: 'Тушение с овощами', d: 'Подойдёт любая сезонная зелень и овощи, соус получится насыщенным.' }, { t: 'Запекание куском', d: 'Заверните в фольгу с травами и запекайте, пока мясо не станет мягким.' }] },
  { id: 'shaya', cat: 'Телятина', name: 'Шея', tag: 'Телятина · без кости', img: 'img/shaya.jpg', price: 890,
    sub: 'Сочная и насыщенная',
    desc: 'Сочная часть с мягкой структурой, особенно хороша для медленного приготовления.',
    uses: ['Тушение и томление', 'Жаркое с овощами', 'Гуляш и мясо с подливой', 'Домашние котлеты и рубленые блюда'],
    how: [{ t: 'Томление', d: 'Долгое медленное приготовление раскрывает вкус и делает мясо мягким.' }, { t: 'Жаркое с овощами', d: 'Нарежьте крупно, обжарьте и тушите с корнеплодами.' }, { t: 'Гуляш с подливой', d: 'Мясо хорошо держит форму и даёт густую подливу к гарниру.' }, { t: 'Домашние котлеты', d: 'Пропустите через мясорубку, добавьте лук и специи, получатся сочные котлеты.' }] },
  { id: 'yazyk', cat: 'Деликатесы', name: 'Говяжий язык', tag: 'Говядина · деликатес', img: 'img/yazyk.jpg', price: 1290,
    sub: 'Нежная текстура, насыщенный вкус',
    desc: 'Деликатесный продукт с нежной текстурой и насыщенным вкусом. Выбор для домашних деликатесов и праздничного стола.',
    uses: ['Варка и подача как холодная закуска', 'Салаты с отварным языком', 'Заливное и праздничная подача', 'Подача с хреном или горчицей'],
    how: [{ t: 'Отварной, как закуска', d: 'Отварите до мягкости, снимите кожицу, остудите и нарежьте тонкими ломтиками.' }, { t: 'Салаты', d: 'Отварной язык хорош в тёплых и холодных салатах.' }, { t: 'Заливное', d: 'Праздничная подача: тонкие ломтики в прозрачном бульонном желе.' }, { t: 'С хреном или горчицей', d: 'Классическая подача к нарезке, ничего лишнего не нужно.' }] },
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';
const kg = n => String(n).replace('.', ',') + ' кг';
const byId = id => PRODUCTS.find(p => p.id === id);

let cart = {};
try { cart = JSON.parse(localStorage.getItem('cart') || '{}'); } catch (e) {}
cart = Object.fromEntries(Object.entries(cart).filter(([id]) => byId(id)));
let filter = 'Всё мясо';

const total = () => Object.entries(cart).reduce((s, [id, w]) => s + w * byId(id).price, 0);
const count = () => Object.keys(cart).length;

/* ---------- каталог ---------- */
function cardHTML(p, i) {
  return `<article class="card" data-reveal style="--d:${i * 90}ms" data-id="${p.id}">
    <button class="card__img" data-zoom="${p.id}" aria-label="Увеличить фото: ${p.name}">
      <img src="${p.img}" alt="${p.tag} — ${p.name}" loading="lazy"><i class="card__zoom">+</i>
    </button>
    <div class="card__body">
      <div class="card__top"><i class="card__n">0${i + 1}</i><span class="card__tag">${p.tag}</span></div>
      <h3 class="card__name">${p.name}</h3>
      <p class="card__sub">${p.sub}</p>
      <p class="card__desc">${p.desc}</p>
      <ul class="card__uses">${p.uses.map(u => `<li>${u}</li>`).join('')}</ul>
      <div class="card__foot">
        <div class="card__price"><b>${p.price.toLocaleString('ru-RU')}</b> ₽/кг</div>
        <span class="card__stock">Под заказ</span>
      </div>
      <div class="card__act" data-act="${p.id}"></div>
    </div>
  </article>`;
}

function renderCatalog() {
  const cats = ['Всё мясо', ...new Set(PRODUCTS.map(p => p.cat))];
  const f = $('#filters');
  if (f) f.innerHTML = cats.map(c => `<button class="chip${c === filter ? ' on' : ''}" data-filter="${c}">${c}</button>`).join('');
  const g = $('#grid');
  if (!g) return;
  g.innerHTML = PRODUCTS.filter(p => filter === 'Всё мясо' || p.cat === filter).map(cardHTML).join('');
  $$('[data-reveal]', g).forEach(observe);
  actSync();
}

function actHTML(id) {
  const w = cart[id];
  return w
    ? `<div class="step"><button data-dec="${id}" aria-label="Меньше">−</button><span>${kg(w)}</span><button data-inc="${id}" aria-label="Больше">+</button></div>`
    : `<button class="btn card__btn" data-add="${id}">Заказать</button>`;
}
const actSync = () => $$('[data-act]').forEach(el => el.innerHTML = actHTML(el.dataset.act));

/* ---------- корзина ---------- */
function mount() {
  document.body.insertAdjacentHTML('beforeend', `
  <div class="bar" id="bar"><button class="btn" data-open-cart><span>Заказать</span><em data-sum>0 ₽</em></button></div>
  <div class="drawer" id="drawer" aria-hidden="true">
    <div class="drawer__bg" data-close></div>
    <aside class="drawer__panel" role="dialog" aria-label="Ваш заказ">
      <header class="drawer__head"><h3>Ваш заказ</h3><button class="x" data-close aria-label="Закрыть">✕</button></header>
      <div class="drawer__list" id="dlist"></div>
      <footer class="drawer__foot">
        <div class="drawer__sum"><span>Итого примерно</span><b data-sum>0 ₽</b></div>
        <p class="note">Мясо весовое: итоговую сумму считаем по фактическому весу и согласуем с вами. Доставка по Москве.</p>
        <input id="fname" placeholder="Ваше имя" autocomplete="name">
        <textarea id="fnote" rows="2" placeholder="Адрес в Москве и пожелания по нарезке"></textarea>
        <div class="send">
          <button class="send__b send__tg" data-send="tg">Telegram</button>
          <button class="send__b send__wa" data-send="wa">WhatsApp</button>
          <button class="send__b send__mx" data-send="max">MAX</button>
        </div>
      </footer>
    </aside>
  </div>
  <div class="lb" id="lb" aria-hidden="true"><div class="lb__bg" data-close></div>
    <div class="lb__box" id="lbbox"></div></div>
  <div class="toast" id="toast"></div>`);
}

function sync() {
  try { localStorage.setItem('cart', JSON.stringify(cart)); } catch (e) {}
  $$('[data-count]').forEach(el => { el.textContent = count(); el.classList.toggle('has', count() > 0); });
  $$('[data-sum]').forEach(el => el.textContent = rub(total()));
  $('#bar em').hidden = !count();
  $$('[data-send]').forEach(b => b.disabled = !count());
  const l = $('#dlist');
  l.innerHTML = count() ? Object.entries(cart).map(([id, w]) => {
    const p = byId(id);
    return `<div class="line"><img src="${p.img}" alt=""><div class="line__t"><b>${p.name}</b><small>${p.price} ₽/кг · ${rub(w * p.price)}</small></div>
      <div class="step"><button data-dec="${id}" aria-label="Меньше">−</button><span>${kg(w)}</span><button data-inc="${id}" aria-label="Больше">+</button></div></div>`;
  }).join('') : '<p class="drawer__empty">Корзина пока пуста. Выберите мясо в каталоге.</p>';
  actSync();
}

function change(id, dir) {
  const w = (cart[id] || 0) + dir * CFG.step;
  if (dir > 0 && !cart[id]) cart[id] = CFG.min;
  else if (w < CFG.min) delete cart[id];
  else cart[id] = w;
  sync();
}

function fly(fromEl) {
  const to = $$('[data-open-cart]').find(e => e.offsetParent);
  if (!fromEl || !to || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const a = fromEl.getBoundingClientRect(), b = to.getBoundingClientRect();
  const d = document.createElement('div');
  d.className = 'fly';
  d.style.cssText = `left:${a.left + a.width / 2 - 24}px;top:${a.top + a.height / 2 - 24}px`;
  document.body.append(d);
  d.animate([{ transform: 'scale(1)', opacity: 1 },
    { transform: `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.3)`, opacity: .2 }],
    { duration: 700, easing: 'cubic-bezier(.5,-.2,.7,1)' }).onfinish = () => {
    d.remove(); to.classList.remove('bump'); void to.offsetWidth; to.classList.add('bump');
  };
}

function toast(t) {
  const el = $('#toast'); el.textContent = t; el.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 3200);
}

function orderText() {
  const lines = Object.entries(cart).map(([id, w]) => { const p = byId(id); return `• ${p.name} (${p.tag}) — ${kg(w)} × ${p.price} ₽ ≈ ${rub(w * p.price)}`; });
  const name = $('#fname').value.trim(), note = $('#fnote').value.trim();
  return `Здравствуйте! Хочу заказать:\n${lines.join('\n')}\nИтого примерно ${rub(total())} (окончательно по фактическому весу)` +
    (name ? `\nИмя: ${name}` : '') + (note ? `\nАдрес и пожелания: ${note}` : '');
}

function send(kind) {
  const t = orderText(), q = encodeURIComponent(t);
  if (kind === 'tg') window.open(`https://t.me/${CFG.tg}?text=${q}`, '_blank');
  if (kind === 'wa') window.open(`https://wa.me/${CFG.wa}?text=${q}`, '_blank');
  if (kind === 'max') {
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(
      () => toast('Текст заказа скопирован. Вставьте его в чат MAX'), () => toast('Скопируйте текст заказа вручную'));
    window.open(CFG.max, '_blank');
  }
}

/* ---------- окна ---------- */
const open = id => { const el = $('#' + id); el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock'); };
const closeAll = () => { $$('.drawer.open,.lb.open').forEach(e => { e.classList.remove('open'); e.setAttribute('aria-hidden', 'true'); }); document.body.classList.remove('lock', 'menu'); };

function zoom(id) {
  const p = byId(id);
  $('#lbbox').innerHTML = `<button class="x lb__x" data-close aria-label="Закрыть">✕</button>
    <img src="${p.img}" alt="${p.name}">
    <div class="lb__info"><span class="card__tag">${p.tag}</span><h3 class="card__name">${p.name}</h3><p class="card__sub">${p.sub}</p>
    <p>${p.desc}</p><p class="lb__h">Лучше всего подходит для</p>
    <ul class="uses">${p.uses.map(u => `<li>${u}</li>`).join('')}</ul>
    <div class="card__foot"><div class="card__price"><b>${p.price.toLocaleString('ru-RU')}</b> ₽/кг</div><span class="card__stock">Под заказ</span></div>
    <div class="card__act" data-act="${p.id}"></div></div>`;
  actSync(); open('lb');
}

/* ---------- анимации ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
  if (e.target.dataset.countTo) countUp(e.target);
}), { threshold: .15 });
const observe = el => io.observe(el);

function countUp(el) {
  const to = +el.dataset.countTo, t0 = performance.now();
  const tick = t => { const k = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

let ticking = false;
function onScroll() {
  document.body.classList.toggle('scrolled', scrollY > 24);
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    $$('[data-par]').forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.setProperty('--py', ((r.top + r.height / 2 - innerHeight / 2) * +el.dataset.par).toFixed(1) + 'px');
    });
  });
}

/* ---------- старт ---------- */
document.documentElement.classList.add('js');
$$('[data-link]').forEach(a => a.href = { tg: `https://t.me/${CFG.tg}`, wa: `https://wa.me/${CFG.wa}`, max: CFG.max }[a.dataset.link]);
mount(); renderCatalog(); sync(); onScroll();
$$('[data-reveal],[data-count-to]').forEach(observe);
addEventListener('scroll', onScroll, { passive: true });
addEventListener('keydown', e => e.key === 'Escape' && closeAll());

if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  document.addEventListener('pointermove', e => {
    const c = e.target.closest?.('.card__img');
    if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--rx', ((e.clientY - r.top) / r.height - .5) * -8 + 'deg'); c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg'); }
    document.documentElement.style.setProperty('--mx', e.clientX + 'px');
    document.documentElement.style.setProperty('--my', e.clientY + 'px');
  });
  document.addEventListener('pointerout', e => { const c = e.target.closest?.('.card__img'); if (c) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); } });
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-add],[data-inc],[data-dec],[data-open-cart],[data-close],[data-send],[data-zoom],[data-filter],[data-burger],.nav a');
  if (!t) return;
  const d = t.dataset;
  if (d.add) { change(d.add, 1); fly(t.closest('.card')?.querySelector('img') || t); }
  else if (d.inc) change(d.inc, 1);
  else if (d.dec) change(d.dec, -1);
  else if (t.matches('[data-open-cart]')) open('drawer');
  else if (t.matches('[data-close]')) closeAll();
  else if (d.send) send(d.send);
  else if (d.zoom) zoom(d.zoom);
  else if (d.filter) { filter = d.filter; renderCatalog(); }
  else if (t.matches('[data-burger]')) document.body.classList.toggle('menu');
  else document.body.classList.remove('menu');
});
