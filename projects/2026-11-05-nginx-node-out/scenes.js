/* Тема navy. Вывод узла из nginx-балансировки. Выводы nginx -t сокращены (…), текст по документации. */
const GRY='#7b87b8',AMBR='#fbbf24';
/* схема: запросы -> lb -> web-1, web-2. Возвращает {upd(t,o)} o:{s1,s2,f1,f2,fl} */
function topo(st,y0){
 const svg=mkSvg(st);
 const ly=y0+70, wy=y0+190;
 const l1=mk('line',{x1:360,y1:ly+70,x2:185,y2:wy,stroke:'#2c43a6','stroke-width':2.5},svg);
 const l2=mk('line',{x1:360,y1:ly+70,x2:535,y2:wy,stroke:'#2c43a6','stroke-width':2.5},svg);
 const dIn=dots(svg,3,GR),d1=dots(svg,4,GR),d2=dots(svg,4,GR);
 const node=(x,y,w,h,name,col)=>{const n=card(st,x,y,w,h,'border-radius:14px;border-color:#3452b0');
  n.innerHTML=`<div style="text-align:center;margin-top:14px;font-size:28px;line-height:36px;font-weight:700;color:${col||'#fff'}">${name}</div><div class="st" style="text-align:center;margin-top:6px;font-size:22px;line-height:28px;font-weight:700;color:#84fc4c;letter-spacing:.5px">UP</div>`;return n};
 const q=txc(st,'запросы',360,y0+16,24,'color:#8d9bd1');
 const lb=node(216,ly,288,70,'lb · nginx','#fbbf24');lb.querySelector('.st').style.display='none';lb.firstChild.style.marginTop='14px';
 const w=[node(90,wy,190,100,'web-1'),node(440,wy,190,100,'web-2')];
 const COL={UP:[GR,'#3452b0','#2c43a6',''],DOWN:[GRY,'#4a5788','#4a5788','7 6'],MAINT:[AMBR,'#ecbd36','#4a5788','7 6']};
 return {w,lb,upd(t,o){
  const a=prog(t,0.1,0.4);[q,lb,w[0],w[1]].forEach(e=>pop(e,a));
  [l1,l2].forEach(l=>l.setAttribute('opacity',a));
  [o.s1,o.s2].forEach((s,i)=>{const c=COL[s],n=w[i],st=n.querySelector('.st');
   st.textContent=s==='MAINT'?'РАБОТЫ':s;st.style.color=c[0];n.style.borderColor=c[1];n.style.borderWidth=s==='UP'?'1.5px':'2px';
   const l=i?l2:l1;l.setAttribute('stroke',c[2]);l.setAttribute('stroke-dasharray',c[3]);});
  dIn.upd(t,360,y0+30,360,ly-2,t>0.5&&!o.nofl);
  d1.upd(t,360,ly+71,185,wy-1,t>0.5&&o.s1==='UP'&&!o.nofl);
  d2.upd(t,360,ly+71,535,wy-1,t>0.5&&o.s2==='UP'&&!o.nofl,o.s1!=='UP'?.5:.35);
 }}}

/* ---------- 1. задача ---------- */
SC.push({tag:'задача',title:['Вывести узел','из балансировки'],
narr:'Надо поработать на web-1, а сайт должен жить. Как вывести узел из балансировки и не уронить запросы?',
build(st,K){
 const tp=topo(st,250);
 const q=el(st,'?','left:260px;top:640px;width:200px;text-align:center;font-size:200px;line-height:220px;font-weight:700;color:#fbbf24');
 return t=>{tp.upd(t,{s1:'UP',s2:'UP'});
  const p=prog(t,K('Как'),0.45);q.style.opacity=p;q.style.transform=`scale(${0.6+0.4*p})`;}}});

/* ---------- 2. down в upstream ---------- */
SC.push({tag:'шаг 1',title:['Пометить узел','как down'],
narr:'В upstream дописываем down у web-1. Для nginx это сервер, который недоступен всегда. Пока правим только файл.',
build(st,K){
 const tp=topo(st,250);
 const tm=nterm(st,{y:690,h:34+4*39,pad:17,lh:39,fs:22,lines:[o_('upstream web {',0.5),o_('    server web-1:8080 down;',K('down')),o_('    server web-2:8080;',K('down')+0.3),o_('}',K('down')+0.5)]});
 tm.lines=null;
 return t=>{tp.upd(t,{s1:'UP',s2:'UP'});tm.upd(t);}}});

/* ---------- 3. nginx -t ---------- */
SC.push({tag:'шаг 2',title:['Проверить','конфиг'],
narr:'Сначала nginx -t: он проверяет конфиг, не трогая работающие процессы. Ошибки — правим файл, нет ошибок — идём дальше.',
build(st,K){
 const tp=topo(st,250);
 const tm=nterm(st,{y:710,h:34+3*39,pad:17,lh:39,fs:22,lines:[c('nginx -t',0.4,0.8),o_('nginx: … syntax is ok',K('проверяет')),h_('nginx: … test is successful',K('Ошибки'))]});
 const ok=txc(st,'✓ конфиг прошёл проверку',360,680,26,'font-weight:700;color:#84fc4c');
 return t=>{tp.upd(t,{s1:'UP',s2:'UP'});tm.upd(t);pop(ok,prog(t,K('нет'),0.4));}}});

