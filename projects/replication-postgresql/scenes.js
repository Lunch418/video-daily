/* ---------- 1. проблема ---------- */
SC.push({tag:'проблема',
narr:'Что такое репликация в PostgreSQL и зачем она нужна? Представь, что вся база живёт на одном сервере. Он сломался, и база недоступна, а данные могут пропасть. Одна копия данных это одна точка отказа. Поэтому делают вторую.',
build(st,K){
 const svg=mkSvg(st);
 const a=srv(svg,OR),b=srv(svg,TL,true);const x=cross(svg,0,0);
 const title=el(st,'Что такое <span style="color:#e8946a">репликация</span>?','left:30px;top:110px;width:660px;font-size:44px;font-weight:700;text-align:center');
 const txt=el(st,'1 копия = 1 точка отказа','left:30px;top:640px;width:660px;text-align:center;font-size:38px;font-weight:700;color:#e8946a');
 const sub=el(st,'сервер сломался — база недоступна','left:30px;top:700px;width:660px;text-align:center;font-size:24px;color:#9a9da8');
 return t=>{
  pop(title,prog(t,0.1,0.5));
  const mv=prog(t,K('вторую'),0.9);
  const cx=360-175*mv,sc=1.3-0.3*mv;
  a.place(cx,420,sc);a.op(prog(t,0.3,0.5));
  b.place(535,420,1.0);b.op(prog(t,K('вторую'),0.6)*0.9);
  const dead=t>K('сломался');
  a.setColor(dead?RD:OR,dead?RD:OR);
  x.setAttribute('transform',`translate(${cx+8},${420-6})`);x.setAttribute('opacity',dead?prog(t,K('сломался'),0.3):0);
  pop(sub,prog(t,K('недоступна'),0.4));
  pop(txt,prog(t,K('точка'),0.4));
 }}});

/* ---------- 2. идея ---------- */
SC.push({tag:'идея',
narr:'Идея простая. Есть главный сервер, primary: он принимает запись. И есть реплика, standby: она получает все изменения и держит копию в актуальном состоянии. Читать с неё можно, а писать нельзя.',
build(st,K){
 const svg=mkSvg(st);
 const a=srv(svg,OR),b=srv(svg,TL);const f=flow(svg,5,OR);
 const la=el(st,'primary<div style="font-size:21px;font-weight:400;color:#9a9da8;margin-top:6px">принимает запись</div>','left:25px;top:465px;width:250px;font-size:34px;color:#e8946a','lab');
 const lb=el(st,'standby<div style="font-size:21px;font-weight:400;color:#9a9da8;margin-top:6px">копия данных</div>','left:445px;top:465px;width:250px;font-size:34px;color:#5fb59f','lab');
 const wal=el(st,'изменения','left:260px;top:290px;width:200px;text-align:center;font-size:20px;color:#9a9da8');
 const c1=el(st,'чтение ✓','left:445px;top:640px;width:250px;text-align:center;color:#6cc4ad;border-color:#3d7a6b','chip');
 const c2=el(st,'запись ✗','left:445px;top:710px;width:250px;text-align:center;color:#e0706a;border-color:#8a443f','chip');
 return t=>{
  a.place(150,350,1.3);b.place(570,350,1.3);a.op(prog(t,0.2,0.5));b.op(prog(t,0.4,0.5));
  pop(la,prog(t,K('primary'),0.4));pop(lb,prog(t,K('standby'),0.4));
  const on=t>K('изменения');f.upd(t,288,432,352,on);wal.style.opacity=on?prog(t,K('изменения'),0.4):0;
  pop(c1,prog(t,K('Читать'),0.4));pop(c2,prog(t,K('писать'),0.4));
 }}});

