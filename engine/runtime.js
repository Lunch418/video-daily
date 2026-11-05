const TM=window.TIMING||null;
const DUR=TM?TM.durs:SC.map(s=>0.4+words(s.narr).length*0.4+0.8);
let cur=null;
function setScene(i){
 stage.innerHTML='';
 const w=words(SC[i].narr);
 const K=(sub,nth=0)=>{let n=0;for(let j=0;j<w.length;j++){if(w[j].toLowerCase().includes(sub.toLowerCase())){if(n===nth)return TM?TM.words[i][j]:T(j);n++}}throw new Error('no word '+sub+' in scene '+i)};
 document.getElementById('cnt').textContent=`этап ${i+1}/${SC.length} · ${SC[i].tag}`;
 document.getElementById('prog').innerHTML=SC.map((_,k)=>`<i style="background:${k<i?'#3d7a6b':(k===i?'#e8946a':'#262833')}"></i>`).join('');
 cur={i,upd:SC[i].build(stage,K),w};
}
const stage=document.getElementById('stage');
function draw(t){
 const i=cur.i,D=DUR[i];const w=cur.w;
 let k=Math.floor((t-0.4)/0.4);if(TM){k=-1;const wt=TM.words[i];for(let q=0;q<wt.length;q++){if(wt[q]<=t)k=q;else break}}const cap=document.getElementById('cap');
 if(k<0){cap.innerHTML=''}else{k=Math.min(k,w.length-1);const c0=Math.floor(k/6)*6;
  cap.innerHTML=w.slice(c0,c0+6).map((x,j)=>{const idx=c0+j;const col=idx<k?'#ece9e3':(idx===k?'#e8946a':'#565965');return `<span style="color:${col}">${esc(x)}</span>`}).join(' ');}
 cur.upd(t);
 stage.style.opacity=Math.min(prog(t,0,0.3),1-clamp((t-(D-0.3))/0.3));
}
