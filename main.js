(()=>{
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
document.documentElement.classList.add('js');
const $=(s,c=document)=>[...c.querySelectorAll(s)];
// nav bg
const nav=document.querySelector('nav');
// hero parallax: scroll + pointer
const layers=$('.layer');let mx=0,my=0,tx=0,ty=0,ticking=false;
function frame(){
  ticking=false;
  const y=Math.min(scrollY,innerHeight*1.2);
  nav.classList.toggle('s',scrollY>40);
  if(reduce)return;
  tx+=(mx-tx)*.08;ty+=(my-ty)*.08;
  layers.forEach(l=>{
    const d=parseFloat(l.dataset.d);
    l.style.transform=`translate3d(${tx*d*40}px,${y*d*.6+ty*d*20}px,0)`;
  });
  const h=document.querySelector('.hero .wrap');
  if(h){h.style.transform=`translateY(${y*.25}px)`;h.style.opacity=Math.max(0,1-y/(innerHeight*.9))}
  if(Math.abs(mx-tx)>.001||Math.abs(my-ty)>.001)req();
}
function req(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
addEventListener('scroll',req,{passive:true});
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;req()},{passive:true});
req();
// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
$('.rv').forEach(el=>io.observe(el));
setTimeout(()=>$('.rv').forEach(el=>el.classList.add('in')),3500);
addEventListener('scroll',()=>{$('.rv:not(.in)').forEach(el=>{if(el.getBoundingClientRect().top<innerHeight*.9)el.classList.add('in')})},{passive:true});
// card tilt + glow
$('.card').forEach(c=>{
  c.addEventListener('pointermove',e=>{
    const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');
    if(!reduce&&e.pointerType==='mouse')c.style.transform=`perspective(800px) rotateX(${(.5-y)*8}deg) rotateY(${(x-.5)*8}deg) translateY(-6px)`;
  });
  c.addEventListener('pointerleave',()=>c.style.transform='');
});
// button ripple
$('.btn').forEach(b=>b.addEventListener('pointerdown',e=>{
  const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height),d=document.createElement('span');
  d.className='rip';d.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;
  b.appendChild(d);setTimeout(()=>d.remove(),600);
}));
// before/after
$('.cmp').forEach(c=>{
  const i=c.querySelector('input'),t=c.querySelector('.top'),b=c.querySelector('.bar');
  const set=v=>{t.style.clipPath=`inset(0 ${100-v}% 0 0)`;b.style.left=v+'%'};
  i.addEventListener('input',()=>set(i.value));set(50);
});
// form
const f=document.querySelector('form');
f&&f.addEventListener('submit',e=>{
  e.preventDefault();
  // TODO: brancher un vrai service (Formspree, Netlify Forms...)
  const d=new FormData(f);
  location.href='mailto:contact@example.com?subject='+encodeURIComponent('Demande de devis – '+d.get('nom'))+'&body='+encodeURIComponent(`Nom : ${d.get('nom')}\nTéléphone : ${d.get('tel')}\n\n${d.get('besoin')}`);
  f.querySelector('.ok').style.display='block';
});
// ancres : défilement fiable même dans une visionneuse/iframe
$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const t=a.getAttribute('href')==='#top'?document.body:document.querySelector(a.getAttribute('href'));
  if(!t)return;e.preventDefault();
  const y=t===document.body?0:t.getBoundingClientRect().top+scrollY-60;
  scrollTo({top:y,behavior:reduce?'auto':'smooth'});
}));
// téléphone : sur ordinateur (sans appli d'appel), copie le numéro
const desktop=!matchMedia('(pointer:coarse)').matches;
if(desktop)$('a[href^="tel:"]').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();
  const n=a.getAttribute('href').replace('tel:','');
  (navigator.clipboard?navigator.clipboard.writeText(n):Promise.reject()).catch(()=>{});
  toast('Numéro copié : 06 01 02 03 04');
}));
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('on'));setTimeout(()=>{t.classList.remove('on');setTimeout(()=>t.remove(),400)},2500)}

