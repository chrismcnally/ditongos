const $=id=>document.getElementById(id);
let words=[],filter='all',idx=0,revealed=false,filled='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function load(){try{const r=await fetch('data/words.csv');if(!r.ok)throw Error('CSV');words=parseCSV(await r.text());renderFilters();renderVowels();show()}catch(e){$('count').textContent='Não foi possível carregar data/words.csv. Abra a página através do GitHub Pages.'}}
function parseCSV(t){let rows=[],row=[],cell='',quoted=false;for(let i=0;i<t.length;i++){let ch=t[i],next=t[i+1];if(ch==='"'){if(quoted&&next==='"'){cell+='"';i++}else quoted=!quoted}else if(ch===','&&!quoted){row.push(cell);cell=''}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&next==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell=''}else cell+=ch}row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows.slice(1).map(c=>({dt:(c[0]||'').trim(),word:(c[1]||'').trim(),image:(c[2]||'').trim(),sound:(c[3]||'').trim(),question:(c[4]||'').trim(),custom:false})).filter(x=>x.word)}
function active(){return words.filter(x=>filter==='all'||x.dt===filter)}
function renderFilters(){let ds=[...new Set(words.map(x=>x.dt))].sort((a,b)=>a.localeCompare(b,'pt'));$('filters').innerHTML='<button class="filter '+(filter==='all'?'active':'')+'" data-d="all">Todos ('+words.length+')</button>'+ds.map(d=>`<button class="filter ${filter===d?'active':''}" data-d="${esc(d)}">${esc(d)} (${words.filter(x=>x.dt===d).length})</button>`).join('');document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{filter=b.dataset.d;idx=0;revealed=false;filled='';renderFilters();show();$('sidebar').classList.remove('open')});$('filterLabel').textContent=filter==='all'?'Todos os ditongos':'Ditongo: '+filter}
function renderVowels(){const chars=['a','e','i','o','u','ã','õ','á','é','í','ó','ú'];$('vowels').innerHTML=chars.map(c=>`<button class="vowel" data-v="${c}">${c}</button>`).join('');document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>insert(b.dataset.v))}
function current(){return active()[idx]}
function insert(c){let q=current()?.question||'__';let chars=[...q],positions=chars.map((v,i)=>v==='_'?i:-1).filter(i=>i>=0);let n=filled.length;if(n>=positions.length)return;filled+=c;show(false)}
function erase(){filled=filled.slice(0,-1);show(false)}
function clear(){filled='';$('answer').textContent='';show(false)}
function completedPrompt(q){let chars=[...q],positions=chars.map((v,i)=>v==='_'?i:-1).filter(i=>i>=0);[...filled].forEach((c,i)=>{if(positions[i]!=null)chars[positions[i]]=c});return chars.join('')}
function show(play=true){let a=active();if(!a.length){$('count').textContent='Sem palavras neste filtro';return}idx=Math.max(0,Math.min(idx,a.length-1));let x=a[idx];$('picture').src='images/'+x.image;$('picture').alt='Imagem: '+x.word;let q=x.question||'__';$('prompt').textContent=revealed?x.word:completedPrompt(q);$('answer').textContent=revealed?'Muito bem! '+x.word:$('answer').textContent;$('count').textContent=`${idx+1} de ${a.length} palavras`;$('prev').disabled=idx===0;$('next').disabled=idx>=a.length-1;$('reveal').textContent=revealed?'🙈 Esconder':'✨ Mostrar!';if(play)playWord(x)}
function playWord(x){if(!x)return;if(x.sound){let audio=new Audio('audio/'+x.sound);audio.onerror=()=>synth(x.word);audio.play().catch(()=>synth(x.word))}else synth(x.word)}
$('reveal').onclick=()=>{revealed=!revealed;show(false);$('answer').textContent=revealed?'Muito bem! '+current().word:''};
$('next').onclick=()=>{idx++;revealed=false;filled='';$('answer').textContent='';show()};
$('prev').onclick=()=>{idx--;revealed=false;filled='';$('answer').textContent='';show()};
$('shuffle').onclick=()=>{idx=0;revealed=false;filled='';let a=active();if(a.length>1){let target=Math.floor(Math.random()*a.length);idx=target}show()};
$('speak').onclick=()=>playWord(current());
$('erase').onclick=erase;$('clear').onclick=clear;
$('check').onclick=()=>{let x=current();if(!x)return;let entered=completedPrompt(x.question||'__').replace(/_/g,'').toLocaleLowerCase('pt-PT');let answer=x.word.toLocaleLowerCase('pt-PT');$('answer').textContent=entered===answer?'Muito bem! 🎉':'Tenta outra vez!';};
function synth(w){if(!window.speechSynthesis)return;window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(w);u.lang='pt-PT';let v=speechSynthesis.getVoices().find(v=>v.lang==='pt-PT');if(v)u.voice=v;speechSynthesis.speak(u)}
$('menuToggle').onclick=()=>$('sidebar').classList.toggle('open');
load();
