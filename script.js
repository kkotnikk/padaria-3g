const moments={manha:{label:'CAFÉ DA MANHÃ',title:'Comece<br> com gosto.',description:'Um café e um lanche. Seu pequeno ritual antes de o dia ganhar ritmo.',tags:'CAFÉ · PÃES · LANCHES',image:'pao-de-queijo-hd',alt:'Pães de queijo da Padaria 3G',number:'01'},pausa:{label:'A SUA PAUSA',title:'Dê um tempo.<br> Dê uma mordida.',description:'No meio do dia, um lanche caprichado e uma conversa boa fazem toda a diferença.',tags:'LANCHES · CAFÉ · CONFEITARIA',image:'lanche-natural-hd',alt:'Lanche natural da Padaria 3G',number:'02'},noite:{label:'O DIA AINDA TEM SABOR',title:'Mais uma fatia.<br> Mais um motivo.',description:'A pizza entra em cena. Passe na 3G para terminar o dia com sabor.',tags:'PIZZAS · LANCHES · ATÉ MEIA-NOITE',image:'pizza-hd',alt:'Fatia de pizza da Padaria 3G, em foto do Instagram',number:'03'}};

const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
const tabs=[...document.querySelectorAll('[data-moment]')];
const panel=document.getElementById('moment-content');
let momentRequest=0,currentMoment='manha';
const imageCache=new Map();
function loadMomentImage(src){
 if(!imageCache.has(src))imageCache.set(src,new Promise(resolve=>{
  const preload=new Image();preload.onload=async()=>{try{await preload.decode()}catch{}resolve(true)};
  preload.onerror=()=>{imageCache.delete(src);resolve(false)};preload.src=src;
 }));
 return imageCache.get(src);
}
function markMoment(key){tabs.forEach(t=>{const active=t.dataset.moment===key;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1})}
async function selectMoment(btn,focus=false){
 const key=btn.dataset.moment,request=++momentRequest,m=moments[key];
 markMoment(key);if(focus)btn.focus();
 if(key===currentMoment){panel.removeAttribute('aria-busy');return}
 panel.setAttribute('aria-busy','true');
 const src='assets/'+m.image+'.webp',ready=await loadMomentImage(src);
 if(request!==momentRequest)return;
 panel.removeAttribute('aria-busy');
 if(!ready){markMoment(currentMoment);return}
 const im=document.getElementById('moment-image');
 const picture=im.parentElement;
 picture.querySelectorAll('.moment-outgoing').forEach(el=>el.remove());
 let outgoing;
 if(!reducedMotion.matches&&im.animate){
  outgoing=im.cloneNode();outgoing.removeAttribute('id');outgoing.alt='';outgoing.setAttribute('aria-hidden','true');outgoing.className='moment-outgoing';picture.append(outgoing);
 }
 im.getAnimations?.().forEach(a=>a.cancel());im.src=src;im.alt=m.alt;
 panel.setAttribute('aria-labelledby',btn.id);
 document.getElementById('moment-label').textContent=m.label;
 document.getElementById('moment-title').innerHTML=m.title;
 document.getElementById('moment-description').textContent=m.description;
 document.getElementById('moment-tags').textContent=m.tags;
 document.querySelector('.moment-number').textContent=m.number;
 currentMoment=key;
 panel.classList.remove('switching');void panel.offsetWidth;panel.classList.add('switching');
 if(outgoing){
  const options={duration:720,easing:'cubic-bezier(.22,1,.36,1)'};
  im.animate([{opacity:.4,transform:'scale(1.04)'},{opacity:1,transform:'scale(1)'}],options);
  const fade=outgoing.animate([{opacity:1},{opacity:0}],{...options,fill:'forwards'});
  fade.finished.then(()=>outgoing.remove()).catch(()=>outgoing.remove());
 }
}
tabs.forEach((btn,i)=>{
 btn.addEventListener('click',()=>selectMoment(btn));
 btn.addEventListener('pointerenter',()=>loadMomentImage('assets/'+moments[btn.dataset.moment].image+'.webp'),{passive:true});
 btn.addEventListener('focus',()=>loadMomentImage('assets/'+moments[btn.dataset.moment].image+'.webp'));
 btn.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();selectMoment(tabs[n],true)}});
});
const reviews=[{quote:'Conheci há pouco tempo essa padaria e só tenho elogios a fazer. Ambiente aconchegante e limpo, valores super acessíveis.',name:'Brenda Duarte'},{quote:'Sempre cliente e sempre serei. Recomendo ótimo atendimento, comida, massas e pães maravilhosos.',name:'Wilson Meneghel'},{quote:'Sempre passei em frente essa padaria e hoje resolvi parar e comer um pedaço de torta. Fui muito bem atendido pelos funcionários Márcio, Fabrícia e João.',name:'Ti 22 Mkt'}];
document.querySelectorAll('[data-review]').forEach(b=>b.addEventListener('click',()=>{
 const r=reviews[Number(b.dataset.review)];document.getElementById('review-quote').textContent=r.quote;
 const author=document.getElementById('review-author');author.replaceChildren(document.createTextNode(r.name+' '));const s=document.createElement('span');s.textContent='AVALIAÇÃO NO GOOGLE · TRECHO';author.append(s);
 document.querySelectorAll('[data-review]').forEach(btn=>{const active=b===btn;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active))});
 const content=document.querySelector('.quote-wrap [aria-live]');if(!reducedMotion.matches&&content.animate)content.animate([{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});
}));
if('IntersectionObserver' in window){
 document.documentElement.classList.add('js');
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.08});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
// Motion follows the pointer only on devices with a precise mouse.
if(finePointer.matches){
 document.querySelectorAll('.hero-visual,.delivery-brand-art,.photo-wall figure').forEach(surface=>{
  let raf=0,x=0,y=0;
  const reset=()=>{cancelAnimationFrame(raf);raf=0;surface.style.setProperty('--mouse-x','0px');surface.style.setProperty('--mouse-y','0px');surface.style.setProperty('--mouse-rx','0deg');surface.style.setProperty('--mouse-ry','0deg')};
  surface.addEventListener('pointermove',event=>{
   if(reducedMotion.matches||event.pointerType!=='mouse')return;
   const r=surface.getBoundingClientRect();x=(event.clientX-r.left)/r.width-.5;y=(event.clientY-r.top)/r.height-.5;
   if(!raf)raf=requestAnimationFrame(()=>{raf=0;const hero=surface.classList.contains('hero-visual');surface.style.setProperty('--mouse-x',(x*(hero?24:10)).toFixed(2)+'px');surface.style.setProperty('--mouse-y',(y*(hero?16:8)).toFixed(2)+'px');surface.style.setProperty('--mouse-rx',(-y*5).toFixed(2)+'deg');surface.style.setProperty('--mouse-ry',(x*6).toFixed(2)+'deg')});
  },{passive:true});surface.addEventListener('pointerleave',reset);surface.addEventListener('pointercancel',reset);reducedMotion.addEventListener('change',reset);
 });
}
document.querySelectorAll('.button').forEach(button=>button.addEventListener('click',event=>{
 if(reducedMotion.matches)return;
 const rect=button.getBoundingClientRect(),size=Math.max(rect.width,rect.height)*2;
 const wave=document.createElement('span');wave.className='click-wave';wave.setAttribute('aria-hidden','true');wave.style.width=wave.style.height=size+'px';wave.style.left=((event.detail?event.clientX-rect.left:rect.width/2)-size/2)+'px';wave.style.top=((event.detail?event.clientY-rect.top:rect.height/2)-size/2)+'px';button.append(wave);wave.addEventListener('animationend',()=>wave.remove(),{once:true});
}));


const animatedHero=document.querySelector('.hero');
if(animatedHero&&'IntersectionObserver' in window){
 const heroMotionObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>animatedHero.classList.toggle('hero-motion-paused',!entry.isIntersecting))},{threshold:0});
 heroMotionObserver.observe(animatedHero);
}