// ===== animations souris (ordinateur uniquement) =====
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce){
  const mk=c=>{const d=document.createElement('div');d.className=c;document.body.appendChild(d);return d};
  const glow=mk('fx-glow'),ring=mk('fx-ring');
  let px=innerWidth/2,py=innerHeight/2,gx=px,gy=py,rx=px,ry=py,last=0,seen=false;
  const logo=document.querySelector('.hero-logo'),leaves=$('.leaf'),mags=$('.btn:not(.call),.tel'),hero=document.querySelector('.hero');
  const root=document.documentElement;
  addEventListener('pointermove',e=>{
    px=e.clientX;py=e.clientY;
    if(!seen){seen=true;glow.style.opacity=1;ring.style.opacity=1}
    root.style.setProperty('--bx',(-(px/innerWidth-.5)*40)+'px');
    root.style.setProperty('--by',(-(py/innerHeight-.5)*40)+'px');
    const n=performance.now();
    if(n-last>55){last=n;spark(px,py)}
    ring.classList.toggle('big',!!e.target.closest('a,button,.card,.cmp,input,textarea,.gal div'));
  },{passive:true});
  addEventListener('pointerdown',e=>{const d=mk('fx-click');d.style.left=e.clientX+'px';d.style.top=e.clientY+'px';setTimeout(()=>d.remove(),700)});
  function spark(x,y){const s=mk('fx-spark');s.style.left=x-4+'px';s.style.top=y-4+'px';
    s.style.setProperty('--dx',(Math.random()*60-30)+'px');s.style.setProperty('--dy',(Math.random()*60-10)+'px');setTimeout(()=>s.remove(),900)}
  (function loop(){
    gx+=(px-gx)*.08;gy+=(py-gy)*.08;rx+=(px-rx)*.22;ry+=(py-ry)*.22;
    glow.style.transform=`translate3d(${gx}px,${gy}px,0)`;
    ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;
    // logo 3D qui suit la souris
    if(logo&&scrollY<innerHeight){
      const r=logo.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      const dx=Math.max(-1,Math.min(1,(px-cx)/(innerWidth/2))),dy=Math.max(-1,Math.min(1,(py-cy)/(innerHeight/2)));
      logo.style.transform=`perspective(900px) rotateY(${dx*16}deg) rotateX(${-dy*16}deg) scale(1.03)`;
      logo.style.boxShadow=`${-dx*24}px ${24-dy*20}px 70px -18px rgba(0,0,0,.75),0 0 60px rgba(108,192,74,${.12+Math.abs(dx)*.2})`;
      $('.hero h1,.hero .eyebrow,.hero p').forEach((t,i)=>t.style.transform=`translate(${dx*(6+i*3)}px,${dy*(4+i*2)}px)`);
      // feuilles repoussées
      leaves.forEach(l=>{const b=l.getBoundingClientRect(),lx=b.left+b.width/2,ly=b.top+b.height/2,vx=lx-px,vy=ly-py,d=Math.hypot(vx,vy);
        if(d<220){const f=(220-d)/220*90;l.style.translate=`${vx/d*f}px ${vy/d*f}px`}else l.style.translate='0 0'});
    }
    requestAnimationFrame(loop);
  })();
  // boutons magnétiques
  mags.forEach(m=>{
    m.addEventListener('pointermove',e=>{const r=m.getBoundingClientRect();
      m.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`});
    m.addEventListener('pointerleave',()=>m.style.transform='');
  });
  // images de la galerie : léger suivi de la souris
  $('.gal div,.cmp').forEach(g=>{
    g.addEventListener('pointermove',e=>{const r=g.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      g.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg) scale(1.02)`});
    g.addEventListener('pointerleave',()=>g.style.transform='');
  });
}
})();
