const TM=window.TIMING||null;
const DUR=TM?TM.durs:SC.map(s=>0.4+words(s.narr).length*0.4+0.8);
let cur=null;
const stage=document.getElementById('stage');
function setScene(i){
 stage.innerHTML='';
 const w=words(SC[i].narr);
 const K=(sub,nth=0)=>{let n=0;for(let j=0;j<w.length;j++){if(w[j].toLowerCase().includes(sub.toLowerCase())){if(n===nth)return TM?TM.words[i][j]:T(j);n++}}throw new Error('no word '+sub+' in scene '+i)};
 document.getElementById('cnt').textContent=`${String(i+1).padStart(2,'0')} / ${String(SC.length).padStart(2,'0')}`;
 document.getElementById('prog').innerHTML=SC.map((_,k)=>`<i style="background:${k<i?'#3aa82e':(k===i?'#fbbf24':'#2a3a85')}"></i>`).join('');
 const t=SC[i].title||['',''];document.getElementById('ttl').innerHTML=`${esc(t[0])}<b>${esc(t[1])}</b>`;
 const W=j=>TM?TM.words[i][j]:T(j);   // время начала слова по номеру
 cur={i,upd:SC[i].build(stage,K,W),w};
}
function draw(t){
 const i=cur.i,D=DUR[i],w=cur.w;
 let k=Math.floor((t-0.4)/0.4);if(TM){k=-1;const wt=TM.words[i];for(let q=0;q<wt.length;q++){if(wt[q]<=t)k=q;else break}}
 const cap=document.getElementById('cap');
 if(k<0){cap.innerHTML=''}else{k=Math.min(k,w.length-1);const c0=Math.floor(k/3)*3;
  /* субтитры по 3 слова: сказанные белые, текущее жёлтое, будущие невидимы (место занято, текст не прыгает) */
  cap.innerHTML=w.slice(c0,c0+3).map((x,j)=>{const idx=c0+j;const col=idx<k?'#fff':'#fbbf24';return `<span style="color:${col};visibility:${idx>k?'hidden':'visible'}">${esc(x)}</span>`}).join(' ')}
 const FO=i===SC.length-1?0.5:0.3;   // последняя сцена гаснет дольше
 const fade=Math.min(prog(t,0,0.3),1-clamp((t-(D-FO))/FO));
 document.getElementById('ttl').style.opacity=Math.min(prog(t,0.05,0.4),1-clamp((t-(D-FO))/FO));
 cur.upd(t);
 stage.style.opacity=fade;
}
