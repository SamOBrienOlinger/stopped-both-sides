import test from 'node:test';
import assert from 'node:assert/strict';
import {encounters,roles} from '../encounters/catalog.mjs';
import {characters} from '../encounters/characters.mjs';
import {personalizeText,personalizeHTML,storyIdentity,characterContext} from '../encounters/narrative.mjs';
import {translateText,translateHTML} from '../locales/translate.mjs';

test('Noor and Aisling have one identity in the reported street situation',()=>{
 const e=encounters['garda-street'],cast={public:'public-2',garda:'garda-5'};
 assert.match(personalizeText(e.nodes[e.start].scene,e,cast),/^Noor, 24, stands beside a closed shop/);
 assert.equal(personalizeText(e.nodes[e.start].views.public.prompt,e,cast),'As Noor, what could help you understand the contact?');
 assert.equal(characterContext(e,e.nodes[e.start],'public'),'24 years old');
 assert.equal(characterContext(e,e.nodes[e.start],'garda'),'Patrol Garda');
});

test('Every named scene, prompt, choice, explanation and lesson uses each selected identity in both languages',()=>{
 const before=JSON.stringify(encounters);
 let checked=0;
 for(const e of Object.values(encounters))for(const node of Object.values(e.nodes)){
  const identity=storyIdentity(e);
  const texts=[node.title,node.scene,...roles.flatMap(role=>{const v=node.views[role];return [v.prompt,v.lesson,...v.choices.flatMap(c=>[c.text,c.feedback])];})];
  for(const lang of ['en','ga'])for(const character of characters.public)for(const source of texts){
   const translated=translateText(source,lang),cast={public:character.id,garda:'garda-5'};
   const text=personalizeText(translated,e,cast);
   if(identity&&translated.includes(identity.name)){
    assert.ok(text.includes(character.name),`${e.id}/${node.id}/${lang}/${character.name}`);
    if(character.name!==identity.name)assert.ok(!text.includes(identity.name),text);
   }else assert.equal(text,translated);
   assert.deepEqual(text.match(/\d+/g),translated.match(/\d+/g),'Ages, time limits and legal section numbers are retained');
   checked++;
  }
 }
 assert.ok(checked>10000);assert.equal(JSON.stringify(encounters),before,'Canonical facts and translations remain reusable');
});

test('Names do not corrupt picker choices, source publications, routes, HTML or unrelated words',()=>{
 const e=encounters['public-street'],cast={public:'public-2',garda:'garda-5'};
 const html='<h1 title="Alex’s decision">Alex, 24</h1><p>Alex’s account; Alexandra; Alex_1; Álex.</p><button data-character="public-1" aria-label="Choose character: Alex"><strong data-no-translate>Alex</strong></button><ul data-no-translate><li>Alex — a source title</li></ul><a href="/Alex?name=Alex" data-id="Alex">Alex</a><img src="/Alex.webp" alt=""><p>&lt;Alex&gt; &amp; Alex</p>';
 const out=personalizeHTML(html,e,cast);
 assert.match(out,/<h1 title="Noor’s decision">Noor, 24/);
 assert.match(out,/Noor’s account; Alexandra; Alex_1; Álex/);
 assert.match(out,/aria-label="Choose character: Alex"/);
 assert.match(out,/<li>Alex — a source title/);
 assert.match(out,/href="\/Alex\?name=Alex" data-id="Alex">Noor/);
 assert.match(out,/src="\/Alex.webp"/);assert.match(out,/&lt;Noor&gt; &amp; Noor/);
 const scene='<p>'+e.nodes[e.start].scene+'</p>';
 const irish=personalizeHTML(translateHTML(scene,'ga'),e,cast);
 assert.ok(irish.includes('Noor'));assert.ok(!irish.includes('Alex'));assert.ok(!irish.includes('walking home'));
});
