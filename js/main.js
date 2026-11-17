(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  $('#yr').textContent = new Date().getFullYear();

  // Theme toggle (remembered per device)
  const root = document.documentElement;
  try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
  $('#themeBtn').onclick = () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  };

  // Mobile drawer
  const drawer = $('#drawer'), burger = $('#burger');
  const setDrawer = on => { drawer.classList.toggle('open', on); burger.setAttribute('aria-expanded', on); burger.textContent = on ? '✕' : '☰'; };
  burger.onclick = () => setDrawer(!drawer.classList.contains('open'));
  $$('a', drawer).forEach(a => a.onclick = () => setDrawer(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });

  // Highlight current section in nav
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('a', drawer).forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  $$('main section').forEach(s => io.observe(s));

  // Project filter
  $$('.chip').forEach(c => c.onclick = () => {
    $$('.chip').forEach(x => x.classList.toggle('active', x === c));
    $$('.project').forEach(p => p.hidden = c.dataset.f !== 'all' && !p.dataset.cat.split(' ').includes(c.dataset.f));
  });

  // Modal (project details + PDF viewer)
  const modal = $('#modal'), body = $('#mBody'), title = $('#mTitle');
  const openModal = (t, node) => { title.textContent = t; body.replaceChildren(node); modal.showModal(); };
  const closeModal = () => { modal.close(); body.replaceChildren(); };
  $('#mClose').onclick = closeModal;
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  modal.addEventListener('cancel', () => body.replaceChildren());
  $$('.project').forEach(p => {
    const show = () => {
      const d = document.createElement('div'); d.className = 'mp';
      const img = document.createElement('img'); img.src = p.dataset.img; img.alt = p.dataset.title; img.onerror = () => img.remove();
      const txt = document.createElement('p'); txt.textContent = p.dataset.desc;
      d.append(img, txt); openModal(p.dataset.title, d);
    };
    p.onclick = show;
    p.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } };
  });
  $$('.preview').forEach(b => b.onclick = () => {
    if (navigator.pdfViewerEnabled === false || /Android/i.test(navigator.userAgent)) { window.open(b.dataset.src, '_blank', 'noopener'); return; }
    const f = document.createElement('iframe'); f.src = b.dataset.src; f.title = b.dataset.title;
    openModal(b.dataset.title, f);
  });

  // PWA install prompt
  let deferred;
  const btn = $('#installBtn');
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; btn.hidden = false; });
  btn.onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; btn.hidden = true; };
  window.addEventListener('appinstalled', () => { btn.hidden = true; });

  // Essays
  $$('.essay').forEach(el => {
    const show = () => { const d = document.createElement('div'); d.className = 'essay-body'; d.append($('#' + el.dataset.t).content.cloneNode(true)); openModal(el.dataset.title, d); };
    el.onclick = show; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } };
  });

  // Contact (only shows channels that are filled in js/config.js)
  const cfg = window.SITE || {}, list = $('#contactLinks'), form = $('#contactForm');
  const add = (label, href) => { const li = document.createElement('li'), a = document.createElement('a'); a.href = href; a.textContent = label; a.rel = 'noopener'; li.append(a); list.prepend(li); };
  if (cfg.linkedin) add('LinkedIn', cfg.linkedin);
  if (cfg.github) add('GitHub', cfg.github);
  if (cfg.phone) add('Call ' + cfg.phone, 'tel:' + cfg.phone);
  if (cfg.whatsapp) add('WhatsApp', 'https://wa.me/' + cfg.whatsapp.replace(/\D/g, ''));
  if (cfg.email) {
    add(cfg.email, 'mailto:' + cfg.email); form.hidden = false;
    form.addEventListener('submit', e => {
      e.preventDefault(); const f = new FormData(form);
      location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent('Portfolio message from ' + f.get('name')) + '&body=' + encodeURIComponent(f.get('message') + '\n\nReply to: ' + f.get('email'));
    });
  }
  if (cfg.email || cfg.phone) {
    const li = document.createElement('li'), b = document.createElement('button'); b.className = 'btn btn-ghost sm'; b.textContent = 'Save contact (vCard)';
    b.onclick = () => {
      const v = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + cfg.name, 'N:Mongare;Kevin Nyambega;;;', 'TITLE:' + cfg.title, cfg.phone ? 'TEL;TYPE=CELL:' + cfg.phone : '', cfg.email ? 'EMAIL:' + cfg.email : '', 'ADR:;;;;;;Kenya', 'END:VCARD'].filter(Boolean).join('\r\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([v], { type: 'text/vcard' })); a.download = 'Kevin-Mongare.vcf'; a.click();
    };
    li.append(b); list.append(li);
  }
  if (!cfg.email) $('#contactGrid').style.gridTemplateColumns = '1fr';

  // Service worker
  if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