/* ---------- 4. reload ---------- */
SC.push({tag:'шаг 3',title:['Применить:','reload'],
narr:"Делаем reload. Новые worker'ы берут новый конфиг, старые доделывают принятые запросы. Новые запросы идут на web-2.",
build(st,K){
 const tp=topo(st,250);
 const tm=nterm(st,{y:710,h:34+1*39,pad:17,lh:39,fs:22,lines:[c('nginx -s reload',0.4,0.9)]});
 const nt=card(st,60,810,599,110,'border-radius:14px');
 nt.innerHTML=`<div style="padding:16px 24px;font-size:23px;line-height:36px;color:#e6ebff"><span style="color:#8d9bd1">старые worker'ы:</span> доделывают<br><span style="color:#8d9bd1">новые worker'ы:</span> новый конфиг</div>`;
 return t=>{const r=t>K('reload')+0.8;
  tp.upd(t,{s1:r?'DOWN':'UP',s2:'UP'});tm.upd(t);pop(nt,prog(t,K('Новые'),0.4));}}});

/* ---------- 5. работы ---------- */
SC.push({tag:'работы',title:['Узел свободен,','можно работать'],
narr:'Теперь web-1 свободен: обновляй, перезагружай, правь. Трафик целиком у web-2, поэтому следи за его нагрузкой.',
build(st,K){
 const tp=topo(st,250);
 const chip=(x,w,txt,i)=>{const e=card(st,x,700,w,70,'border-radius:14px;border-color:#ecbd36');
  e.innerHTML=`<div style="text-align:center;line-height:67px;font-size:26px;font-weight:700;color:#fbbf24">${txt}</div>`;return e};
 const ch=[chip(60,170,'update'),chip(275,170,'reboot'),chip(490,170,'правки')];
 const lo=txc(st,'web-2 держит весь трафик',360,850,28,'font-weight:700;color:#84fc4c');
 return t=>{tp.upd(t,{s1:'MAINT',s2:'UP'});
  ch.forEach((e,i)=>pop(e,prog(t,K('обновляй')+0.3*i,0.4)));pop(lo,prog(t,K('Трафик'),0.4));}}});

/* ---------- 6. чек-лист перед возвратом ---------- */
SC.push({tag:'проверка',title:['Перед возвратом','проверь узел'],
narr:'Перед возвратом проверь узел: health, diag-страницу, логи и срок сертификатов. Только когда всё чисто, возвращай в балансировку.',
build(st,K){
 const items=[['Health','узел отвечает на проверку','health'],['Diag-страница','версии, диск, точки NFS','diag'],['Логи','нет ошибок после запуска','логи'],['Сертификаты','срок и синхронизация','сертификатов']];
 const rows=items.map(([a,b,k],i)=>{const cd=card(st,40,264+i*130,640,110,'border-radius:14px');
  const bd=el(cd,'','left:24px;top:27px;width:56px;height:56px;border-radius:50%;text-align:center;line-height:56px;font-size:28px;font-weight:700');
  el(cd,a,'left:104px;top:16px;font-size:32px;line-height:40px;font-weight:700;white-space:nowrap');
  el(cd,b,'left:104px;top:60px;font-size:22px;line-height:30px;color:#8d9bd1;white-space:nowrap');
  return {cd,bd,k}});
 return t=>{rows.forEach(({cd,bd,k},i)=>{const at=K(k);pop(cd,prog(t,at,0.4));
  const done=t>at+0.6;cd.style.borderColor=done?'#35b02a':'#f6b93b';cd.style.borderWidth='2px';
  bd.style.background=done?'#35a824':'#fbbf24';bd.style.color=done?'#fff':'#0a1236';bd.textContent=done?'✓':String(i+1)});}}});

/* ---------- 7. возврат ---------- */
SC.push({tag:'возврат',title:['Вернуть','в балансировку'],
narr:'Убираем down, снова nginx -t и reload. Новые запросы снова делятся между web-1 и web-2.',
build(st,K){
 const tp=topo(st,250);
 const tm=nterm(st,{y:700,h:34+3*39,pad:17,lh:39,fs:22,lines:[o_('# у web-1 убрали down',0.4),c('nginx -t && nginx -s reload',K('снова')-0.6,1.2),h_('nginx: … test is successful',K('снова')+0.9)]});
 return t=>{const r=t>K('снова')+0.9;
  tp.upd(t,{s1:r?'UP':'DOWN',s2:'UP'});tm.upd(t);}}});

/* ---------- 8. итог ---------- */
SC.push({tag:'итог',title:['Порядок','запомни'],
narr:'Порядок такой: down, nginx -t, reload, работы, проверка, возврат. Отработай его на стенде из двух контейнеров.',
build(st,K){
 const it=['down в upstream','nginx -t','nginx -s reload','работы на узле','проверка узла','убрать down, reload'];
 const rows=it.map((s,i)=>{const cd=card(st,60,254+i*110,600,92,'border-radius:14px');
  el(cd,String(i+1),'left:24px;top:18px;width:54px;height:54px;border-radius:50%;background:#fbbf24;color:#0a1236;text-align:center;line-height:54px;font-size:28px;font-weight:700');
  el(cd,s,'left:104px;top:24px;font-size:32px;line-height:44px;font-weight:700;white-space:nowrap');return cd});
 const hint=txc(st,'тренируйся на стенде: 2 контейнера',360,935,24,'color:#8d9bd1');
 return t=>{rows.forEach((r,i)=>pop(r,prog(t,0.3+0.8*i,0.4)));pop(hint,prog(t,K('стенде'),0.4));}}});
