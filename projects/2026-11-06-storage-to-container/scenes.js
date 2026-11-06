/* Тема navy. Проброс хранилища в контейнер. Выводы сняты в стенде (docker compose, tmpfs вместо NFS), пробелы в df сжаты. */
const GRY='#7b87b8',AMBR='#fbbf24';
/* схема: storage -> хост (точка монтирования) -> контейнер. o:{h:[текст,цвет,пунктир], c:[...], l1:bool, l2:'ok'|'bad'|'off'} */
function stack(st,y0){
 const svg=mkSvg(st);
 const mkL=(x1,y1,x2,y2)=>mk('line',{x1,y1,x2,y2,stroke:'#2c43a6','stroke-width':2.5},svg);
 const L1=mkL(360,y0+80,360,y0+150),L2=mkL(360,y0+218,360,y0+300);
 const d1=dots(svg,3,GR),d2=dots(svg,3,GR);
 const node=(x,y,w,h,title,sub,tc)=>{const n=card(st,x,y,w,h,'border-radius:14px;border-color:#3452b0');
  n.innerHTML=`<div style="text-align:center;margin-top:10px;font-size:28px;line-height:36px;font-weight:700;color:${tc||'#fff'}">${title}</div><div class="st" style="text-align:center;margin-top:4px;font-size:22px;line-height:28px;font-weight:700;color:${GR}">${sub}</div>`;return n};
 const s=node(190,y0,340,80,'storage · NFS','доступен','#fbbf24');
 const h=node(150,y0+150,420,68,'хост web-1','/mnt/storage');
 const c=node(120,y0+300,480,92,'контейнер web-1','/data');
 const apply=(n,a)=>{const st_=n.querySelector('.st');st_.textContent=a[0];st_.style.color=a[1];
  n.style.borderColor=a[1]===GR?'#3452b0':a[1];n.style.borderStyle=a[2]?'dashed':'solid';n.style.borderWidth=a[1]===GR?'1.5px':'2px'};
 return {upd(t,o){
  const p=prog(t,0.1,0.4);[s,h,c].forEach(e=>pop(e,p));[L1,L2].forEach(l=>l.setAttribute('opacity',p));
  apply(h,o.h);apply(c,o.c);
  L1.setAttribute('stroke',o.l1?'#2c43a6':'#4a5788');L1.setAttribute('stroke-dasharray',o.l1?'':'7 6');
  const k=o.l2;L2.setAttribute('stroke',k==='ok'?'#2c43a6':k==='bad'?RE:'#4a5788');L2.setAttribute('stroke-dasharray',k==='ok'?'':'7 6');
  d1.upd(t,360,y0+81,360,y0+149,t>0.5&&!!o.l1,.3);
  d2.upd(t,360,y0+219,360,y0+299,t>0.5&&k==='ok',.3);
 }}}
const G=[GR],OKH=['/mnt/storage',GR,0],NO=['?',GRY,1];

/* ---------- 1. задача ---------- */
SC.push({tag:'задача',title:['Хранилище','в контейнер'],
narr:'Новое хранилище примонтировано на хосте. Как сделать, чтобы его увидел php-fpm внутри контейнера web-1?',
build(st,K){
 const sk=stack(st,250);
 const q=el(st,'?','left:260px;top:700px;width:200px;text-align:center;font-size:190px;line-height:210px;font-weight:700;color:#fbbf24');
 return t=>{sk.upd(t,{h:OKH,c:['/data  ?',GRY,1],l1:true,l2:'off'});
  const p=prog(t,K('Как'),0.45);q.style.opacity=p;q.style.transform=`scale(${0.6+0.4*p})`;}}});

/* ---------- 2. проверить на хосте ---------- */
SC.push({tag:'шаг 1',title:['Проверить','на хосте'],
narr:'Сначала на хосте убедись: хранилище смонтировано и место видно. Это путь /mnt/storage, его и будем пробрасывать.',
build(st,K){
 const sk=stack(st,250);
 const tm=nterm(st,{y:710,h:34+3*39,pad:17,lh:39,fs:22,lines:[c('df -h /mnt/storage | tail -1',0.5,1.0),h_('tmpfs  64M  4.0K  64M  1%  /mnt/storage',K('смонтировано')),o_('# стенд: tmpfs вместо NFS',K('смонтировано')+0.4)]});
 return t=>{sk.upd(t,{h:OKH,c:['/data  ?',GRY,1],l1:true,l2:'off'});tm.upd(t);}}});

/* ---------- 3. volumes в compose ---------- */
SC.push({tag:'шаг 2',title:['Дописать','volumes'],
narr:'В compose у web-1 добавляем volumes: путь на хосте, двоеточие, путь в контейнере. Суффикс ro оставит только чтение.',
build(st,K){
 const sk=stack(st,250);
 const tm=nterm(st,{y:710,h:34+4*39,pad:17,lh:39,fs:22,lines:[o_('services:',0.4),o_('  web-1:',0.7),o_('    volumes:',K('volumes')),h_('      - /mnt/storage:/data:ro',K('двоеточие'))]});
 return t=>{sk.upd(t,{h:OKH,c:['/data  ?',GRY,1],l1:true,l2:'off'});tm.upd(t);}}});

