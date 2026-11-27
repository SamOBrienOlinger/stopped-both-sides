import {test,expect} from '@playwright/test';

const editions=[['./','public'],['garda/','garda']];
const englishTagline='One situation. Two perspectives.';

async function ready(page,language,view){
 await expect(page.locator('#loading,.error')).toHaveCount(0);
 await expect(page.locator('html')).toHaveAttribute('lang',language==='en'?'en-IE':language);
 await expect(page.locator(view==='home'?'.reference-landing':'.simple-setup')).toBeVisible();
 const translated=page.locator(view==='home'?'#perspectives-title':'.play-modes a strong').first();
 const english=view==='home'?englishTagline:'Explore both perspectives';
 if(language==='en')await expect(translated).toHaveText(english);
 else await expect(translated).not.toHaveText(english);
 const images=page.locator(view==='home'?'.reference-landing img':'.setup-character img');
 // The lower perspective cards can be below the viewport. Load their real
 // artwork before measuring it instead of treating an empty image as a pass.
 await images.evaluateAll(nodes=>nodes.forEach(image=>{image.loading='eager';}));
 await expect.poll(()=>images.evaluateAll(nodes=>nodes.length>0&&nodes.every(image=>
  image.complete&&image.naturalWidth>0&&image.naturalHeight>0))).toBe(true);
 await page.evaluate(()=>document.fonts.ready);
}

async function resize(page,width,size){
 await page.setViewportSize({width,height:844});
 await page.evaluate(async size=>{
  document.documentElement.style.setProperty('--reading-size',size+'%');
  window.scrollTo({top:0,left:0,behavior:'instant'});
  await document.fonts.ready;
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 },size);
 await expect(page.locator('html')).toHaveCSS('font-size',size===200?'32px':'16px');
}

// Inspect text and portrait frames rather than the intentionally oversized
// sprite sheets inside them. No content is required to fit one screen at 200%.
function mobileLayout(view){
 const errors=[],tolerance=2,root=document.documentElement;
 const box=element=>element.getBoundingClientRect();
 const visible=element=>{
  for(let current=element;current;current=current.parentElement){
   const style=getComputedStyle(current);
   if(current.hidden||current.inert||style.display==='none'||style.visibility==='hidden'||
    current.matches('.sr-only,.visually-hidden'))return false;
   if(current.matches('details:not([open])')){
    const summary=[...current.children].find(child=>child.tagName==='SUMMARY');
    if(!summary?.contains(element))return false;
   }
  }
  const bounds=box(element);
  return element.getClientRects().length>0&&bounds.width>0&&bounds.height>0;
 };
 const inside=(inner,outer)=>inner.left>=outer.left-tolerance&&inner.right<=outer.right+tolerance&&
  inner.top>=outer.top-tolerance&&inner.bottom<=outer.bottom+tolerance;
 const overlaps=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>tolerance&&
  Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>tolerance;
 const readable=(element,label)=>{
  if(!element||!visible(element)){errors.push(label+': missing text');return;}
  const bounds=box(element),walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
  let count=0;
  for(let node=walker.nextNode();node;node=walker.nextNode()){
   const start=node.textContent.search(/\S/);
   if(start<0||!visible(node.parentElement))continue;
   const range=document.createRange();
   range.setStart(node,start);range.setEnd(node,node.textContent.trimEnd().length);
   for(const rect of range.getClientRects())if(rect.width>0&&rect.height>0){
    count++;
    if(!inside(rect,bounds))errors.push(label+': text leaves its label');
   }
  }
  if(!count)errors.push(label+': empty label');
 };
 const control=(element,label)=>{
  if(!visible(element))return;
  const bounds=box(element);
  if(bounds.width<43.5||bounds.height<43.5)errors.push(label+': target smaller than 44px');
  if(bounds.left<-tolerance||bounds.right>root.clientWidth+tolerance)errors.push(label+': outside page width');
  readable(element,label);
 };
 if(root.scrollWidth>root.clientWidth+tolerance)errors.push('horizontal page overflow');
 if(view==='home'){
  const tagline=document.querySelector('#perspectives-title');
  const characters=document.querySelector('.hero-characters');
  readable(tagline,'home tagline');
  if(!characters||!visible(characters))errors.push('home character art is missing');
  else if(box(tagline).bottom>box(characters).top+tolerance)errors.push('tagline covers home character art');
  const cards=[...document.querySelectorAll('.reference-landing .perspective-card')];
  if(cards.length!==2)errors.push('both illustrated perspective choices are required');
  cards.forEach((card,index)=>{
   const scene=card.querySelector('.perspective-scene'),caption=card.querySelector('.perspective-label');
   if(!scene||!caption||!visible(scene)||!visible(caption)){errors.push('perspective '+index+': missing art or caption');return;}
   const sceneBox=box(scene),captionBox=box(caption),cardBox=box(card);
   if(sceneBox.width<44||sceneBox.height<44)errors.push('perspective '+index+': artwork collapsed');
   if(captionBox.height<43.5)errors.push('perspective '+index+': caption target smaller than 44px');
   if(captionBox.top<sceneBox.bottom-tolerance)errors.push('perspective '+index+': caption covers artwork');
   if(!inside(sceneBox,cardBox)||!inside(captionBox,cardBox))errors.push('perspective '+index+': art or caption leaves card');
   readable(caption,'perspective '+index+' caption');
   control(card,'perspective '+index+' link');
  });
 }else{
  const portrait=document.querySelector('.setup-character>.character-image');
  const copy=document.querySelector('.setup-character>div');
  const panel=document.querySelector('.setup-character');
  if(!portrait||!copy||!panel||!visible(portrait))errors.push('selected character portrait is missing');
  else{
   const portraitBox=box(portrait);
   if(portraitBox.width<44||portraitBox.height<44)errors.push('selected portrait is too small to see');
   if(!inside(portraitBox,box(panel)))errors.push('selected portrait leaves its panel');
   if(overlaps(portraitBox,box(copy)))errors.push('character labels cover the selected portrait');
  }
  const selectors=['.simple-setup>h1','.setup-role>strong>span','.play-modes a strong',
   '.play-modes a span','.recommended-situation>h2','.recommended-situation>p','.setup-character>div'];
  for(const selector of selectors){
   const nodes=[...document.querySelectorAll(selector)];
   if(!nodes.length)errors.push(selector+': missing content');
   nodes.forEach(element=>readable(element,selector));
  }
  const controls=[...document.querySelectorAll('.simple-setup a,.simple-setup button,.simple-setup summary')].filter(visible);
  if(!controls.length)errors.push('setup controls are missing');
  controls.forEach(element=>control(element,element.dataset.action||element.tagName.toLowerCase()));
 }
 return [...new Set(errors)];
}