/* ---------- 3. WAL ---------- */
SC.push({tag:'WAL',
narr:'Как изменения доезжают до реплики? Через журнал предзаписи, WAL. Любое изменение сначала попадает в этот журнал. Реплика получает поток записей и применяет те же изменения у себя. Это физическая репликация, и позиции в журнале у обоих серверов совпадают.',
build(st,K){
 const svg=mkSvg(st);
 const a=srv(svg,OR),b=srv(svg,TL);const f=flow(svg,6,OR,'rect');
 const la=el(st,'primary','left:60px;top:345px;width:250px;font-size:28px;color:#e8946a','lab');
 const lb=el(st,'standby','left:410px;top:345px;width:250px;font-size:28px;color:#5fb59f','lab');
 const wl=el(st,'WAL — журнал изменений','left:60px;top:410px;width:250px;text-align:center;font-size:19px;color:#e8946a;border:1px dashed #8a5a42;border-radius:10px;padding:8px 6px');
 const t1=term(st,{y:520,title:'primary · :5433',lines:[c('psql -p 5433 -Atc "SELECT pg_current_wal_lsn()"',K('позиции'),1.0),h_('0/3000230',K('позиции')+1.1)]});
 const t2=term(st,{y:660,title:'standby · :5434',lines:[c('psql -p 5434 -Atc "SELECT pg_last_wal_replay_lsn()"',K('позиции')+1.5,1.0),h_('0/3000230',K('позиции')+2.6)]});
 return t=>{
  a.place(185,230,1.2);b.place(535,230,1.2);a.op(prog(t,0.2,0.5));b.op(prog(t,0.3,0.5));
  pop(la,prog(t,0.4,0.4));pop(lb,prog(t,0.5,0.4));
  pop(wl,prog(t,K('журнал'),0.4));
  f.upd(t,312,408,232,t>K('поток'));
  t1.upd(t);t2.upd(t);
 }}});

/* ---------- 4. создание ---------- */
SC.push({tag:'создание',
narr:'Реплику поднимают в два шага. Сначала pg_basebackup снимает копию данных с primary. Флаг минус R сам создаёт файл standby.signal и строку подключения. Потом запускаешь сервер, и он подключается к потоку WAL.',
build(st,K){
 const svg=mkSvg(st);
 const a=srv(svg,OR),b=srv(svg,TL);const f=flow(svg,5,OR);
 const la=el(st,'primary','left:60px;top:300px;width:250px;font-size:26px;color:#e8946a','lab');
 const lb=el(st,'standby','left:410px;top:300px;width:250px;font-size:26px;color:#5fb59f','lab');
 const cp=el(st,'копия данных','left:260px;top:140px;width:200px;text-align:center;font-size:19px;color:#9a9da8');
 const k0=K('pg_basebackup'),k1=K('Флаг');
 const tm=term(st,{y:370,title:'создание реплики',lines:[
  c('pg_basebackup -h 127.0.0.1 -p 5433 -U repl \\',k0,1.1),
  c('    -D replica -R -X stream -P',k0+1.2,0.8,false),
  o_('23225/23225 kB (100%), 1/1 tablespace',k0+2.3),
  c('ls replica | grep standby',k1,0.8),
  h_('standby.signal',k1+1.0),
  c('grep primary_conninfo replica/postgresql.auto.conf',k1+1.5,1.3),
  h_("primary_conninfo = 'user=repl … host=127.0.0.1 port=5433 …'",k1+3.0)]});
 return t=>{
  a.place(185,215,1.2);b.place(535,215,1.2);a.op(prog(t,0.2,0.5));
  const lit=t>K('запускаешь');
  b.op(lit?1:0.3+0.0);b.setColor(lit?TL:DM,lit?TL:DM);
  b.g.setAttribute('opacity',lit?prog(t,K('запускаешь'),0.5)*0.7+0.3:0.4);
  pop(la,prog(t,0.3,0.4));pop(lb,prog(t,0.4,0.4));
  f.upd(t,312,408,217,t>k0&&t<K('запускаешь')+2);cp.style.opacity=(t>k0)?prog(t,k0,0.4):0;
  tm.upd(t);
 }}});

