/* Тема navy. Проверка узла перед возвратом. Выводы openssl, curl, mountpoint сняты реально; пути заменены нейтральными. */
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


const ROW=(st,y,h,a,b,k)=>{const cd=card(st,40,y,640,h,'border-radius:14px');
 el(cd,a,'left:28px;top:14px;font-size:30px;line-height:40px;font-weight:700;white-space:nowrap');
 if(b)el(cd,b,'left:28px;top:'+(h-44)+'px;font-size:21px;line-height:30px;color:#8d9bd1;white-space:nowrap');return cd};
const CHK=(cd,on)=>{cd.style.borderColor=on?'#35b02a':'#f6b93b';cd.style.borderWidth='2px'};

/* 1 */
SC.push({tag:'задача',title:['Можно ли вернуть','узел в строй?'],
narr:'Работы на web-1 закончены. Можно сразу вернуть его в балансировку? Нет: сначала проверим узел по пяти пунктам.',
build(st,K){
 const tp=topo(st,250);
 const q=el(st,'?','left:260px;top:640px;width:200px;text-align:center;font-size:200px;line-height:220px;font-weight:700;color:#fbbf24');
 return t=>{tp.upd(t,{s1:'MAINT',s2:'UP'});
  const p=prog(t,K('сразу'),0.45);q.style.opacity=p;q.style.transform=`scale(${0.6+0.4*p})`;}}});

/* 2 */
SC.push({tag:'почему',title:['nginx сам','не проверит'],
narr:'У nginx Open Source нет активных проверок: они есть только в Plus. Он узнаёт о проблеме на реальных запросах.',
build(st,K){
 const a=ROW(st,264,150,'Plus: active health_check','узел проверяется заранее, по таймеру');
 const b=ROW(st,444,190,'Open Source: пассивно','max_fails=1, fail_timeout=10s (по умолчанию)');
 const n=txc(st,'проверку узла делаем мы',360,740,34,'font-weight:700;color:#fbbf24');
 const n2=txc(st,'до возврата, а не после',360,792,26,'color:#8d9bd1');
 return t=>{pop(a,prog(t,K('Plus'),0.4));pop(b,prog(t,K('реальных')-0.6,0.4));
  a.style.opacity=Math.min(a.style.opacity||1,1);
  pop(n,prog(t,K('проблеме'),0.4));pop(n2,prog(t,K('проблеме')+0.3,0.4));}}});

/* 3 */
SC.push({tag:'пункт 1',title:['Порт и','health'],
narr:'Пункт один: порт и health. Код 200 значит, что узел жив. Код 000 значит, что порт не отвечает.',
build(st,K){
 const tp=topo(st,250);
 const lab=txc(st,'GET http://web-1:8080/health',360,680,24,'color:#8d9bd1');
 const tm=nterm(st,{y:710,h:34+3*39,pad:17,lh:39,fs:22,lines:[c("curl -s -o /dev/null -w '%{http_code}'",0.4,1.2),h_('200',K('200')),e_('000   # curl не подключился',K('000'))]});
 return t=>{tp.upd(t,{s1:'MAINT',s2:'UP'});pop(lab,prog(t,0.3,0.4));tm.upd(t);}}});

/* 4 */
SC.push({tag:'пункт 2',title:['Хранилище','смонтировано?'],
narr:'Пункт два: хранилище. Проверь mountpoint: если точки нет, контейнер увидит пустой каталог вместо данных.',
build(st,K){
 const a=ROW(st,264,80,'Проверь на хосте и в контейнере','');
 const tm=nterm(st,{y:370,h:34+4*39,pad:17,lh:39,fs:22,lines:[c('mountpoint /srv/storage',0.4,1.0),h_('/srv/storage is a mountpoint',K('mountpoint')+0.6),c('mountpoint /srv/old',K('точки')-0.8,1.0),e_('/srv/old is not a mountpoint',K('пустой'))]});
 const n=txc(st,'в контейнере тот же вопрос, внутри',360,700,24,'color:#8d9bd1');
 return t=>{pop(a,prog(t,0.2,0.4));tm.upd(t);pop(n,prog(t,K('контейнер'),0.4));}}});