for(const [path,edition] of editions){
 test(`${edition}: phone home keeps the tagline and perspective captions clear of the artwork`,async({page},info)=>{
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const language of ['en','ar']){
   await page.setViewportSize({width:390,height:844});
   await page.goto(path+'?lang='+language+'#play');
   await ready(page,language,'home');
   for(const size of [100,200])for(const width of [320,390]){
    await resize(page,width,size);
    await expect.poll(()=>page.evaluate(mobileLayout,'home'),{
     message:`${edition} ${language} home at ${width}px / ${size}%`
    }).toEqual([]);
    if(language==='en'&&size===100&&width===390)await page.locator('.reference-landing').screenshot({
     path:info.outputPath(edition+'-home-390.png'),animations:'disabled'
    });
   }
  }
 });

 test(`${edition}: both phone setup routes preserve readable controls and the selected portrait`,async({page},info)=>{
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const language of ['en','ar'])for(const role of ['public','garda']){
   await page.setViewportSize({width:390,height:844});
   await page.goto(path+'?lang='+language+'#encounters/'+role);
   await ready(page,language,'setup');
   await expect(page.locator('[data-action="paired-quick-start"]')).toHaveAttribute('data-role',role);
   await expect(page.locator('.setup-character')).toHaveAttribute('data-role-tone',role);
   for(const size of [100,200])for(const width of [320,390]){
    await resize(page,width,size);
    await expect.poll(()=>page.evaluate(mobileLayout,'setup'),{
     message:`${edition} ${language} ${role} setup at ${width}px / ${size}%`
    }).toEqual([]);
    if(language==='en'&&size===100&&width===390)await page.locator('.simple-setup').screenshot({
     path:info.outputPath(edition+'-setup-'+role+'-390.png'),animations:'disabled'
    });
   }
   // The compact closed control must still expand into readable role choices
   // when text is enlarged, including on the other edition's setup route.
   const roleDetails=page.locator('.setup-role details');
   await roleDetails.locator('summary').click();
   await expect(roleDetails).toHaveAttribute('open','');
   await expect.poll(()=>page.evaluate(mobileLayout,'setup'),{
    message:`${edition} ${language} ${role} expanded role choices at 200%`
   }).toEqual([]);
  }
 });
}
