// Server-render smoke checks, NOT browser interaction or screenshot acceptance.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
// Use the project's pinned Vite toolchain; do not add a second transformer.
const viteRequire=createRequire(require.resolve('vite/package.json'));
const {build}=viteRequire('esbuild');
const root=fileURLToPath(new URL('..',import.meta.url));
const {outputFiles}=await build({stdin:{contents:`
  import React from 'react';
  import {renderToStaticMarkup} from 'react-dom/server';
  import App from './src/App.jsx';
  import Cross from './src/CrossVerification.jsx';
  import Hunter from './src/ExomoonHunter.jsx';
  import Calculator from './src/CustomCalculator.jsx';
  import Numerics from './src/AphSim.jsx';
  const pages={App,Cross,Hunter,Calculator,Numerics};
  export function render(page,lang){return renderToStaticMarkup(React.createElement(pages[page],{lang}));}
`,resolveDir:root,loader:'jsx'},bundle:true,platform:'node',format:'cjs',jsx:'automatic',write:false,logLevel:'silent'});
const loaded={exports:{}};
new Function('require','module','exports',outputFiles[0].text)(require,loaded,loaded.exports);
for(const page of ['Cross','Hunter','Calculator','Numerics'])for(const lang of ['zh','en']){
  test(`server-render ${page} ${lang}`,()=>{
    const html=loaded.exports.render(page,lang);
    assert.ok(html.length>500);assert.ok(!html.includes('NaN'));
    if(page==='Hunter')assert.ok(html.includes('https://arxiv.org/abs/2511.20091'));
    if(page==='Calculator')assert.ok(html.includes('<select'));
  });
}
test('homepage and no-JS metadata agree on experimental scope',()=>{
  assert.ok(loaded.exports.render('App','zh').includes('本地修订预览'));
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(html.includes('not certified civil calendars'));
  for(const claim of ['verified against 10','drives intercalation automatically','Gregorian works for exactly one'])assert.ok(!html.includes(claim));
  assert.ok(html.includes('10.5281/zenodo.19571784'));
});