/* 5 */
SC.push({tag:'пункт 3',title:['Срок','сертификата'],
narr:'Пункт три: сертификат. Команда openssl -checkend спрашивает, проживёт ли он ещё заданное число секунд. Ответ — текстом и кодом возврата.',
build(st,K){
 const a=ROW(st,264,80,'-checkend N: хватит ли N секунд?','');
 const tm=nterm(st,{y:370,h:34+4*39,pad:17,lh:39,fs:22,lines:[c('openssl x509 -checkend 2592000 …',0.4,1.2),h_('Certificate will not expire',K('текстом')),c('openssl x509 -checkend 8640000 …',K('текстом')+1.0,1.2),e_('Certificate will expire',K('возврата'))]});
 const n=txc(st,'2592000 с = 30 дней',360,700,26,'color:#8d9bd1');
 const n2=txc(st,'код возврата 0 — ок, 1 — истекает',360,745,26,'color:#8d9bd1');
 return t=>{pop(a,prog(t,K('checkend'),0.4));tm.upd(t);pop(n,prog(t,K('секунд'),0.4));pop(n2,prog(t,K('возврата'),0.4));}}});

/* 6 */
SC.push({tag:'пункт 4',title:['Логи','без свежих ошибок'],
narr:'Пункт четыре: логи. В error.log nginx и в логах контейнера не должно быть свежих ошибок после запуска.',
build(st,K){
 const a=ROW(st,264,150,'error.log у nginx','после запуска — без [error]');
 const b=ROW(st,444,190,'Логи контейнера php-fpm','podman logs --since 10m web');
 const n=txc(st,'смотрим только то, что после запуска',360,740,26,'color:#8d9bd1');
 return t=>{pop(a,prog(t,K('error'),0.4));pop(b,prog(t,K('контейнера'),0.4));pop(n,prog(t,K('свежих'),0.4));
  CHK(a,t>K('error')+1.0);CHK(b,t>K('контейнера')+1.2);}}});

/* 7 */
SC.push({tag:'пункт 5',title:['Вернуть и','присмотреться'],
narr:'Пункт пять: возврат. Убери down, сделай nginx -t и reload. Потом смотри, что запросы пошли и ошибок нет.',
build(st,K){
 const tp=topo(st,250);
 const a=ROW(st,650,80,'nginx -t && nginx -s reload','');
 const b=ROW(st,745,80,'запросы идут на web-1, 5xx нет','');
 const c3=ROW(st,840,80,'что-то не так: снова down','');
 return t=>{const r=t>K('reload')+0.4;tp.upd(t,{s1:r?'UP':'DOWN',s2:'UP'});
  pop(a,prog(t,K('Убери'),0.4));pop(b,prog(t,K('запросы'),0.4));pop(c3,prog(t,K('ошибок')+0.4,0.4));}}});

/* 8 */
SC.push({tag:'итог',title:['Сделай','скрипт'],
narr:'Сложи всё в скрипт: если хоть одна проверка не прошла, он вернёт ненулевой код. Это первый шаг к Ansible.',
build(st,K){
 const it=['health: 200','mountpoint: хранилище','checkend: сертификат','логи: без ошибок','после возврата: следим'];
 const rows=it.map((s,i)=>{const cd=card(st,60,254+i*105,600,88,'border-radius:14px');
  el(cd,String(i+1),'left:24px;top:16px;width:54px;height:54px;border-radius:50%;background:#fbbf24;color:#0a1236;text-align:center;line-height:54px;font-size:28px;font-weight:700');
  el(cd,s,'left:104px;top:22px;font-size:30px;line-height:44px;font-weight:700;white-space:nowrap');return cd});
 const h=txc(st,'precheck.sh  →  exit 0 / exit 1',360,815,32,'font-weight:700;color:#fbbf24');
 return t=>{rows.forEach((r,i)=>pop(r,prog(t,0.3+0.5*i,0.4)));pop(h,prog(t,K('ненулевой'),0.4));}}});
