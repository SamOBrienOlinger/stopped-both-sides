import {storyCharacterById} from './story-cast.mjs?v=role-cast-20261126b';
import {characterArtwork,characterFor} from './characters.mjs?v=final-touches-20261125';
import {roleLabels} from './catalog.mjs?v=site-repairs-20261125';
import {createDialogController} from '../accessibility/dialog.mjs?v=learning-language-20261120';
import {normaliseLanguage} from '../locales/languages.mjs';
import {translateText} from '../locales/translate.mjs?v=practice-consistency-20261126';

const roleDescriptions={
 public:'This is the member of the public in this encounter. Explore what they can ask, the choices available and the rights that apply.',
 garda:'This is the Garda member in this encounter. Explore how legal powers, evidence, communication and fairness should inform decisions.'
};
export function installSceneCaptionLayout(root){
 if(!root||typeof root.querySelectorAll!=='function')return()=>{};
 const doc=root.ownerDocument,win=doc.defaultView,watched=new Set();
 let frame=0,disposed=false,dialog=null,modalController=null,returnFocus=null;
 const schedule=()=>{if(!disposed&&!frame)frame=win.requestAnimationFrame(update);};
 const resize=typeof win.ResizeObserver==='function'?new win.ResizeObserver(schedule):null;

 function update(){
  frame=0;
  if(disposed)return;
  const tracks=[...root.querySelectorAll('[data-scene-label-track]')],live=new Set();
  for(const track of tracks){
   live.add(track);
   for(const button of track.querySelectorAll('[data-scene-label-role]'))live.add(button);
  }
  for(const target of watched)if(!live.has(target)){
   resize?.unobserve(target);watched.delete(target);
  }
  for(const target of live)if(!watched.has(target)){
   resize?.observe(target);watched.add(target);
  }
  for(const track of tracks){
   if(!track.getBoundingClientRect().width)continue;
   if(track.dataset.labelLayout!=='positioned')track.dataset.labelLayout='positioned';
   const buttons=[...track.querySelectorAll('[data-scene-label-role]')]
    .map(element=>({element,box:element.getBoundingClientRect()}))
    .sort((a,b)=>a.box.left-b.box.left);
   const gap=Math.max(8,parseFloat(win.getComputedStyle(track).fontSize)*.5||8);
   const placed=[];
   let bottom=0;
   for(const item of buttons){
    let top=10;
    for(const prior of placed){
     const overlap=item.box.left<prior.box.right+gap&&item.box.right+gap>prior.box.left;
     if(overlap)top=Math.max(top,prior.top+prior.box.height+gap);
    }
    top=Math.ceil(top);
    const cssTop=top+'px';
    if(item.element.style.getPropertyValue('--scene-label-top')!==cssTop)
     item.element.style.setProperty('--scene-label-top',cssTop);
    placed.push({...item,top});
    bottom=Math.max(bottom,top+item.box.height);
   }
   const height=Math.ceil(bottom+14)+'px';
   if(track.style.minHeight!==height)track.style.minHeight=height;
  }
 }

 function ensureDialog(){
  if(dialog)return dialog;
  dialog=doc.createElement('dialog');
  dialog.className='scene-character-dialog';dialog.id='scene-character-dialog';
  dialog.setAttribute('aria-labelledby','scene-character-dialog-name');
  dialog.setAttribute('aria-describedby','scene-character-dialog-summary');
  dialog.innerHTML='<div class="scene-profile-shell"><div class="scene-profile-top"><div class="scene-profile-portrait" aria-hidden="true"><img alt=""></div><div class="scene-profile-info"><h2 id="scene-character-dialog-name" data-no-translate></h2><p class="scene-profile-role"></p></div></div><p class="scene-profile-body" id="scene-character-dialog-summary"></p><p class="scene-profile-setting"></p><div class="scene-profile-actions"><button type="button" class="scene-profile-change">Change character</button><button type="button" class="scene-profile-close" autofocus>Close character details</button></div></div>';
  doc.body.append(dialog);
  modalController=createDialogController(dialog,()=>{
   const trigger=returnFocus;returnFocus=null;
   if(trigger?.isConnected)trigger.focus({preventScroll:true});
  },'.scene-profile-close');
  dialog.querySelector('.scene-profile-change').addEventListener('click',()=>{
   const trigger=returnFocus;returnFocus=null;
   modalController.close();
   if(trigger?.isConnected)trigger.dispatchEvent(new win.Event('scene-character-change',{bubbles:true}));
  });
  dialog.querySelector('.scene-profile-close').addEventListener('click',()=>modalController.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)modalController.close();});
  return dialog;
 }

 function onCaptionClick(event){
  const button=event.target.closest?.('button[data-scene-character-id][data-scene-label-role]');
  if(!button||!root.contains(button))return;
  const role=button.dataset.sceneLabelRole,character=storyCharacterById(button.dataset.sceneCharacterId)||characterFor(role,button.dataset.sceneCharacterId);
  if(!character)return;
  const modal=ensureDialog(),art=characterArtwork(character),image=modal.querySelector('.scene-profile-portrait img');
  const langTag=doc.documentElement.lang||'en-IE',lang=normaliseLanguage(langTag);
  const t=text=>translateText(text,lang);
  modal.lang=langTag;
  modal.setAttribute('data-role-tone',role);
  const name=modal.querySelector('#scene-character-dialog-name');
  name.textContent=character.descriptive?t(character.name):character.name;
  name.lang=character.descriptive?langTag:'en-IE';
  name.dir=character.descriptive?'auto':'ltr';
  modal.querySelector('.scene-profile-role').textContent=t(button.dataset.sceneProfileRole||roleLabels[role]);
  const change=modal.querySelector('.scene-profile-change');
  change.hidden=button.hasAttribute('data-story-fixed');
  change.textContent=t('Change character');
  modal.querySelector('.scene-profile-close').textContent=t('Close character details');
  modal.querySelector('.scene-profile-body').textContent=t(button.dataset.sceneProfileDescription||roleDescriptions[role]);
  const place=button.closest('.scene-panel')?.querySelector('[data-scene-place]')?.dataset.locationLabel;
  modal.querySelector('.scene-profile-setting').textContent=t('Scene:')+' '+t(place||'A shared encounter');
  image.src=art.src;image.width=art.width;image.height=art.height;image.style.cssText=art.style;
  returnFocus=button;
  modalController.open();
 }
 function onRouteChange(){modalController?.close();}
 root.addEventListener('click',onCaptionClick);
 const content=new win.MutationObserver(schedule);
 content.observe(root,{childList:true,subtree:true,characterData:true});
 const preferenceKey=()=>[doc.documentElement.className,doc.documentElement.dir,doc.documentElement.lang,
  doc.documentElement.style.getPropertyValue('--reading-size'),doc.documentElement.style.fontSize].join('|');
 let lastPreferences=preferenceKey();
 const preferences=new win.MutationObserver(()=>{
  const next=preferenceKey();
  if(next!==lastPreferences){lastPreferences=next;schedule();}
 });
 preferences.observe(doc.documentElement,{attributes:true,attributeFilter:['class','style','dir','lang']});
 win.addEventListener('resize',schedule,{passive:true});
 win.addEventListener('hashchange',onRouteChange);
 doc.fonts?.addEventListener?.('loadingdone',schedule);
 doc.fonts?.ready.then(schedule);
 schedule();
 return()=>{
  disposed=true;
  if(frame)win.cancelAnimationFrame(frame);
  resize?.disconnect();content.disconnect();preferences.disconnect();watched.clear();
  win.removeEventListener('resize',schedule);
  win.removeEventListener('hashchange',onRouteChange);
  root.removeEventListener('click',onCaptionClick);
  doc.fonts?.removeEventListener?.('loadingdone',schedule);
  modalController?.close();dialog?.remove();
 };
}
if(typeof document!=='undefined'){
 const start=()=>installSceneCaptionLayout(document.querySelector('#main'));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
}
