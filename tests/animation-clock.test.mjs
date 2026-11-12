import test from 'node:test';
import assert from 'node:assert/strict';
import {paceAnimations} from '../accessibility/animation-clock.mjs';

function environment(){
 let id=0;const frames=new Map(),timers=new Map(),listeners=new Map(),micro=[];
 const host={requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),
  setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:id=>timers.delete(id),queueMicrotask:fn=>micro.push(fn),
  document:{hidden:false,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)}};
 return {host,frames,timers,listeners,tick(time){const pending=[...frames.values()];frames.clear();for(const fn of pending)fn(time);},flush(){while(micro.length)micro.shift()();}};
}
function animation(end=800){return {currentTime:123,effect:{getComputedTiming:()=>({endTime:end})},paused:false,finished:0,pause(){this.paused=true;},finish(){this.currentTime=end;this.finished++;}};}

test('motion begins at zero and holds the first render opportunity',()=>{
 const e=environment(),a=animation();paceAnimations([a],()=>{},e.host);
 assert.equal(a.currentTime,0);assert.equal(a.paused,true);e.tick(1000);assert.equal(a.currentTime,0);
 e.tick(1016);assert.equal(a.currentTime,16);
});
test('a delayed frame cannot skip more than 40ms of visible motion',()=>{
 const e=environment(),a=animation();paceAnimations([a],()=>{},e.host);
 e.tick(0);e.tick(500);assert.equal(a.currentTime,40);e.tick(1500);assert.equal(a.currentTime,80);
});
test('all tracks finish once and release timers and listeners',()=>{
 const e=environment(),a=animation(80),b=animation(120);let finished=0;paceAnimations([a,b],()=>finished++,e.host);
 for(const t of [0,40,80,120,160])e.tick(t);
 assert.equal(finished,1);assert.equal(a.finished,1);assert.equal(b.finished,1);
 assert.equal(e.frames.size,0);assert.equal(e.timers.size,0);assert.equal(e.listeners.size,0);
});
test('cancellation prevents a stale completion after navigation or reversal',()=>{
 const e=environment(),a=animation();let finished=0;const stop=paceAnimations([a],()=>finished++,e.host);
 e.tick(0);e.tick(20);stop();stop();e.tick(1000);
 assert.equal(a.currentTime,20);assert.equal(finished,0);assert.equal(e.frames.size,0);assert.equal(e.timers.size,0);
});
test('hiding the document settles decoration instead of retaining paused state',()=>{
 const e=environment(),a=animation();let finished=0;paceAnimations([a],()=>finished++,e.host);
 e.host.document.hidden=true;e.listeners.get('visibilitychange')();
 assert.equal(finished,1);assert.equal(a.currentTime,800);assert.equal(e.frames.size,0);
});
test('missing or infinite animations complete asynchronously without a frame loop',()=>{
 const e=environment();let finished=0;paceAnimations([animation(Infinity)],()=>finished++,e.host);
 assert.equal(finished,0);e.flush();assert.equal(finished,1);assert.equal(e.frames.size,0);
});
