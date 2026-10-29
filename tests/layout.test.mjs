import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paragraphChunks} from '../accessibility/layout.mjs';

test('Long prose gains shorter paragraphs without losing words or changing meaning',()=>{
 const text='The game has no account form, analytics or complaint collection. Fictional choices, scores and a resume point are saved in this browser. The resource-site link carries this learning record to the companion site in the link. You can review or clear local records under Scores & progress. Separate browsers do not automatically sync. Hosting providers may keep standard access logs; external sources have their own privacy arrangements.';
 const chunks=paragraphChunks(text);
 assert.ok(chunks.length>1);
 assert.equal(chunks.join(' '),text);
 assert.ok(chunks.every(p=>p.length<300));
});
test('Sentence boundaries respect multilingual punctuation and leave short text alone',()=>{
 for(const [language,sentence] of [['fr','Les décisions doivent être fondées sur des faits. '],['ar','يمكنك قراءة الموقف ومراجعة المعلومات قبل اختيار إجابتك. '],['zh-Hans','你可以阅读情况并思考自己的选择。']]){
  const text=sentence.repeat(18).trim(),chunks=paragraphChunks(text,language);
  assert.ok(chunks.length>1,language);
  assert.equal(chunks.join('').replace(/\s/g,''),text.replace(/\s/g,''));
 }
 assert.deepEqual(paragraphChunks('A short sentence. Another short sentence.'),['A short sentence. Another short sentence.']);
});
test('A long unsplittable sentence and browsers without sentence segmentation preserve the text',()=>{
 const text='This is one statement with no sentence break '.repeat(12);
 assert.deepEqual(paragraphChunks(text),[text]);
 const segmenter=Intl.Segmenter;
 try{Intl.Segmenter=undefined;assert.deepEqual(paragraphChunks(text),[text]);}
 finally{Intl.Segmenter=segmenter;}
});
