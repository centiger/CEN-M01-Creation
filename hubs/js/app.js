let DATA=null, current=null;
const $=id=>document.getElementById(id);
function qs(){return new URLSearchParams(location.search)}
function escapeHtml(s){return String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function renderExplore(items){
  function hasEmoji(s){
    return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(String(s||''));
  }
  function iconForStep(s){
    const t=String(s||'');
    if(/창조|에덴/.test(t)) return '🌍';
    if(/타락|죄/.test(t)) return '🍎';
    if(/가인|아벨|피/.test(t)) return '🩸';
    if(/셋|계보/.test(t)) return '🌱';
    if(/노아|홍수/.test(t)) return '🌈';
    if(/바벨/.test(t)) return '🗼';
    if(/아브라함|언약/.test(t)) return '⭐';
    if(/출애굽/.test(t)) return '🌊';
    if(/예수|그리스도|십자가/.test(t)) return '✝️';
    if(/교회/.test(t)) return '⛪';
    if(/새창조/.test(t)) return '👑';
    return '🔹';
  }
  function esc2(s){return escapeHtml(String(s||''));}
  function verticalFlowHtml(text){
    const raw=String(text||'').replace(/\s*\|\s*/g,' ').trim();
    const parts=raw.split(/\s*→\s*/).map(v=>v.trim()).filter(Boolean);
    if(parts.length<2) return esc2(raw).replace(/\n/g,'<br>');
    return parts.map((step,i)=>{
      const labeled=hasEmoji(step) ? step : `${iconForStep(step)} ${step}`;
      const line=`<span class="flowLine">${esc2(labeled)}</span>`;
      if(i===parts.length-1) return line;
      return line + `<span class="flowArrow">↓</span>`;
    }).join('');
  }
  function normalHtml(text){
    return esc2(String(text||'').replace(/\s*\|\s*/g,'\n')).replace(/\n/g,'<br>');
  }
  return (items||[]).map(x=>{
    let title='', text='';
    if(typeof x==='string'){
      const s=String(x||'');
      if(s.includes('|')){
        const a=s.split('|');
        title=a.shift().trim();
        text=a.join('|').trim();
      }else{
        text=s.trim();
      }
    }else{
      title=String(x.title||'').trim();
      text=String(x.text||x.content||'').trim();
    }
    if(title.includes('|')){
      const a=title.split('|');
      title=a.shift().trim();
      text=a.join('|').trim() + (text ? '\n' + text : '');
    }
    const isFlow=/연결\s*흐름|성경\s*전체\s*흐름/.test(title) || text.includes('→');
    const body=isFlow ? verticalFlowHtml(text) : normalHtml(text);
    return `<div class="exploreCard">${title?`<b>${esc2(title)}</b>`:''}<p>${body}</p></div>`;
  }).join('');
}

async function init(){
  const res=await fetch('./data/hubs.json?v=m01-v32-flowfix'); DATA=await res.json();
  const slug=qs().get('hub')||DATA.defaultHub||'creation'; render(slug);
}
function find(slug){return DATA.hubs.find(h=>h.slug===slug)||DATA.hubs[0]}
function scrollToHash(){
  const targetHash=location.hash;
  if(!targetHash) return;

  setTimeout(()=>{
    const target=document.querySelector(targetHash);

    if(target){
      target.scrollIntoView({
        behavior:'smooth',
        block:'start'
      });
    }
  },180);
}
function render(slug){
  const h=find(slug); current=h;
  if(!h.ready){renderPending(h);return}
  $('title').textContent=`${h.icon||''} ${h.title}`;
  $('subtitle').textContent=h.subtitle||'';
  $('verse').textContent=h.verse||h.message||'';
  $('map').src=h.map||'';
  $('caption').textContent=h.mapCaption||'';
  $('events').innerHTML=(h.events||[]).map(x=>`<div class="item">${x}</div>`).join('');
  $('meanings').innerHTML=(h.meanings||[]).map(x=>`<li>${x}</li>`).join('');
  $('connections').innerHTML=renderExplore(h.connections||[]);
  const integrationEl=$('integration');
  if(integrationEl) integrationEl.innerHTML=renderExplore(h.integration||[]);
  $('references').innerHTML=(h.references||[]).map(x=>`<span class="chip">${escapeHtml(x)}</span>`).join('');
  const n=h.next?find(h.next):null;
  const btn=$('nextBtn');
  if(n){btn.style.display='block';btn.textContent=`다음: ${n.title} →`;btn.onclick=()=>go(n.slug)}
  else if(h.nextUrl){btn.style.display='block';btn.textContent=(h.nextLabel||'다음 시대로 이동')+' →';btn.onclick=()=>{location.href=h.nextUrl}}
  else{btn.style.display='none'}
  history.replaceState(
  null,
  '',
  `?hub=${h.slug}${location.hash||''}`
);

scrollToHash();
}
function renderPending(h){
  $('title').textContent=`${h.icon||''} ${h.title}`;$('subtitle').textContent=h.subtitle||'제작 예정';$('verse').textContent='이 허브는 다음 단계에서 제작할 예정입니다.';$('map').src='assets/maps/creation-hub-map.png';$('caption').textContent='창조시대 허브 구조에 맞춰 PNG 교체형 지도 영역을 유지합니다.';$('events').innerHTML='<div class="item">제작 예정입니다.</div>';$('meanings').innerHTML='<li>내용 추가 예정</li>';$('connections').innerHTML='<span class="chip">준비중</span>'; if($('integration')) $('integration').innerHTML='<span class="chip">준비중</span>';$('references').innerHTML='<span class="chip">준비중</span>';$('nextBtn').style.display='none';history.replaceState(
  null,
  '',
  `?hub=${h.slug}${location.hash||''}`
);

scrollToHash();
}
function go(slug){
  history.replaceState(
    null,
    '',
    `?hub=${slug}`
  );

  render(slug);

  window.scrollTo({
    top:0,
    behavior:'smooth'
  });
}
function openList(){
  $('hubList').innerHTML=DATA.hubs.map(h=>`<button class="hubOpt" onclick="closeList();go('${h.slug}')">${h.icon||''} ${h.title}<small>${h.subtitle||''}${h.ready?'':' · 제작 예정'}</small></button>`).join('');
  $('dialog').classList.add('show')
}
function closeList(){$('dialog').classList.remove('show')}
init().catch(e=>{console.error(e);alert('허브 데이터를 불러오지 못했습니다.')});