/* ---------- 5. проверка ---------- */
SC.push({tag:'проверка',
narr:'Как убедиться, что всё работает? На primary смотрим представление pg_stat_replication: состояние streaming, реплика подключена. А на самой реплике функция pg_is_in_recovery возвращает true. Это и есть признак реплики.',
build(st,K){
 const svg=mkSvg(st);
 const a=srv(svg,OR),b=srv(svg,TL);const f=flow(svg,5,TL);
 const la=el(st,'primary','left:60px;top:300px;width:250px;font-size:26px;color:#e8946a','lab');
 const lb=el(st,'standby','left:410px;top:300px;width:250px;font-size:26px;color:#5fb59f','lab');
 const sm=el(st,'streaming','left:260px;top:140px;width:200px;text-align:center;font-size:21px;font-weight:700;color:#6cc4ad');
 const ks=K('смотрим'),kt=K('состояние');
 const t1=term(st,{y:360,title:'на primary',lines:[
  c('psql -p 5433 -x -c "SELECT state, sent_lsn,',ks,1.0),
  c('    replay_lsn, sync_state FROM pg_stat_replication"',ks+1.1,1.0,false),
  o_('-[ RECORD 1 ]---------',kt),h_('state      | streaming',kt),o_('sent_lsn   | 0/3000000',kt+0.4),o_('replay_lsn | 0/3000000',kt+0.4),o_('sync_state | async',kt+0.4)]});
 const t2=term(st,{y:650,title:'роль сервера',lines:[
  c('psql -p 5434 -Atc "SELECT pg_is_in_recovery()"',K('самой'),0.9),h_('t',K('возвращает')+0.3),
  c('psql -p 5433 -Atc "SELECT pg_is_in_recovery()"',K('Это'),0.9),o_('f',K('Это')+1.0)]});
 return t=>{
  a.place(185,215,1.2);b.place(535,215,1.2);a.op(prog(t,0.2,0.5));b.op(prog(t,0.3,0.5));
  pop(la,prog(t,0.3,0.4));pop(lb,prog(t,0.4,0.4));
  f.upd(t,312,408,217,t>kt);sm.style.opacity=t>kt?prog(t,kt,0.4):0;
  t1.upd(t);t2.upd(t);
 }}});

/* ---------- 6. запись и чтение ---------- */
SC.push({tag:'запись',
narr:'Запись идёт только на primary. Добавили строку, и она сразу видна на реплике. А если попробовать записать на реплику, получишь ошибку: read-only transaction. Зато читать с реплики можно сколько угодно, это разгружает основной сервер.',
build(st,K){
 const k0=K('Запись'),k1=K('Добавили');
 const tA=term(st,{y:110,title:'primary · запись',lines:[
  c('psql -p 5433 -c "INSERT INTO orders(item)',K('только'),1.0),
  c("    VALUES ('monitor') RETURNING id, item\"",K('только')+1.1,0.9,false),
  o_(' id |  item   ',K('видна')),o_('----+---------',K('видна')),h_('  3 | monitor',K('видна'))]});
 const tB=term(st,{y:340,title:'standby · чтение и запись',lines:[
  c('psql -p 5434 -c "SELECT * FROM orders"',K('реплике'),0.9),
  o_(' id |   item   ',K('реплике')+1.0),o_('----+----------',K('реплике')+1.0),o_('  1 | keyboard',K('реплике')+1.0),o_('  2 | mouse',K('реплике')+1.0),h_('  3 | monitor',K('реплике')+1.0),
  c('psql -p 5434 -c "INSERT INTO orders(item)',K('попробовать'),1.1),
  c("    VALUES ('hack')\"",K('попробовать')+1.2,0.6,false),
  e_('ERROR:  cannot execute INSERT in a read-only transaction',K('ошибку'))]});
 const tag=el(st,'чтение с реплики разгружает primary','left:30px;top:760px;width:660px;text-align:center;font-size:27px;font-weight:700;color:#6cc4ad');
 return t=>{tA.upd(t);tB.upd(t);pop(tag,prog(t,K('Зато'),0.5))}}});

