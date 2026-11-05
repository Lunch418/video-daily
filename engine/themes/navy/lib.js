/* ---- тема navy: помощники ---- */
const YL='#fbbf24',GR='#84fc4c',GD='#3aa82e',BL='#6cb4fa',RE='#ff656b',MUT='#8d9bd1';
const lerp=(a,b,p)=>a+(b-a)*p;
const rgbMix=(a,b,p)=>{const h=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));const x=h(a),y=h(b);return '#'+x.map((v,i)=>Math.round(lerp(v,y[i],p)).toString(16).padStart(2,'0')).join('')};
/* карточка */
function card(st,x,y,w,h,css){return el(st,'',`left:${x}px;top:${y}px;width:${w}px;height:${h}px;${css||''}`,'card')}
/* светодиод со свечением */
function led(par,x,y,r){const d=el(par,'',`left:${x-r}px;top:${y-r}px;width:${2*r}px;height:${2*r}px;border-radius:50%`);
 d.set=c=>{d.style.background=c;d.style.boxShadow=`0 0 ${r*1.6}px ${c}`};d.set(GR);return d}
/* мини-сервер: карточка со светодиодом и двумя полосками (пропорции сняты с образца) */
function miniSrv(par,x,y,w,h){
 const b=el(par,'',`left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:12px;background:#132156;border:1.5px solid #2d438c`);
 const l=led(b,33,h/2,9);
 const bar=(dy,k)=>el(b,'',`left:64px;top:${h/2+dy-4.5}px;width:${w*k}px;height:9px;border-radius:5px;background:#2f43a0`);
 bar(-12,.54);bar(10,.33);
 return {el:b,led:l,set(c){l.set(c)},op(v){b.style.opacity=v}};
}
/* текст по левому краю x с вертикальным центром cy / по центру cx */
const tx=(par,html,x,cy,fs,css)=>{const lh=Math.round(fs*1.3);return el(par,html,`left:${x}px;top:${cy-lh/2}px;font-size:${fs}px;line-height:${lh}px;white-space:nowrap;${css||''}`)};
const txc=(par,html,cx,cy,fs,css)=>{const lh=Math.round(fs*1.3);return el(par,html,`left:${cx-400}px;width:800px;text-align:center;top:${cy-lh/2}px;font-size:${fs}px;line-height:${lh}px;white-space:nowrap;${css||''}`)};
/* терминал без шапки: строки c() печатается, o_/h_/e_ как в базовой теме, y_ — жёлтая */
const y_=(s,at)=>({k:'y',s,at});
function nterm(st,o){
 const fs=o.fs||23,lh=o.lh||39.5;
 const box=el(st,'<div class="tb"></div>',`left:${o.x||60}px;top:${o.y}px;width:${o.w||599}px;height:${o.h}px;padding:${o.pad||17}px 27px;font-size:${fs}px;line-height:${lh}px`,'nt');
 const body=box.querySelector('.tb');const first=Math.min(...o.lines.map(l=>l.at));
 const col={c:'#6bdc4b',o:'#9aa6d6',h:'#6cd4bd',e:'#f57176',y:'#fbbf24'};
 return {upd(t){
  pop(box,prog(t,first-0.35,0.4));let html='';
  for(const l of o.lines){if(t<l.at)continue;
   if(l.k==='c'){const d=l.dur||l.s.length*0.03;const k=Math.floor(clamp((t-l.at)/d)*l.s.length);
    html+=`<div style="color:${col.c}">${l.p===false?'':'$ '}${esc(l.s.slice(0,k))}</div>`}
   else html+=`<div style="color:${col[l.k]}">${esc(l.s)}</div>`}
  body.innerHTML=html}};
}
/* поток точек вдоль отрезка (x1,y1)->(x2,y2) внутри svg */
function dots(svg,n,color){const a=[];for(let i=0;i<n;i++)a.push(mk('circle',{r:5.5,fill:color},svg));
 return {upd(t,x1,y1,x2,y2,on,spd){a.forEach((e,i)=>{const p=((t*(spd||.35)+i/n)%1);e.setAttribute('cx',x1+(x2-x1)*p);e.setAttribute('cy',y1+(y2-y1)*p);e.setAttribute('opacity',on?1:0)})}}}