/* ---------- 4. пересоздать ---------- */
SC.push({tag:'шаг 3',title:['Пересоздать','контейнер'],
narr:'Одной правки файла мало. Запусти up -d: compose заметит новый volume, пересоздаст контейнер, и в выводе будет Recreated.',
build(st,K){
 const sk=stack(st,250);
 const tm=nterm(st,{y:710,h:34+3*39,pad:17,lh:39,fs:22,lines:[c('docker compose up -d',0.4,0.9),h_('Container app-web-1-1 Recreated',K('Recreated')-0.5),o_('Container app-web-1-1 Started',K('Recreated')+0.2)]});
 return t=>{const r=t>K('Recreated')+0.2;
  sk.upd(t,{h:OKH,c:r?['/data  OK',GR,0]:['/data  ?',GRY,1],l1:true,l2:r?'ok':'off'});tm.upd(t);}}});

/* ---------- 5. проверка изнутри ---------- */
SC.push({tag:'проверка',title:['Проверить','изнутри'],
narr:'Проверяем изнутри: файлы хранилища на месте. А запись в ro-каталог отвечает Read-only file system, так и задумано.',
build(st,K){
 const sk=stack(st,250);
 const tm=nterm(st,{y:710,h:34+4*39,pad:17,lh:39,fs:22,lines:[c('docker compose exec web-1 ls /data',0.4,1.0),h_('marker.txt',K('файлы')+0.6),c('docker compose exec web-1 touch /data/x',K('запись')-0.3,1.1),e_('touch: … Read-only file system',K('Read-only'))]});
 return t=>{sk.upd(t,{h:OKH,c:['/data  OK · ro',GR,0],l1:true,l2:'ok'});tm.upd(t);}}});

/* ---------- 6. ловушка ---------- */
SC.push({tag:'ловушка',title:['Смонтировал','после старта?'],
narr:'Ловушка: если хранилище примонтировали уже после старта контейнера, внутри окажется пустой каталог на диске хоста, а не хранилище.',
build(st,K){
 const sk=stack(st,250);
 const tm=nterm(st,{y:710,h:34+3*39,pad:17,lh:39,fs:22,lines:[c('docker compose exec web-1 \\',0.4,0.8),c('    df -h /data | tail -1',1.2,0.8,false),e_('/dev/vda  252G  …  29%  /data',K('пустой'))]});
 return t=>{const r=t>K('пустой');
  sk.upd(t,{h:OKH,c:r?['/data  чужой диск',RE,0]:['/data',GRY,1],l1:true,l2:r?'bad':'off'});tm.upd(t);}}});

/* ---------- 7. лечение ---------- */
SC.push({tag:'лечение',title:['Пересоздай','контейнер'],
narr:'Лечение простое: хранилище смонтировано на хосте, затем пересоздаём контейнер. Теперь внутри тот же том, что и снаружи.',
build(st,K){
 const sk=stack(st,250);
 const tm=nterm(st,{y:710,h:34+4*39,pad:17,lh:39,fs:22,lines:[c('docker compose up -d --force-recreate',0.4,1.1),o_('Container app-web-1-1 Started',K('пересоздаём')+0.3),c('docker compose exec web-1 df -h /data',K('Теперь')-0.6,0.9),h_('tmpfs  32M  …  1%  /data',K('снаружи')-0.4)]});
 return t=>{const r=t>K('снаружи')-0.4;
  sk.upd(t,{h:OKH,c:r?['/data  OK',GR,0]:['/data  чужой диск',RE,0],l1:true,l2:r?'ok':'bad'});tm.upd(t);}}});

/* ---------- 8. итог ---------- */
SC.push({tag:'итог',title:['Порядок','запомни'],
narr:'Смонтировать, прописать volumes, пересоздать, проверить изнутри. Делай по одному узлу, сначала выведи его из балансировки.',
build(st,K){
 const it=['хранилище на хосте: df -h','volumes в compose-файле','docker compose up -d','проверка изнутри: ls, df','узлы по одному'];
 const rows=it.map((s,i)=>{const cd=card(st,60,254+i*120,600,100,'border-radius:14px');
  el(cd,String(i+1),'left:24px;top:23px;width:54px;height:54px;border-radius:50%;background:#fbbf24;color:#0a1236;text-align:center;line-height:54px;font-size:28px;font-weight:700');
  el(cd,s,'left:104px;top:28px;font-size:29px;line-height:44px;font-weight:700;white-space:nowrap');return cd});
 const hint=txc(st,'сначала потренируйся на стенде',360,885,24,'color:#8d9bd1');
 return t=>{rows.forEach((r,i)=>pop(r,prog(t,0.3+0.8*i,0.4)));pop(hint,prog(t,K('сначала'),0.4));}}});
