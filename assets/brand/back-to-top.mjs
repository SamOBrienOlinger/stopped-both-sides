// Delegation survives the translated footer being re-rendered.
document.addEventListener('click',event=>{
 const button=event.target.closest?.('[data-back-to-top]');
 if(!button)return;
 const target=document.querySelector('.header .wordmark')||document.querySelector('main h1,h1');
 if(target){
  if(!target.matches('a,button,[tabindex]'))target.setAttribute('tabindex','-1');
  target.focus({preventScroll:true});
 }
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('motion-reduce');
 window.scrollTo({top:0,left:0,behavior:reduced?'instant':'smooth'});
});

