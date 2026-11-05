/* Тема navy. Спецсимволы (стрелка, галочка, предупреждение, тире) записаны в строках JS escape-кодами: обратная косая, u и четыре hex-цифры. */
const RED='#ff656b',AMB='#fbbf24';

/* ---------- 1. проблема ---------- */
SC.push({tag:'проблема',title:['Ядро на проде','без простоя?'],
narr:'Нужно обновить ядро на боевом сервере. Но сайт не должен лечь. Как это сделать?',
build(st,K){
 const sv=[300,405,509].map(y=>miniSrv(st,51,y,438,79));
 const tm=nterm(st,{y:651,h:169,pad:21.5,lh:38.5,fs:23.7,lines:[c('dnf update kernel',0.35,1.7),e_('⚠ нужна перезагрузка',K('сервере')),y_('а сайт должен жить',K('сайт'))]});
 const q=el(st,'?','left:505px;top:318px;width:200px;text-align:center;font-size:235px;line-height:260px;font-weight:700;color:#fbbf24');
 return t=>{
  sv.forEach((s,i)=>{pop(s.el,prog(t,0.15+0.15*i,0.4));s.set(t>K('боевом')?RED:GR)});
  tm.upd(t);
  const p=prog(t,K('сделать'),0.45);q.style.opacity=p;q.style.transform=`scale(${0.6+0.4*p})`;
 }}});

/* ---------- 2. почему возможно ---------- */
SC.push({tag:'почему',title:['Почему это','возможно'],
narr:'Обновление ядра требует перезагрузки. Если сервер один, будет простой. Но если серверов несколько, можно обновлять по одному. И пользователи ничего не заметят.',
build(st,K,W){
 const a=card(st,40,264,640,247.5,'border-radius:20px');
 const la=tx(st,'1 сервер',71,299,28.7,'font-weight:700;color:#6cb4fa');
 const sa=miniSrv(st,71,346,258,83);
 const ra=tx(st,'',362,370,31.5,'font-weight:700;letter-spacing:.3px');
 const b=card(st,40,548,640,329,'border-radius:20px');
 const lb=tx(st,'Несколько серверов',70,584,28.7,'font-weight:700;color:#6cb4fa');
 const mb=[70,265,461].map(x=>miniSrv(st,x,635,177,83));
 const zero=txc(st,'0 простоя',360,800,54,'font-weight:700;color:#84fc4c');
 return t=>{
  pop(a,prog(t,0.15,0.4));pop(la,prog(t,0.2,0.4));pop(sa.el,prog(t,0.3,0.4));
  const down=t>K('простой');
  sa.set(down?RED:(t>K('перезагрузки')?AMB:GR));
  ra.innerHTML=down?'ПРОСТОЙ':'ПЕРЕЗАГРУЗКА.';ra.style.color=down?RED:AMB;
  ra.style.opacity=t>K('перезагрузки')?1:0;
  const pb=prog(t,W(9),0.5);pop(b,pb);pop(lb,pb);
  const upd=t>K('обновлять')&&t<K('пользователи');
  mb.forEach((m,i)=>{const pp=prog(t,K('несколько')+0.12*i,0.4);pop(m.el,pp);m.op(pp*(i===0&&upd?.45:1));m.set(i===0&&upd?AMB:GR)});
  pop(zero,prog(t,K('заметят'),0.5));
 }}});

