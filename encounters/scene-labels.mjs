export function installSceneCaptionLayout(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return () => {};
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const watched = new Set();
  let frame = 0;
  let disposed = false;
  const schedule = () => { if (!disposed && !frame) frame = win.requestAnimationFrame(update); };
  const resize = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(schedule) : null;
  function update() {
    frame = 0;
    if (disposed) return;
    const tracks = [...root.querySelectorAll('[data-scene-label-track]')];
    const live = new Set();
    for (const track of tracks) {
      live.add(track);
      for (const label of track.querySelectorAll('[data-scene-label-role]')) live.add(label);
    }
    for (const target of watched) {
      if (!live.has(target)) { resize?.unobserve(target); watched.delete(target); }
    }
    for (const target of live) {
      if (!watched.has(target)) { resize?.observe(target); watched.add(target); }
    }
    const changes = [];
    for (const track of tracks) {
      if (!track.getBoundingClientRect().width) continue;
      const boxes = [...track.querySelectorAll('[data-scene-label-role]')]
        .map(label => label.getBoundingClientRect()).sort((a, b) => a.left - b.left);
      const gap = Math.max(8, parseFloat(win.getComputedStyle(track).fontSize) * .5);
      const fits = boxes.every((box, index) => index === 0 || boxes[index - 1].right + gap <= box.left);
      const layout = fits ? 'inline' : 'stacked';
      if (track.dataset.labelLayout !== layout) changes.push([track, layout]);
    }
    for (const [track, layout] of changes) track.dataset.labelLayout = layout;
  }
  const content = new win.MutationObserver(schedule);
  content.observe(root, { childList: true, subtree: true, characterData: true });
  const preferenceKey = () => [doc.documentElement.className,doc.documentElement.dir,doc.documentElement.lang,
    doc.documentElement.style.getPropertyValue('--reading-size'),doc.documentElement.style.fontSize].join('|');
  let lastPreferences = preferenceKey();
  const preferences = new win.MutationObserver(() => {
    const next = preferenceKey();
    if (next !== lastPreferences) { lastPreferences = next; schedule(); }
  });
  preferences.observe(doc.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'dir', 'lang'] });
  win.addEventListener('resize', schedule, { passive: true });
  doc.fonts?.addEventListener?.('loadingdone', schedule);
  doc.fonts?.ready.then(schedule);
  schedule();
  return () => {
    disposed = true;
    if (frame) win.cancelAnimationFrame(frame);
    resize?.disconnect(); content.disconnect(); preferences.disconnect(); watched.clear();
    win.removeEventListener('resize', schedule);
    doc.fonts?.removeEventListener?.('loadingdone', schedule);
  };
}
if (typeof document !== 'undefined') {
  const start = () => installSceneCaptionLayout(document.querySelector('#main'));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}
