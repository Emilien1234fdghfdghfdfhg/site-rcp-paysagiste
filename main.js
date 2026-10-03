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
})();
