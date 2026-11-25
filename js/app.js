const $ = (id) => document.getElementById(id);
let words = [], category = "Ditongos", group = "all", idx = 0, revealed = false, filled = "";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

async function load() {
  try {
    const r = await fetch("data/words.csv");
    if (!r.ok) throw Error("CSV");
    words = parseCSV(await r.text());
    const cats = [...new Set(words.map(x => x.category))];
    category = cats.includes("Ditongos") ? "Ditongos" : (cats[0] || "all");
    renderFilters(); renderVowels(); show();
  } catch (e) {
    $("count").textContent = "Não foi possível carregar data/words.csv. Abra a página através do GitHub Pages.";
  }
}
function parseCSV(t) {
  let rows=[], row=[], cell="", quoted=false;
  for(let i=0;i<t.length;i++){
    const ch=t[i], next=t[i+1];
    if(ch==='"'){ if(quoted&&next==='"'){cell+='"';i++;}else quoted=!quoted; }
    else if(ch===","&&!quoted){row.push(cell);cell="";}
    else if((ch==="\n"||ch==="\r")&&!quoted){if(ch==="\r"&&next==="\n")i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell="";}
    else cell+=ch;
  }
  row.push(cell); if(row.some(v=>v.trim()))rows.push(row);
  const headers=rows.shift().map(h=>h.trim().replace(/^\uFEFF/,"").toLowerCase());
  const at=(r,k,legacy)=>{const i=headers.indexOf(k);return (i>=0?r[i]:legacy!=null?r[legacy]:"")||""};
  return rows.map(r=>{
    const legacy=headers.includes("dt");
    const dt=at(r,"dt",0).trim();
    return {
      category: legacy ? "Ditongos" : at(r,"category").trim(),
      group: legacy ? dt : at(r,"group").trim(),
      word: at(r,"word",1).trim(), image: at(r,"image",2).trim(),
      sound: at(r,"sound",3).trim(), question: at(r,"question",4).trim()
    };
  }).filter(x=>x.word);
}
function active(){return words.filter(x=>(category==="all"||x.category===category)&&(group==="all"||x.group===group));}
function choose(cat,grp="all"){category=cat;group=grp;idx=0;filled="";revealed=false;renderFilters();show();$("sidebar").classList.remove("open");}
function renderFilters(){
  const cats=[...new Set(words.map(x=>x.category))];
  const groups=[...new Set(words.filter(x=>x.category===category).map(x=>x.group))].sort((a,b)=>a.localeCompare(b,"pt"));
  $("filters").innerHTML =
    `<div class="nav-caption">MATÉRIAS</div>`+
    cats.map(c=>`<button class="filter category-filter ${category===c?"active":""}" data-cat="${esc(c)}">${esc(c)} <span>${words.filter(x=>x.category===c).length}</span></button>`).join("")+
    `<div class="nav-caption group-caption">GRUPOS</div>`+
    `<button class="filter group-filter ${group==="all"?"active":""}" data-group="all">Todos (${words.filter(x=>x.category===category).length})</button>`+
    groups.map(g=>`<button class="filter group-filter ${group===g?"active":""}" data-group="${esc(g)}">${esc(g)} <span>${words.filter(x=>x.category===category&&x.group===g).length}</span></button>`).join("");
  document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>choose(b.dataset.cat));
  document.querySelectorAll("[data-group]").forEach(b=>b.onclick=()=>choose(category,b.dataset.group));
  $("filterLabel").textContent=category==="all"?"Todos":`${category}${group==="all"?"":" · "+group}`;
  $("sidebarTitle").textContent="Aprender";
}
function renderVowels(){
  const chars=["a","ã","á","e","é","i","í","o","õ","ó","u","ú"];
  $("vowels").innerHTML=chars.map(c=>`<button class="vowel" data-v="${c}" aria-label="Letra ${c}">${c}</button>`).join("");
  document.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>insert(b.dataset.v));
}
function current(){return active()[idx];}
function insert(c){
  const q=current()?.question||"__";
  const positions=[...q].map((v,i)=>v==="_"?i:-1).filter(i=>i>=0);
  if(filled.length>=positions.length)return;
  filled+=c;show(false);
}
function erase(){filled=filled.slice(0,-1);show(false);}
function clearAnswer(){filled="";$("answer").textContent="";show(false);}
function completedPrompt(q){
  const chars=[...q],positions=chars.map((v,i)=>v==="_"?i:-1).filter(i=>i>=0);
  [...filled].forEach((c,i)=>{if(positions[i]!=null)chars[positions[i]]=c;});
  return chars.join("");
}
function show(play=true){
  const a=active();
  if(!a.length){$("count").textContent="Sem cartões neste grupo";$("picture").hidden=true;$("prompt").textContent="";return;}
  idx=Math.max(0,Math.min(idx,a.length-1));
  const x=a[idx], picture=$("picture");
  if(x.image){picture.src="images/"+x.image;picture.alt="Imagem: "+x.word;picture.hidden=false;}
  else {picture.removeAttribute("src");picture.alt="";picture.hidden=true;}
  const q=x.question||"__";
  $("prompt").textContent=revealed?x.word:completedPrompt(q);
  $("answer").textContent=revealed?"Muito bem! "+x.word:"";
  $("count").textContent=`${idx+1} de ${a.length} ${category==="Frases"?"frases":"cartões"}`;
  $("prev").disabled=idx===0;$("next").disabled=idx>=a.length-1;
  $("reveal").textContent=revealed?"🙈 Esconder":"✨ Mostrar!";
  if(play)playWord(x);
}
function playWord(x){
  if(!x)return;
  if(x.sound){const audio=new Audio("audio/"+x.sound);audio.onerror=()=>synth(x.word);audio.play().catch(()=>synth(x.word));}
  else synth(x.word);
}
function synth(w){
  if(!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(w);u.lang="pt-PT";
  const v=speechSynthesis.getVoices().find(v=>v.lang==="pt-PT");if(v)u.voice=v;
  speechSynthesis.speak(u);
}
$("reveal").onclick=()=>{revealed=!revealed;show(false);};
$("next").onclick=()=>{idx++;revealed=false;filled="";show();};
$("prev").onclick=()=>{idx--;revealed=false;filled="";show();};
$("shuffle").onclick=()=>{const a=active();idx=a.length>1?Math.floor(Math.random()*a.length):0;revealed=false;filled="";show();};
$("speak").onclick=()=>playWord(current());
$("erase").onclick=erase;$("clear").onclick=clearAnswer;
$("check").onclick=()=>{
  const x=current();if(!x)return;
  const entered=completedPrompt(x.question||"__").replace(/_/g,"").replace(/\s+/g," ").trim().toLocaleLowerCase("pt-PT");
  const answer=x.word.replace(/\s+/g," ").trim().toLocaleLowerCase("pt-PT");
  $("answer").textContent=entered===answer?"Muito bem! 🎉":"Tenta outra vez!";
};
$("menuToggle").onclick=()=>$("sidebar").classList.toggle("open");
load();
