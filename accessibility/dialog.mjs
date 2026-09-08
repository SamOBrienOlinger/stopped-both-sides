// Prefer native modal behaviour; retain keyboard access on older browsers.
export function createDialogController(dialog,onClose){
 if(!dialog)return {open(){},close(){}};
 const native=typeof dialog?.showModal==='function'&&typeof dialog?.close==='function';
 let backdrop=null,hidden=[];
 const focusable=()=>[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')]
  .filter(element=>element.getClientRects().length);
 const initialFocus=()=>dialog.querySelector('#reading-title')?.focus();
 const markOpen=value=>document.documentElement?.classList.toggle('dialog-open',value);
 function finish(){
  markOpen(false);
  if(!native){
   backdrop?.remove();backdrop=null;
   for(const [element,value] of hidden){if(value===null)element.removeAttribute('aria-hidden');else element.setAttribute('aria-hidden',value);}
   hidden=[];
  }
  onClose();
 }
 function close(){
  if(native){if(dialog.open)dialog.close();}
  else if(dialog?.hasAttribute('open')){dialog.removeAttribute('open');finish();}
 }
 function open(){
  if(!dialog)return;
  if(native){if(!dialog.open)dialog.showModal();}
  else{
   if(dialog.hasAttribute('open')){initialFocus();return;}
   dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
   dialog.setAttribute('data-dialog-fallback','');dialog.setAttribute('open','');
   backdrop=document.createElement('div');backdrop.className='dialog-backdrop';backdrop.setAttribute('aria-hidden','true');
   document.body.insertBefore(backdrop,dialog);
   initialFocus();
   hidden=[...document.body.children].filter(element=>element!==dialog&&element!==backdrop&&element.tagName!=='SCRIPT')
    .map(element=>[element,element.getAttribute('aria-hidden')]);
   for(const [element] of hidden)element.setAttribute('aria-hidden','true');
  }
  markOpen(true);initialFocus();
 }
 if(native)dialog.addEventListener('close',finish);
 // Explicit Tab wrapping also prevents focus leaving a native dialog for browser chrome.
 dialog.addEventListener('keydown',event=>{
   if(!dialog.open&&!dialog.hasAttribute('open'))return;
   if(event.key==='Escape'&&!native){event.preventDefault();close();return;}
   if(event.key!=='Tab')return;
   const elements=focusable(),first=elements[0],last=elements[elements.length-1];
   if(!first){event.preventDefault();initialFocus();return;}
   if(event.shiftKey&&(document.activeElement===first||!elements.includes(document.activeElement))){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 if(!native){
  document.addEventListener('focusin',event=>{
   if(dialog?.hasAttribute('open')&&!dialog.contains(event.target))initialFocus();
  });
 }
 return {open,close};
}
