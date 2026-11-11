/*
 * uimproved — passive presentation enhancement.
 * Updates a CSS-only reading-position indicator. No content, navigation,
 * scores, game choices, preferences or focus management are changed.
 */
const root=document.documentElement;
const main=document.querySelector('#main');
let frame=0;
function updateProgress(){
 frame=0;
 const remaining=Math.max(0,root.scrollHeight-window.innerHeight);
 const progress=remaining?Math.max(0,Math.min(100,window.scrollY/remaining*100)):0;
 root.style.setProperty('--ui-scroll-progress',progress.toFixed(2)+'%');
}
function scheduleProgress(){
 if(frame||typeof requestAnimationFrame!=='function')return;
 frame=requestAnimationFrame(updateProgress);
}
window.addEventListener('scroll',scheduleProgress,{passive:true});
window.addEventListener('resize',scheduleProgress,{passive:true});
window.addEventListener('hashchange',scheduleProgress);
if(typeof ResizeObserver!=='undefined'&&main){
 const observer=new ResizeObserver(scheduleProgress);
 observer.observe(main);
}
scheduleProgress();
