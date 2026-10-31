(() => {
  const header = document.querySelector('header');
  const links = [...document.querySelectorAll('header nav a[data-section]')];
  const sections = links.map(link => document.getElementById(link.dataset.section)).filter(Boolean);
  function offset() { document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight + 24}px`); }
  function backdrop() { document.body.classList.toggle('has-scrolled', scrollY > 40); }
  backdrop();
  addEventListener('scroll', backdrop, {passive:true});
  offset();
  addEventListener('resize', offset);
  if (!sections.length) return;
  function markCurrent() {
    let active = sections[0];
    for (const section of sections) if (section.getBoundingClientRect().top <= header.offsetHeight + 70) active = section;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 5) active = sections.at(-1);
    links.forEach(link => {
      if (link.dataset.section === active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  links.forEach(link => link.addEventListener('click', event => {
    const target = document.getElementById(link.dataset.section);
    if (!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(null, '', `#${target.id}`);
    target.focus({preventScroll:true});
    target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }));
  addEventListener('scroll', markCurrent, {passive:true});
  addEventListener('hashchange', () => {
    const target = document.getElementById(location.hash.slice(1));
    if (target && sections.includes(target)) target.focus({preventScroll:true});
  });
  markCurrent();
})();