/* ---------- 3. убрать из пула ---------- */
SC.push({tag:'drain',title:['Шаг 1:','убрать из пула'],
narr:'Перед серверами стоит балансировщик. Выводим первый сервер из пула: новых клиентов туда больше не шлём. Это называется drain.',
build(st,K){
 const svg=mkSvg(st);
 const lines=[[360,560,120,700],[360,560,360,700],[360,560,601,700]].map(([x1,y1,x2,y2])=>mk('line',{x1,y1,x2,y2,stroke:'#2c43a6','stroke-width':2.5},svg));
 const top=mk('line',{x1:360,y1:359,x2:360,y2:481,stroke:'#2c43a6','stroke-width':2.5},svg);
 const dTop=dots(svg,4,GR),d1=dots(svg,4,GR),d2=dots(svg,4,GR),d3=dots(svg,4,GR);
 const node=(x,y,w,h,html)=>{const n=card(st,x,y,w,h,'border-radius:14px;border-color:#3452b0');n.innerHTML=html;return n};
 const cl=node(231,290,259,69,'<div style="text-align:center;line-height:66px;font-size:26px;font-weight:700;color:#6cb4fa">КЛИЕНТЫ</div>');
 const hp=node(216,481,288,79,'<div style="text-align:center;line-height:76px;font-size:32px;font-weight:700;color:#fbbf24">HAProxy</div>');
 const web=[25,265,506].map((x,i)=>node(x,700,189,99,`<div style="text-align:center;margin-top:14px;font-size:26px;line-height:34px;font-weight:700">web${i+1}</div><div class="st" style="text-align:center;margin-top:6px;font-size:19.5px;line-height:26px;font-weight:700;color:#84fc4c;letter-spacing:.5px">UP</div>`));
 const cmd=nterm(st,{x:60,y:853,w:599,h:68,pad:10,fs:18.5,lh:40,lines:[o_('set server web/web1 state drain',K('пула')+0.5)]});
 return t=>{
  [cl,hp].forEach((n,i)=>pop(n,prog(t,0.1+0.1*i,0.4)));web.forEach((n,i)=>pop(n,prog(t,0.25+0.1*i,0.4)));
  const lo=prog(t,0.3,0.5);lines.concat([top]).forEach(l=>l.setAttribute('opacity',lo));
  const dr=t>K('пула');
  dTop.upd(t,360,360,360,480,t>0.5);
  d1.upd(t,360,561,120,699,t>0.5&&!dr);d2.upd(t,360,561,360,699,t>0.5);d3.upd(t,360,561,601,699,t>0.5);
  lines[0].setAttribute('stroke',dr?'#4a5788':'#2c43a6');lines[0].setAttribute('stroke-dasharray',dr?'7 6':'');
  web[0].style.borderColor=dr?'#ecbd36':'#3452b0';web[0].style.borderWidth=dr?'2px':'1.5px';
  const s0=web[0].querySelector('.st');s0.textContent=dr?'DRAIN':'UP';s0.style.color=dr?'#e7b52f':'#84fc4c';
  cmd.upd(t);
 }}});

/* ---------- 4. цикл одной ноды ---------- */
SC.push({tag:'цикл',title:['Цикл обновления','одной ноды'],
narr:'Дальше по порядку. Ждём, пока все текущие сессии закончатся. Ядро обновляем, перезагружаем. Проверяем, что сервер здоров. Возвращаем в пул и берём следующий.',
build(st,K){
 const steps=[['Drain','убрать из балансировки',0.3],['Ждём сессии','пока клиенты уйдут',K('Ждём')],['Update + reboot','dnf update kernel',K('закончатся')],['Healthcheck','порт, HTTP, репликация',K('Проверяем')],['Вернуть в пул','enable server',K('Возвращаем')]];
 const ys=[264,389,515,640,767];
 const els=steps.map(([a,b],i)=>{
  const cd=card(st,40,ys[i],640,95,'border-radius:14px');
  const bd=el(cd,'','left:21px;top:20px;width:55px;height:55px;border-radius:50%;text-align:center;line-height:55px;font-size:27px;font-weight:700');
  el(cd,a,'left:97px;top:14px;font-size:30px;line-height:38px;font-weight:700;white-space:nowrap');
  el(cd,b,'left:97px;top:54px;font-size:20px;line-height:28px;color:#8d9bd1;white-space:nowrap');
  return {cd,bd}});
 const nxt=txc(st,'→ дальше следующая нода',360,918,31,'font-weight:700;color:#6fdc4a');
 return t=>{
  els.forEach(({cd,bd},i)=>{
   pop(cd,prog(t,steps[i][2],0.4));
   const done=i<4?t>steps[i+1][2]+0.1:t>K('следующий');
   cd.style.borderColor=done?'#35b02a':'#f6b93b';cd.style.borderWidth='2px';
   bd.style.background=done?'#35a824':'#fbbf24';bd.style.color=done?'#fff':'#0a1236';
   bd.textContent=done?'✓':String(i+1);
  });
  pop(nxt,prog(t,K('следующий'),0.4));
 }}});

/* ---------- 5. ansible ---------- */
SC.push({tag:'ansible',title:['Как в','Ansible'],
narr:'В Ansible достаточно директивы serial: 1. Плейбук идёт по серверам строго по очереди, а drain делается командой в сокет HAProxy.',
build(st,K){
 const note=txc(st,'упрощённо',587,246,15,'color:#7b87b8');
 const k=s=>`<span style="color:#7aa5d9">${s}</span>`,d='<span style="color:#4b6cae">-</span>',w=s=>`<span style="color:#e6ebff">${s}</span>`,cm=s=>`<span style="color:#6272a6">${s}</span>`;
 const code=[
  `${d} ${k('hosts:')} ${w('web')}`,
  `  ${k('serial:')} <span style="color:#f0b429">1</span>            ${cm('# по одному')}`,
  `  ${k('tasks:')}`,
  `    ${d} ${k('include_tasks:')} ${w('drain.yml')}`,
  `    ${d} ${k('dnf:')} ${w('name=kernel state=latest')}`,
  `    ${d} ${k('reboot:')}`,
  `    ${d} ${k('uri:')} ${w('url=http://{{ inventory_hostname }}/health')}`,
  `    ${d} ${k('include_tasks:')} ${w('enable.yml')}`];
 const box=el(st,'',`left:29px;top:264px;width:661px;height:296px;font-size:18.9px;line-height:29.4px`,'nt');
 const hl=el(box,'','left:0;top:46px;width:100%;height:29px;border:2px solid #f0b429;border-radius:7px;background:rgba(0,0,0,.4)');
 el(box,code.join('\n'),'left:24px;top:20px');
 const cmd=el(st,`<span style="color:#6bdc4b">$</span> <span style="color:#e6ebff">echo "set server web/web1 state drain" \\\n    | socat stdio /run/haproxy/admin.sock</span>`,'left:29px;top:611px;width:661px;height:128px;font-size:21px;line-height:34.7px;padding:19px 24px','nt');
 const lab=tx(st,'drain через сокет HAProxy',40,770,22,'color:#8d9bd1');
 return t=>{
  const p=prog(t,0.3,0.5);pop(box,p);pop(note,p);
  const hon=t>K('serial')&&t<K('очереди');hl.style.opacity=hon?prog(t,K('serial'),0.3):0;
  const q=prog(t,K('очереди'),0.5);pop(cmd,q);pop(lab,q);
 }}});

