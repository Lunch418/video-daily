
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=p=>1-Math.pow(1-p,3);
const prog=(t,t0,d)=>ease(clamp((t-t0)/d));
const T=k=>0.4+k*0.4;
const words=s=>s.trim().split(/\s+/);
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const OR='#e8946a',TL='#5fb59f',RD='#e0706a',DM='#565965';
function el(par,html,css,cls){const d=document.createElement('div');d.className='abs '+(cls||'');d.style.cssText=css||'';d.innerHTML=html||'';par.appendChild(d);return d}
const pop=(e,p)=>{e.style.opacity=p;e.style.transform=`translateY(${(1-p)*18}px)`};
const NS='http://www.w3.org/2000/svg';
function mk(tag,attrs,par){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(par)par.appendChild(e);return e}
function mkSvg(st){const s=mk('svg',{width:720,height:1280});s.style.cssText='position:absolute;left:0;top:0';st.appendChild(s);return s}

/* ---- изометрический сервер ---- */
const C30=Math.cos(Math.PI/6),S30=0.5,SW=130,SD=96,SH=34;
const P=(x,y,z)=>[(x-y)*C30,(x+y)*S30-z];
const pts=a=>a.map(p=>p.join(',')).join(' ');
function srv(svg,color,dashed){
 const g=mk('g',{},svg);
 const w=SW,d=SD,h=SH;
 const faces=[
  [[P(0,d,0),P(w,d,0),P(w,d,h),P(0,d,h)],.035],
  [[P(w,0,0),P(w,d,0),P(w,d,h),P(w,0,h)],.10],
  [[P(0,0,h),P(w,0,h),P(w,d,h),P(0,d,h)],.07]];
 const polys=faces.map(f=>mk('polygon',{points:pts(f[0]),fill:`rgba(236,233,227,${f[1]})`,stroke:color,'stroke-width':1.6,'stroke-linejoin':'round','stroke-dasharray':dashed?'6 5':''},g));
 const slits=[1,2,3].map(k=>{const a=P(w*.12,d,h*k/4),b=P(w*.62,d,h*k/4);return mk('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:color,'stroke-opacity':.55,'stroke-width':1.2},g)});
 const lp=P(w*.85,d,h*.5);const led=mk('circle',{cx:lp[0],cy:lp[1],r:3.8,fill:color},g);
 const offx=(w-d)/2*C30,offy=((w+d)*S30-h)/2;
 const o={g,led,polys,slits,color,
  place(cx,cy,sc){g.setAttribute('transform',`translate(${cx},${cy}) scale(${sc}) translate(${-offx},${-offy})`)},
  setColor(c,ledc){polys.forEach(p=>p.setAttribute('stroke',c));slits.forEach(s=>s.setAttribute('stroke',c));led.setAttribute('fill',ledc||c)},
  op(v){g.setAttribute('opacity',v)}};
 return o;
}
function cross(svg,cx,cy){const g=mk('g',{stroke:RD,'stroke-width':5,'stroke-linecap':'round'},svg);
 mk('line',{x1:cx-26,y1:cy-26,x2:cx+26,y2:cy+26},g);mk('line',{x1:cx-26,y1:cy+26,x2:cx+26,y2:cy-26},g);return g}
function flow(svg,n,color,shape){
 const a=[];for(let i=0;i<n;i++){a.push(shape==='rect'?mk('rect',{width:20,height:10,rx:3,fill:color},svg):mk('circle',{r:5,fill:color},svg))}
 return {a,upd(t,x1,x2,y,on){a.forEach((e,i)=>{const p=((t*0.45+i/n)%1);const x=x1+(x2-x1)*p,v=on?Math.sin(p*Math.PI):0;
  if(e.tagName==='rect'){e.setAttribute('x',x-10);e.setAttribute('y',y-5)}else{e.setAttribute('cx',x);e.setAttribute('cy',y)}
  e.setAttribute('opacity',v)})}};
}

/* ---- терминал ---- */
function term(st,o){
 const fs=o.fs||17,lh=fs*1.55,n=o.lines.length,h=34+n*lh+20;
 const box=el(st,`<div class="th"><i></i><i></i><i></i><span>${o.title}</span></div><div class="tb" style="font-size:${fs}px;line-height:${lh}px"></div>`,`left:${o.x||20}px;top:${o.y}px;width:${o.w||680}px;height:${h}px`,'t2');
 const body=box.querySelector('.tb');const first=Math.min(...o.lines.map(l=>l.at));
 return {h,upd(t){
  pop(box,prog(t,first-0.35,0.4));let html='';
  for(const l of o.lines){if(t<l.at)continue;
   if(l.k==='c'){const d=l.dur||l.s.length*0.03;const k=Math.floor(clamp((t-l.at)/d)*l.s.length);
    html+=`<div>${l.p===false?'':'<span class="p">$</span> '}${esc(l.s.slice(0,k))}${k<l.s.length?'▌':''}</div>`}
   else html+=`<div class="${l.k}">${esc(l.s)}</div>`}
  body.innerHTML=html}};
}
const c=(s,at,dur,p)=>({k:'c',s,at,dur,p});
const o_=(s,at)=>({k:'o',s,at}),h_=(s,at)=>({k:'h',s,at}),e_=(s,at)=>({k:'e',s,at});

const SC=[];