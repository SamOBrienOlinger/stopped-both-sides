export function renderScene(state,options={}){
 const m=sceneModel(state,options),compact=!!options.compact;
 const outdoorSplit=m.separate&&!!(backgroundImage(m.place)||backgroundImage(m.otherPlace));
 const actor=(role,anchor)=>{
  const c=characterFor(role,state.cast[role]);
  const art=sceneCharacterArtwork(c);
  return `<div class="scene-actor scene-actor--${role}" data-scene-character="${c.id}" data-scene-role="${role}" style="${sceneAnchorStyle(anchor)}" aria-hidden="true"><div class="scene-sprite"><img src="${art.src}" width="${art.width}" height="${art.height}" alt="" decoding="async" ${compact?'loading="lazy"':''} style="${art.style}"></div></div>`;
 };
 const location=(place,members,side='')=>{
  const art=backgroundImage(place);
  checkSceneArtwork(place,art?.name||null);
  const anchors=Object.fromEntries(members.map(role=>[role,sceneActorLayout(place,role,{solo:members.length===1,wide:outdoorSplit})]));
  const names=members.map(role=>`<span class="scene-character-label" data-role-tone="${role}" data-scene-label-role="${role}" style="${sceneAnchorStyle(anchors[role])}"><strong><span data-no-translate>${esc(characterFor(role,state.cast[role]).name)}</span></strong><span>${roleLabels[role]}</span></span>`).join('');
  // Each location owns its captions. When panels stack, its names travel with it.
  return `<figure class="scene-panel"><div class="scene-location ${members.length===1?'scene-location--solo':''} ${side}" data-scene-place="${place}"${art?` data-approved-art="${art.name}"`:''} aria-hidden="true"><img class="scene-backdrop" src="${asset(place)}"${art?` srcset="${art.srcset}" sizes="(max-width: 660px) calc(100vw - 3rem), 640px"`:''} alt="" width="${art?1600:680}" height="${art?900:380}" decoding="async" ${compact?'loading="lazy"':''}>${members.map(role=>actor(role,anchors[role])).join('')}</div><figcaption class="scene-cast-names" data-scene-label-track data-label-layout="stacked">${names}</figcaption></figure>`;
 };
 const panels=m.separate?location(m.place,['public'],'scene-location--public')+location(m.otherPlace,['garda'],'scene-location--garda'):location(m.place,roles);
 // Do NOT hide the stage from assistive technology: it now contains captions.
 // Decorative images and sprites remain hidden at .scene-location level.
 return `<figure class="encounter-scene ${compact?'encounter-scene--compact':''}" data-caption-anchors data-scene-id="${esc(state.id+'/'+m.nodeId)}" data-scene-phase="${m.phase}" data-scene-mode="${m.mode}">${m.label?`<div class="scene-setting">${esc(m.label)}</div>`:''}<div class="scene-stage ${m.separate?'scene-stage--separate':''} ${outdoorSplit?'scene-stage--outdoor-split':''}">${panels}</div></figure>`;
}
