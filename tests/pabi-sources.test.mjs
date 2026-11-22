import test from 'node:test';
import assert from 'node:assert/strict';
import {sources as publicSources} from '../data.mjs?v=pabi-privacy-20261122';
import {sources as gardaSources} from '../garda/sources.mjs?v=pabi-privacy-20261122';
import {encounters,references,roles} from '../encounters/catalog.mjs?v=colleague-witness-20261122';
import {pabiReport} from '../learning/pabi.mjs?v=pabi-privacy-20261122';
import {languages} from '../locales/languages.mjs';
import {loadLanguage,translateText} from '../locales/translate.mjs?v=colleague-witness-20261122';

test('The distinct 2025 PABI report has shared bibliographic details and explicit limits',()=>{
 assert.equal(publicSources.pabi.url,pabiReport.url);
 assert.equal(gardaSources.pabi.url,pabiReport.url);
 assert.equal(gardaSources.pabi.year,'2025');
 assert.equal(gardaSources.pabi.group,'community');
 assert.equal(gardaSources.pabi.kind,'Community research');
 assert.notEqual(publicSources.inarReport.url,pabiReport.url);
 assert.notEqual(gardaSources.inar.url,pabiReport.url);
 assert.match(gardaSources.pabi.limit,/self-selecting/);
 assert.match(gardaSources.pabi.limit,/do not estimate national prevalence/);
 assert.match(gardaSources.pabi.limit,/does not set out current legal powers or evaluate this resource/);
 assert.equal(publicSources.pabiSummaries.url,pabiReport.projectUrl);
 assert.equal(references['garda:pabi'].url,pabiReport.url);
});

test('PABI supports community experience in both roles while retaining the relevant legal and statistical sources',()=>{
 for(const role of roles){
  assert.ok(encounters['public-fair-treatment'].nodes['fair-start'].views[role].refs.includes('public:pabi'));
  const review=encounters['garda-supervision'].nodes['supervision-plan'].views[role].refs;
  assert.ok(review.includes('garda:pabi'));
  assert.ok(review.includes('garda:inar'));
  assert.ok(!encounters['garda-supervision'].nodes['supervision-start'].views[role].refs.includes('garda:pabi'));
  for(const encounter of Object.values(encounters).filter(e=>e.ground))for(const node of Object.values(encounter.nodes)){
   const refs=node.views[role].refs;
   assert.ok(refs.includes('equality:'+encounter.ground));
   assert.ok(refs.includes('garda:ethics'));
   assert.equal(refs.includes('garda:pabi'),encounter.ground==='race');
  }
 }
});

test('PABI annotations and links translate in every supported language',async()=>{
 const prose=[pabiReport.publication,pabiReport.access,pabiReport.note,pabiReport.limit,pabiReport.use,publicSources.pabiSummaries.note,'Read the PABI report (PDF)','PABI project and multilingual summaries'];
 for(const {id} of languages.filter(language=>language.id!=='en')){
  await loadLanguage(id);
  for(const source of prose)assert.notEqual(translateText(source,id),source,`${id}: ${source}`);
 }
});
