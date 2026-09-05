import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const current=resolve(fileURLToPath(new URL('..',import.meta.url)));
const baseline=resolve(process.argv[2]);
const excluded=new Set(['.git','node_modules','node_modules.audit-baseline-link','.DS_Store','release-evidence']);
function list(root,dir=root,out=new Map()){
  for(const item of readdirSync(dir,{withFileTypes:true})){
    if(excluded.has(item.name))continue;
    const path=join(dir,item.name);
    if(item.isDirectory())list(root,path,out);
    else if(item.isFile())out.set(relative(root,path),createHash('sha256').update(readFileSync(path)).digest('hex'));
  }return out;
}
const old=list(baseline),now=list(current);
const changes=[...new Set([...old.keys(),...now.keys()])].sort().filter(p=>old.get(p)!==now.get(p)).map(path=>({path,kind:!old.has(path)?'added':!now.has(path)?'removed':'modified',before:old.get(path)??null,after:now.get(path)??null}));
const result={baselineCommit:'18b9e9bee84884891d06baf73747a16eccea0ece',scope:'File comparison only; excludes dependency trees, git metadata and release-evidence; does not certify merge or release',changes};
writeFileSync(join(current,'release-evidence/change-manifest.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(changes.reduce((a,c)=>(a[c.kind]=(a[c.kind]??0)+1,a),{})));
