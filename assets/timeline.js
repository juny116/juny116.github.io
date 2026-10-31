(() => {
  const viewport = document.querySelector('.history-viewport');
  const hint = document.querySelector('.drag-hint');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const previous = document.querySelector('#history-prev');
  const next = document.querySelector('#history-next');
  const cat = document.querySelector('.scroll-cat');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!viewport) return;
  let stop, lastX = 24, frame = 0;
  const max = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  function moveCat(progress) {
    if (!cat || reduced.matches) return;
    const x = 16 + progress * Math.max(0, innerWidth - 100);
    cat.classList.toggle('facing-left', x < lastX);
    if (Math.abs(x - lastX) > .1) {
      cat.classList.add('walking');
      clearTimeout(stop); stop = setTimeout(() => cat.classList.remove('walking'), 170);
    }
    cat.style.transform = `translateX(${x}px)`;
    lastX = x;
  }
  function syncTimeline() {
    previous.disabled = viewport.scrollLeft <= 1;
    next.disabled = viewport.scrollLeft >= max() - 1;
  }
  function scrollPage() {
    frame = 0;
    const distance = document.documentElement.scrollHeight - innerHeight;
    moveCat(distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0);
  }
  previous.addEventListener('click', () => viewport.scrollBy({left:-300,behavior:reduced.matches?'instant':'smooth'}));
  next.addEventListener('click', () => viewport.scrollBy({left:300,behavior:reduced.matches?'instant':'smooth'}));
  viewport.addEventListener('scroll', () => { syncTimeline(); }, {passive:true});
  viewport.addEventListener('keydown', event => {
    if (event.target !== viewport) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); viewport.scrollBy({left:event.key === 'ArrowRight'?300:-300,behavior:reduced.matches?'instant':'smooth'});
    }
  });
  let drag = null, dragged = false;
  function hideHint() { hint?.classList.remove('visible'); }
  function positionHint(event) {
    if (!hint || !finePointer.matches || event.pointerType !== 'mouse') { hideHint(); return; }
    hint.style.left = `${Math.max(8, Math.min(innerWidth - 100, event.clientX + 16))}px`;
    hint.style.top = `${Math.max(8, Math.min(innerHeight - 40, event.clientY + 18))}px`;
    hint.textContent = drag && dragged ? 'Dragging ↔' : 'Drag ↔';
    hint.classList.add('visible');
  }
  viewport.addEventListener('pointermove', positionHint);
  viewport.addEventListener('pointerleave', hideHint);
  viewport.addEventListener('dragstart', event => event.preventDefault());
  viewport.addEventListener('pointerdown', event => {
    dragged = false;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = {x:event.clientX, left:viewport.scrollLeft};
  });
  addEventListener('pointermove', event => {
    if (!drag) return;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 5) dragged = true;
    if (dragged) {
      viewport.classList.add('dragging'); event.preventDefault();
      viewport.scrollLeft = drag.left - delta; positionHint(event);
    }
  });
  function endDrag() { drag = null; viewport.classList.remove('dragging'); hideHint(); }
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', () => { endDrag(); dragged = false; });
  addEventListener('blur', () => { endDrag(); dragged = false; });
  viewport.addEventListener('click', event => {
    if (dragged && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); }
    dragged = false;
  }, true);
  finePointer.addEventListener('change', hideHint);
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(scrollPage); }, {passive:true});
  addEventListener('resize', () => { syncTimeline(); scrollPage(); });
  reduced.addEventListener('change', () => { cat?.classList.remove('walking'); scrollPage(); });
  syncTimeline(); scrollPage();
})();
