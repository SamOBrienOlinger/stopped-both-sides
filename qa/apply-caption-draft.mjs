import fs from 'node:fs';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>{fs.mkdirSync(p.slice(0,p.lastIndexOf('/'))||'.',{recursive:true});fs.writeFileSync(p,s);};
const source=read('encounters/scenes.mjs');
const blob=crypto.createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex');
if(blob!=='61a8d60940bd84ff3327ad3724532c0e96955f6d')throw Error('Refusing to apply draft to an unreviewed scene renderer: '+blob);
const version='caption-anchors-1';
const files={
'encounters/scene-layout.mjs':String.raw`/** Coordinates are physical panel percentages. x is the frame centre. */
const outdoor = (artwork, publicX, gardaX) => Object.freeze({
  artwork, width: 28, bottom: 6,
  centres: Object.freeze({ public: publicX, garda: gardaX })
});
const indoor = () => Object.freeze({
  artwork: null, width: 32, bottom: 5,
  centres: Object.freeze({ public: 29, garda: 71 })
});
export const SCENE_LAYOUTS = Object.freeze({
  street: outdoor('suburban-street', 34, 50),
  'bus-stop': outdoor('bus-stop', 24, 42),
  square: outdoor('quayside', 38, 56),
  station: indoor(), 'advice-room': indoor(), 'meeting-room': indoor()
});
export function sceneActorLayout(place, role, { solo = false, wide = false } = {}) {
  const layout = SCENE_LAYOUTS[place];
  if (!layout) throw new RangeError('Missing scene layout: '+place);
  if (role !== 'public' && role !== 'garda') throw new RangeError('Unknown scene role: '+role);
  const singleIndoor = solo && layout.artwork === null;
  const x = singleIndoor ? 50 : layout.centres[role];
  const width = singleIndoor ? (wide ? 32 : 68) : layout.width;
  const bottom = singleIndoor ? (wide ? 6 : 7) : layout.bottom;
  return Object.freeze({x, width, bottom, labelSpace: 2 * Math.min(x, 100 - x)});
}
export function sceneAnchorStyle({ x, width, bottom, labelSpace }) {
  return '--scene-x:'+x+'%;--scene-width:'+width+'%;--scene-bottom:'+bottom+'%;--scene-label-space:'+labelSpace+'%;';
}
export function checkSceneArtwork(place, artworkName = null) {
  const layout = SCENE_LAYOUTS[place];
  if (!layout || layout.artwork !== artworkName) throw new Error('Review artwork and character anchors for '+place+': '+artworkName);
}
`,
'encounters/scene-labels.css':String.raw`/* Load AFTER approved-backgrounds.css. Image and caption share panel width. */
.encounter-scene[data-caption-anchors] .scene-panel {
  display: block; min-width: 0; margin: 0; padding: 0; border: 0;
  background: var(--paper, #fff);
}
.encounter-scene[data-caption-anchors]
.scene-stage--outdoor-split > .scene-panel > .scene-location { aspect-ratio: 16 / 9; }
.encounter-scene[data-caption-anchors]
.scene-location > .scene-actor[data-scene-role] {
  left: var(--scene-x); right: auto; bottom: var(--scene-bottom);
  width: var(--scene-width); transform: translateX(-50%);
}
.encounter-scene[data-caption-anchors] .scene-stage,
.encounter-scene[data-caption-anchors] .scene-location { direction: ltr; }
.encounter-scene[data-caption-anchors]
.scene-panel > figcaption.scene-cast-names {
  display: grid; grid-template-columns: minmax(0, 1fr); align-items: start;
  position: relative; box-sizing: border-box; width: 100%; margin: 0;
  padding: .65rem 0 .8rem; gap: 0; direction: ltr;
}
.encounter-scene[data-caption-anchors]
.scene-cast-names > .scene-character-label {
  grid-column: 1; grid-row: auto; justify-self: start; align-self: start;
  position: relative; left: var(--scene-x); transform: translateX(-50%);
  display: flex; flex-direction: column; box-sizing: border-box;
  width: max-content; max-width: min(13rem, calc(var(--scene-label-space) - 1rem));
  min-width: 0; padding: .15rem .35rem; margin: 0; gap: .15rem;
  text-align: center; white-space: normal; overflow-wrap: anywhere;
  color: var(--tone-deep, var(--deep)); animation: none; transition: none;
}
.encounter-scene[data-caption-anchors]
.scene-cast-names[data-label-layout="inline"] > .scene-character-label { grid-row: 1; }
.encounter-scene[data-caption-anchors]
.scene-cast-names[data-label-layout="stacked"] > .scene-character-label + .scene-character-label { margin-block-start: .25rem; }
[dir="rtl"] .encounter-scene[data-caption-anchors] .scene-character-label { direction: rtl; }
@media (forced-colors: active) {
  .encounter-scene[data-caption-anchors] .scene-panel,
  .encounter-scene[data-caption-anchors] .scene-character-label { background: Canvas; color: CanvasText; }
}
`,
'encounters/scene-labels.mjs':String.raw`export function installSceneCaptionLayout(root) {
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
`
};
const replacement=String.raw`export function renderScene(state,options={}){
 const m=sceneModel(state,options),compact=!!options.compact;
 const outdoorSplit=m.separate&&!!(backgroundImage(m.place)||backgroundImage(m.otherPlace));
 const actor=(role,anchor)=>{
  const c=characterFor(role,state.cast[role]);
  const art=sceneCharacterArtwork(c);
  return '<div class="scene-actor scene-actor--'+role+'" data-scene-character="'+c.id+'" data-scene-role="'+role+'" style="'+sceneAnchorStyle(anchor)+'" aria-hidden="true"><div class="scene-sprite"><img src="'+art.src+'" width="'+art.width+'" height="'+art.height+'" alt="" decoding="async" '+(compact?'loading="lazy"':'')+' style="'+art.style+'"></div></div>';
 };
 const location=(place,members,side='')=>{
  const art=backgroundImage(place);
  checkSceneArtwork(place,art?.name||null);
  const anchors=Object.fromEntries(members.map(role=>[role,sceneActorLayout(place,role,{solo:members.length===1,wide:outdoorSplit})]));
  const names=members.map(role=>'<span class="scene-character-label" data-role-tone="'+role+'" data-scene-label-role="'+role+'" style="'+sceneAnchorStyle(anchors[role])+'"><strong><span data-no-translate>'+esc(characterFor(role,state.cast[role]).name)+'</span></strong><span>'+roleLabels[role]+'</span></span>').join('');
  return '<figure class="scene-panel"><div class="scene-location '+(members.length===1?'scene-location--solo':'')+' '+side+'" data-scene-place="'+place+'"'+(art?' data-approved-art="'+art.name+'"':'')+' aria-hidden="true"><img class="scene-backdrop" src="'+asset(place)+'"'+(art?' srcset="'+art.srcset+'" sizes="(max-width: 660px) calc(100vw - 3rem), 640px"':'')+' alt="" width="'+(art?1600:680)+'" height="'+(art?900:380)+'" decoding="async" '+(compact?'loading="lazy"':'')+'>'+members.map(role=>actor(role,anchors[role])).join('')+'</div><figcaption class="scene-cast-names" data-scene-label-track data-label-layout="stacked">'+names+'</figcaption></figure>';
 };
 const panels=m.separate?location(m.place,['public'],'scene-location--public')+location(m.otherPlace,['garda'],'scene-location--garda'):location(m.place,roles);
 return '<figure class="encounter-scene '+(compact?'encounter-scene--compact':'')+'" data-caption-anchors data-scene-id="'+esc(state.id+'/'+m.nodeId)+'" data-scene-phase="'+m.phase+'" data-scene-mode="'+m.mode+'">'+(m.label?'<div class="scene-setting">'+esc(m.label)+'</div>':'')+'<div class="scene-stage '+(m.separate?'scene-stage--separate':'')+' '+(outdoorSplit?'scene-stage--outdoor-split':'')+'">'+panels+'</div></figure>';
}
`;
const marker='export function renderScene(state,options={}){';
if(source.split(marker).length!==2)throw Error('Renderer marker mismatch');
files['encounters/scenes.mjs']="import {sceneActorLayout,sceneAnchorStyle,checkSceneArtwork} from './scene-layout.mjs?v="+version+"';\n"+source.slice(0,source.indexOf(marker))+replacement;
function replaceOne(text,re,replacement,path){let n=0;const value=text.replace(re,(...a)=>{n++;return replacement(...a);});if(n!==1)throw Error('Expected one import in '+path+', found '+n);return value;}
for(const [path,re] of [
 ['encounters/ui.mjs',/(['"])(\.\/scenes\.mjs)(?:\?[^'"]*)?\1/g],
 ['app.mjs',/(['"])((?:\.\/|\.\.\/)encounters\/ui\.mjs)(?:\?[^'"]*)?\1/g],
 ['garda/app.mjs',/(['"])((?:\.\/|\.\.\/)encounters\/ui\.mjs)(?:\?[^'"]*)?\1/g]
]) files[path]=replaceOne(read(path),re,(_,q,p)=>q+p+'?v='+version+q,path);
for(const [path,relative] of [['index.html','./'],['garda/index.html','../']]){
 let text=read(path);
 if(text.includes('scene-labels.css')||text.split('</head>').length!==2)throw Error('HTML already patched: '+path);
 text=text.replace('</head>','<link rel="stylesheet" href="'+relative+'encounters/scene-labels.css?v='+version+'">\n<script type="module" src="'+relative+'encounters/scene-labels.mjs?v='+version+'"></script>\n</head>');
 files[path]=replaceOne(text,/(src=['"]\.\/app\.mjs)(?:\?[^'"]*)?(['"])/g,(_,a,b)=>a+'?v='+version+b,path);
}
for(const [path,content] of Object.entries(files))write(path,content);
write('sweep-results/applied-draft.json',JSON.stringify({base:'93e543adb3837c0a31dca053aaaf1e40fb435f36',reviewedRendererBlob:blob,version,files:Object.fromEntries(Object.entries(files).map(([p,c])=>[p,crypto.createHash('sha256').update(c).digest('hex')]))},null,2));
console.log('Supplied caption algorithm applied locally to the runner checkout. No commit, push or deployment.');
