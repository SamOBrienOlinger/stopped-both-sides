// Keep decorative motion in step with rendered frames. A delayed layout/paint
// must not consume most of an entrance or make a large disclosure jump ahead.
// This does not delay actions, focus, game state or accessible expanded state.
export function paceAnimations(animations,onFinish=()=>{},host=globalThis){
 const tracks=animations.map(animation=>({animation,end:animation.effect?.getComputedTiming().endTime,
  rate:Number.isFinite(animation.playbackRate)?animation.playbackRate:1}))
  .filter(track=>Number.isFinite(track.end)&&track.end>0);
 let frame=0,timer=0,stopped=false,previous=null,elapsed=0;
 const doc=host.document;
 const stop=()=>{
  if(stopped)return;
  stopped=true;
  host.cancelAnimationFrame(frame);host.clearTimeout(timer);
  doc?.removeEventListener?.('visibilitychange',visibility);
  for(const {animation,rate} of tracks)animation.playbackRate=rate;
 };
 const complete=()=>{
  if(stopped)return;
  stop();
  for(const {animation} of tracks){try{
   // finish() cannot resolve a zero-rate timeline; settle at the final frame.
   if(animation.playbackRate<=0)animation.playbackRate=1;
   animation.finish();
  }catch{}}
  onFinish();
 };
 const visibility=()=>{if(doc.hidden)complete();};
 if(!tracks.length){host.queueMicrotask(complete);return stop;}
 const duration=Math.max(...tracks.map(track=>track.end));
 try{
  for(const {animation} of tracks){
   // Keep the native lifecycle running, including ready/finished promises and
   // reversal detection. Only time advancement belongs to this frame clock.
   animation.playbackRate=0;animation.currentTime=0;animation.play();
  }
 }catch{host.queueMicrotask(complete);return stop;}
 const sample=time=>{
  if(stopped)return;
  // Normal 60/120 Hz playback keeps its authored duration. Under rendering
  // pressure, prefer a slightly longer effect to skipping its visible frames.
  // The first rendering opportunity holds the initial state for one frame.
  if(previous!==null)elapsed+=Math.min(40,Math.max(0,time-previous));
  previous=time;
  for(const {animation,end} of tracks)animation.currentTime=Math.min(elapsed,end);
  if(elapsed>=duration){complete();return;}
  frame=host.requestAnimationFrame(sample);
 };
 // Never retain presentation state indefinitely if the browser stops drawing.
 timer=host.setTimeout(complete,Math.max(5000,duration*6));
 doc?.addEventListener?.('visibilitychange',visibility);
 frame=host.requestAnimationFrame(sample);
 return stop;
}