/* ---------- 6. три правила ---------- */
SC.push({tag:'правила',title:['Три правила','без сюрпризов'],
narr:'Три правила. Не обновляй все серверы сразу. Оставляй старое ядро для отката. А базу данных обновляй так: сначала реплика, потом switchover, потом бывший мастер.',
build(st,K){
 const row=(y,h,n,a,b,nt)=>{const cd=card(st,40,y,640,h,'border-radius:14px');
  el(cd,n,`left:32px;top:${nt}px;font-size:38px;line-height:46px;color:#dfe5ff`);
  el(cd,a,'left:103px;top:23px;font-size:30px;line-height:38px;font-weight:700;white-space:nowrap');
  if(b)el(cd,b,'left:103px;top:66px;font-size:21px;line-height:28px;color:#8d9bd1;white-space:nowrap');return cd};
 const c1=row(264,116,'1','Не все ноды сразу','serial: 1, всегда есть живые',28);
 const c2=row(412,116,'2','Старое ядро — на откат','выбор ядра в GRUB при загрузке',28);
 const c3=row(560,216,'3','База: по порядку','',24);
 const pill=(x,w,txt,bg)=>el(c3,`<div style="display:flex;height:100%;align-items:center;justify-content:center;text-align:center;line-height:20px">${txt}</div>`,`left:${x-40}px;top:110px;width:${w}px;height:69px;border-radius:13px;background:${bg};color:#0a1236;font-size:20px;font-weight:700`);
 const p1=pill(60,174,'реплика','#39ae24'),p2=pill(265,171,'switchover','#fec02a'),p3=pill(470,171,'бывший<br>primary','#65b2fe');
 const ar=[247,452].map(x=>el(c3,'→',`left:${x-40-18}px;top:118px;width:36px;text-align:center;font-size:34px;line-height:50px;font-weight:700;color:#fff`));
 return t=>{
  pop(c1,prog(t,K('Не'),0.45));pop(c2,prog(t,K('Оставляй'),0.45));pop(c3,prog(t,K('базу'),0.45));
  pop(p1,prog(t,K('реплика'),0.4));pop(p2,prog(t,K('switchover'),0.4));pop(p3,prog(t,K('бывший'),0.4));
  pop(ar[0],prog(t,K('switchover')-0.2,0.3));pop(ar[1],prog(t,K('бывший')-0.2,0.3));
 }}});

/* ---------- 7. стенд ---------- */
SC.push({tag:'стенд',title:['Потренируйся','на стенде'],
narr:'Собери тестовый стенд и отработай это без риска.',
build(st,K){
 const names=[['lb1','#f2c03f'],['lb2','#f2c03f'],['web1','#6eb6fd'],['web2','#6eb6fd'],['db1','#8df260'],['db2','#8df260']];
 const xs=[51,261,470],ys=[300,450];
 const tiles=names.map(([n,col],i)=>{const t=card(st,xs[i%3],ys[(i/3)|0],189,109,'border-radius:14px');
  el(t,n,`left:0;top:14px;width:100%;text-align:center;font-size:29.5px;line-height:36px;font-weight:700;color:${col}`);led(t,162,84,7);return t});
 const vg=txc(st,'Vagrant + Ansible',360,676,43.8,'font-weight:700;color:#fbbf24');
 const sub=txc(st,'ломай, обновляй, восстанавливай',360,735,25,'color:#8d9bd1');
 return t=>{
  tiles.forEach((n,i)=>pop(n,prog(t,0.1+0.13*i,0.4)));
  pop(vg,prog(t,K('стенд'),0.4));pop(sub,prog(t,K('отработай'),0.4));
 }}});
