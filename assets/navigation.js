(() => {
  const header = document.querySelector('header');
  if (!header) return;
  const nav = header.querySelector('nav');
  const links = [...nav.querySelectorAll('a[data-section]')];
  const sections = links.map(a => document.getElementById(a.dataset.section)).filter(Boolean);
  const mobile = matchMedia('(max-width:680px)');
  const toggle = document.createElement('button');
  toggle.className = 'section-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'mobile-sections');
  const label = document.createElement('span');
  const caret = document.createElement('span');
  caret.textContent = '⌄'; caret.setAttribute('aria-hidden', 'true');
  toggle.append(label, caret);
  const panel = document.createElement('div');
  panel.id = 'mobile-sections'; panel.className = 'section-options'; panel.hidden = true;
  const options = links.map(link => { const a = link.cloneNode(true); panel.append(a); return a; });
  nav.prepend(toggle); nav.append(panel); header.classList.add('mobile-nav-ready');
  const allLinks = [...links, ...options];
  const nameFor = id => links.find(a => a.dataset.section === id)?.textContent.trim();
  function setLabel(text) { label.textContent = text; toggle.setAttribute('aria-label', `${text}. Choose section`); }
  function close(restore = false) {
    panel.hidden = true; toggle.setAttribute('aria-expanded', 'false');
    if (restore) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
  });
  toggle.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); panel.hidden = false; toggle.setAttribute('aria-expanded', 'true'); options[0].focus(); }
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(true); } });
  document.addEventListener('click', event => { if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) close(); });
  nav.addEventListener('focusout', event => { if (!nav.contains(event.relatedTarget)) close(); });
  function offset() { document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight + 24}px`); }
  function markCurrent() {
    if (!sections.length) return;
    let active = sections[0];
    for (const section of sections) if (section.getBoundingClientRect().top <= header.offsetHeight + 70) active = section;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 5) active = sections.at(-1);
    allLinks.forEach(a => a.dataset.section === active.id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
    setLabel(nameFor(active.id));
  }
  function backdrop() { document.body.classList.toggle('has-scrolled', scrollY > 40); }
  function scrollToSection(target, smooth = false) {
    target.focus({preventScroll:true});
    target.scrollIntoView({behavior:smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant',block:'start'});
    markCurrent();
  }
  allLinks.forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    close();
    const target = document.getElementById(link.dataset.section);
    if (!target || !sections.includes(target)) return;
    event.preventDefault();
    if (location.hash !== `#${target.id}`) history.pushState(null, '', `#${target.id}`);
    scrollToSection(target, true);
  }));
  function followHash() {
    close(); offset();
    const target = document.getElementById(location.hash.slice(1));
    if (target && sections.includes(target)) scrollToSection(target);
    else markCurrent();
  }
  if (!sections.length) {
    const file = location.pathname.split('/').pop();
    const personal = ['minecraft.html','discord.html','reference-verifier.html','cellar.html'];
    const isDetail = location.pathname.includes('/projects/');
    const id = file === 'projects.html' || isDetail && personal.includes(file) ? 'projects' : file === 'research.html' || isDetail ? 'research' : null;
    setLabel(id ? nameFor(id) : 'Sections');
    options.forEach(a => a.removeAttribute('aria-current'));
    if (file === 'publications.html') nav.querySelector('.nav-publications')?.setAttribute('aria-current','page');
  }
  let pending = false;
  addEventListener('scroll', () => { backdrop(); if (!pending) { pending = true; requestAnimationFrame(() => { markCurrent(); pending = false; }); } }, {passive:true});
  addEventListener('resize', () => { close(); offset(); markCurrent(); });
  mobile.addEventListener('change', () => close());
  addEventListener('hashchange', followHash);
  addEventListener('popstate', followHash);
  addEventListener('pageshow', () => { offset(); markCurrent(); });
  addEventListener('load', followHash, {once:true});
  new ResizeObserver(offset).observe(header);
  // Native document scrolling only: long cards and short viewports stay in flow.
  const stacks = [...document.querySelectorAll('#research.home-section,#projects.home-section')];
  function sizeStacks() {
    stacks.forEach(section => {
      section.classList.remove('mobile-stack');
      if (!mobile.matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const heading = section.querySelector(':scope > h2');
      const cards = [...section.querySelectorAll('.home-research > article,.personal-grid > article')];
      const top = header.offsetHeight + heading.offsetHeight + 44;
      const space = Math.min(440, innerHeight - top - 28);
      if (space < 260 || cards.some(card => card.scrollHeight + 24 > space)) return;
      section.style.setProperty('--stack-top', `${top}px`);
      section.style.setProperty('--stack-space', `${space}px`);
      section.classList.add('mobile-stack');
      if (cards.some(card => card.scrollHeight > space + 2)) section.classList.remove('mobile-stack');
    });
  }
  addEventListener('resize', sizeStacks);
  addEventListener('load', sizeStacks, {once:true});
  document.fonts?.ready.then(() => { sizeStacks(); markCurrent(); });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', sizeStacks);
  sizeStacks();
  backdrop(); offset(); markCurrent();
  if (sections.length) requestAnimationFrame(followHash);
})();