/* ---------- 7. нюансы ---------- */
SC.push({tag:'нюансы',
narr:'Но реплика может отставать. По умолчанию репликация асинхронная: primary не ждёт подтверждения. Если остановить применение WAL на реплике, она сразу отстаёт, здесь на сто семьдесят шесть байт журнала. И главное: реплика не бэкап. Случайный DELETE доедет до неё мгновенно.',
build(st,K){
 const k=K('Если');
 const t1=term(st,{y:100,title:'асинхронная репликация и отставание',lines:[
  c('psql -p 5434 -Atc "SELECT pg_wal_replay_pause()"',k,0.6),
  c('psql -p 5433 -qc "INSERT INTO orders(item)',k+0.7,0.7),
  c("    VALUES ('webcam')\"",k+1.4,0.4,false),
  c('psql -p 5434 -Atc "SELECT count(*) FROM orders"',k+1.9,0.6),h_('3',k+2.6),
  c('psql -p 5433 -Atc "SELECT pg_wal_lsn_diff(sent_lsn,',k+3.0,0.7),
  c('    replay_lsn) FROM pg_stat_replication"',k+3.7,0.6,false),
  h_('176',K('байт'))]});
 const g=K('главное');
 const t2=term(st,{y:400,title:'реплика — не бэкап',lines:[
  c('psql -p 5434 -Atc "SELECT pg_wal_replay_resume()"',g,0.7),
  c('psql -p 5434 -Atc "SELECT count(*) FROM orders"',g+0.8,0.7),o_('4',g+1.6),
  c('psql -p 5433 -qc "DELETE FROM orders WHERE id=1"',K('Случайный')-0.4,0.8),
  c('psql -p 5434 -Atc "SELECT count(*) FROM orders"',K('Случайный')+0.5,0.7),e_('3   ← строка пропала и на реплике',K('мгновенно')+0.6)]});
 const tag=el(st,'реплика ≠ бэкап','left:30px;top:760px;width:660px;text-align:center;font-size:40px;font-weight:700;color:#e8946a');
 return t=>{t1.upd(t);t2.upd(t);pop(tag,prog(t,K('бэкап'),0.5))}}});

/* ---------- 8. failover ---------- */
SC.push({tag:'failover',
narr:'А если primary упал, реплику повышают командой pg_ctl promote. Она выходит из режима восстановления и начинает принимать запись, а номер таймлайна растёт до двух. Для автоматического переключения обычно берут Patroni. А такой стенд ты можешь собрать у себя сам.',
build(st,K){
 const svg=mkSvg(st);
 const a=srv(svg,OR),b=srv(svg,TL);const x=cross(svg,0,0);
 const la=el(st,'primary','left:60px;top:300px;width:250px;font-size:26px;color:#e8946a','lab');
 const lb=el(st,'standby','left:410px;top:300px;width:250px;font-size:26px;color:#5fb59f','lab');
 const kp=K('promote'),kr=K('восстановления'),kt=K('таймлайна');
 const tm=term(st,{y:370,title:'повышение реплики',lines:[
  c('pg_ctl -D replica promote',K('командой'),0.8),
  o_('waiting for server to promote.... done',kp+1.0),o_('server promoted',kp+1.0),
  c('psql -p 5434 -Atc "SELECT pg_is_in_recovery()"',kr,0.9),h_('f',kr+1.0),
  c("pg_controldata replica | grep ' TimeLineID'",kt,1.0),
  h_("Latest checkpoint's TimeLineID:       2",kt+1.1)]});
 const pt=el(st,'автоматически — Patroni','left:30px;top:700px;width:660px;text-align:center;font-size:30px;font-weight:700;color:#6cc4ad');
 const fin=el(st,'собери стенд и потренируйся','left:30px;top:780px;width:660px;text-align:center;font-size:36px;font-weight:700;color:#e8946a');
 return t=>{
  a.place(185,215,1.2);b.place(535,215,1.2);a.op(prog(t,0.2,0.5));b.op(prog(t,0.3,0.5));
  const dead=t>K('упал');a.setColor(dead?DM:OR,dead?RD:OR);
  x.setAttribute('transform','translate(193,209)');x.setAttribute('opacity',dead?prog(t,K('упал'),0.3):0);
  const np=t>kp+1.0;b.setColor(np?OR:TL,np?OR:TL);
  la.style.opacity=prog(t,0.3,0.4)*(dead?0.45:1);
  lb.innerHTML=np?'новый primary':'standby';lb.style.color=np?OR:TL;pop(lb,prog(t,0.4,0.4));
  tm.upd(t);pop(pt,prog(t,K('Patroni'),0.5));pop(fin,prog(t,K('можешь'),0.5));
 }}});

