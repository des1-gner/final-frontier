// ================= SCREENS + MAIN LOOP =================
let facSel=0,crewPanel=false;
function renderTitle(){drawStars(0.25,[{x:120,y:80,r:70,c:'#5d275d'},{x:380,y:200,r:90,c:'#29366f'}]);
 const s=SHIPSPR.fed,t=anim;drawShip(s,W/2+Math.sin(t*0.01)*30,150+Math.sin(t*0.03)*3,false,1,2,false);
 const lx=W/2-txtW('FINAL FRONTIER',5)/2;txt('FINAL FRONTIER',W/2,30,'#ffcd75',5,'c');ctx.save();ctx.beginPath();ctx.rect(0,43,W,20);ctx.clip();drawStrTo(ctx,'FINAL FRONTIER',lx,30,'#ef7d57',5);ctx.restore();
 txt('A STAR TREK THEMED ROGUELIKE',W/2,62,'#73eff7',1,'c');lcars(W/2-120,74,240,4,'#ff9966');
 if(btn(W/2-60,204,120,14,'NEW VOYAGE',{key:['Enter','Space'],col:'#ffcd75'})){S='faction';sfx.chirp();}
 txt('JUMP ACROSS 5 SECTORS. FIGHT STARSHIPS. SEND AWAY TEAMS. DEFEAT THE BORG.',W/2,226,'#94b0c2',1,'c');
 txt('UNOFFICIAL FAN GAME. NOT AFFILIATED WITH PARAMOUNT OR CBS.',W/2,258,'#333c57',1,'c');}
function renderFaction(){drawStars(0.15);txt('CHOOSE YOUR ALLEGIANCE',W/2,10,'#ffcd75',2,'c');
 const cw=112,x0=(W-cw*4-18)/2;FACTIONS.forEach((F,i)=>{const x=x0+i*(cw+6),y=30,h=196,sel=i===facSel;frame9(x,y,cw,h,sel?F.col:'#333c57','#0b0d17');
  lcars(x+4,y+4,cw-8,9,F.col);txt(F.short,x+cw/2,y+6,'#0b0d17',1,'c',null);
  drawShip(SHIPSPR[F.art],x+cw/2,y+40+(sel?Math.sin(anim*0.06)*2:0),false,1,1.4,false);
  txt(F.ship,x+cw/2,y+64,'#f4f4f4',1,'c');txt(F.cls,x+cw/2,y+72,'#566c86',1,'c');
  ['WEAPONS','SHIELDS','SYSTEMS','HULL'].forEach((n,j)=>{const v=[F.sys.weapons,F.sys.shields,Math.round((F.sys.engines+F.sys.sensors)/2),Math.round(F.hull/8)][j];txt(n,x+6,y+84+j*9,'#94b0c2');for(let k=0;k<5;k++)rect(x+60+k*9,y+84+j*9,7,5,k<v?F.col:'#333c57');});
  txt('CREW: '+F.crew.length,x+6,y+122,'#94b0c2');txt(F.cloak?'CLOAKING DEVICE':'NO CLOAK',x+6,y+130,F.cloak?'#a7f070':'#566c86');
  wrap(F.perk,26).forEach((l,j)=>txt(l,x+6,y+142+j*8,'#ffcd75'));
  if(inR(x,y,cw,h)){if(facSel!==i){facSel=i;sfx.hover();}if(mouse.lp){mouse.lp=false;newRun(i);}}});
 if(hitk(['ArrowLeft','KeyA'])){facSel=(facSel+3)%4;sfx.hover();}if(hitk(['ArrowRight','KeyD'])){facSel=(facSel+1)%4;sfx.hover();}if(hitk(['Enter','Space']))newRun(facSel);
 if(btn(W/2-40,236,80,13,'BACK',{key:['Escape'],col:'#b13e53'}))S='title';
 txt('CLICK A SHIP OR USE < > AND ENTER',W/2,256,'#566c86',1,'c');}
const NODEIC={hostile:['!','#ff6070'],event:['?','#ffcd75'],planet:['P','#a7f070'],store:['$','#73eff7'],nebula:['~','#ff77a8'],empty:['.','#94b0c2'],exit:['>','#ffcd75'],boss:['B','#a7f070'],start:['*','#41a6f6']};
function shipHUD(){const s=R.ship;rect(0,0,W,24,'#0b0d17');rect(3,3,6,18,R.F.col);txt(s.name,14,3,R.F.col);
 rect(14,11,90,5,'#1a1c2c');rect(15,12,Math.round(88*s.hull/s.maxHull),3,s.hull<s.maxHull*0.3?'#ff6070':'#a7f070');txt(s.hull+'/'+s.maxHull,108,11,'#a7f070');
 const res=[['DILITHIUM',R.fuel,'#ff77a8'],['TORPEDOES',s.torps,'#ef7d57'],['LATINUM',R.lat,'#ffcd75'],['CREW',alive().length,'#41a6f6']];res.forEach((r,i)=>{txt(r[0],150+i*62,3,'#566c86');txt(r[1],150+i*62,11,r[2],1);});
 SYS.forEach((k,i)=>{const x=W-112+i*28;txt(SYSN[k].slice(0,3),x,3,SYSCOL[k]);for(let j=0;j<s.sys[k].lvl;j++)rect(x+j*5,12,4,4,j>=s.sys[k].lvl-s.sys[k].dmg?'#b13e53':SYSCOL[k]);});
 txt('PWR '+s.power,W-112,18,'#566c86');}
function renderMap(){drawStars(0.05,R.map.neb);const M=R.map,cur=M.nodes[M.cur];
 if(M.front>-1){const fx=34+M.front*(412/7)+30;ctx.globalAlpha=0.18+0.05*Math.sin(anim*0.05);rect(0,24,Math.max(0,fx),214,'#38b764');ctx.globalAlpha=1;for(let y=30;y<236;y+=6)rect(Math.max(0,fx)+Math.sin(y*0.2+anim*0.05)*3,y,2,3,'#a7f070');txt('BORG',Math.max(4,fx-30),30,'#a7f070');}
 for(const n of M.nodes)for(const e of n.edges){const m=M.nodes[e];if(m.id<n.id)continue;const act=(n===cur||m===cur);line(n.x,n.y,m.x,m.y,act?'#41a6f6':'#29366f');}
 for(const n of M.nodes){const reach=cur.edges.includes(n.id);const known=n.visited||M.revealed||n.type==='store'||n.type==='exit'||n.type==='boss'||(reach&&R.ship.sys.sensors.lvl>=3);const ic=known?NODEIC[n.type]:['?','#94b0c2'];
  const hov=reach&&!uiBlock&&Math.hypot(mouse.x-n.x,mouse.y-n.y)<9;const r=n===cur?7:6;disc(n.x,n.y,r+1,'#0b0d17');disc(n.x,n.y,r,n.col<=M.front?'#38503a':n.visited?'#333c57':'#29366f');if(reach)ring(n.x,n.y,r+2+((anim>>4)%2),hov?'#ffcd75':'#41a6f6');
  txt(n.visited&&n.type!=='store'&&n.type!=='exit'&&n.type!=='boss'?'':ic[0],n.x,n.y-2,ic[1],1,'c',null);
  if(hov){tip=(known?{hostile:'HOSTILE CONTACT',event:'UNKNOWN SIGNAL',planet:'PLANET: '+(n.planet?n.planet.name:''),store:'STARBASE / TRADING POST',nebula:'NEBULA',empty:'EMPTY SPACE',exit:'EXIT BEACON TO THE NEXT SECTOR',boss:'BORG CUBE',start:'START'}[n.type]:'UNEXPLORED')+(n.visited?' (VISITED)':'')+'. JUMP COSTS 1 DILITHIUM.';if(mouse.lp&&!JUMP){mouse.lp=false;jumpTo(n);}}}
 const sp=SHIPSPR[R.ship.art];drawShip(sp,cur.x,cur.y-14+Math.sin(anim*0.08),false,1,0.5,false);
 shipHUD();
 rect(0,238,W,32,'#0b0d17');txt('SECTOR '+R.sector+'/5: '+SECTORS[R.sector-1],6,242,'#ffcd75');txt('CLICK A LINKED SYSTEM TO JUMP. REACH THE EXIT BEACON (>) BEFORE THE BORG CATCH UP.',6,252,'#566c86');
 if(cur.type==='exit'&&btn(W-124,242,118,13,'WARP TO NEXT SECTOR',{col:'#ffcd75',key:['Enter']})){R.sector++;genSector();sfx.warp();toast('ENTERING '+SECTORS[R.sector-1],'#ffcd75');}
 if(cur.type==='store'&&btn(W-124,242,118,13,'VISIT STARBASE',{col:'#73eff7'}))openStore();
 if(cur.type==='planet'&&cur.planet&&!cur.planet.done&&btn(W-124,242,118,13,'ORBIT PLANET',{col:'#a7f070'})){PLANET=cur.planet;S='planet';}
 if(btn(W-124,256,56,12,'CREW',{col:'#41a6f6',key:['KeyC']}))crewPanel=!crewPanel;
 if(btn(W-64,256,58,12,(muted?'UNMUTE':'MUTE'),{col:'#566c86',key:['KeyM']}))setMute(!muted);
 if(crewPanel)renderCrewPanel();}
function renderCrewPanel(){uiBlock=false;frame9(40,30,400,204,'#41a6f6','#0b0d17');txt('CREW ROSTER  -  CLICK A STATION TO REASSIGN',W/2,36,'#ffcd75',1,'c');
 R.crew.forEach((c,i)=>{const y=48+i*21;if(i>=8)return;ctx.globalAlpha=c.alive?1:0.4;ctx.drawImage(crewSpr(c).r,48,y+2);txt(c.name,64,y+2,ROLES[c.role].col);txt(c.race+' '+ROLES[c.role].n+' LV'+c.lvl,64,y+10,'#94b0c2');
  rect(174,y+3,50,4,'#333c57');rect(174,y+3,Math.round(50*c.hp/c.maxHp),4,'#a7f070');txt(c.alive?c.hp+'/'+c.maxHp:'K.I.A.',174,y+10,c.alive?'#94b0c2':'#ff6070');
  if(c.alive)STATIONS.forEach((st,j)=>{const on=c.station===st;if(btn(232+j*40,y+3,38,11,STN[st].n.slice(0,5),{sel:on,col:STN[st].role===c.role?'#566c86':'#333c57',tip:STN[st].n+': '+STN[st].d+(STN[st].role===c.role?' (BEST FIT)':' (HALF BONUS, BEST FOR '+ROLES[STN[st].role].n+')')})){for(const o of R.crew)if(o.station===st)o.station=null;c.station=on?null:st;}});ctx.globalAlpha=1;});
 txt('ITEMS: MEDKIT X'+R.items.medkit+'  GRENADE X'+R.items.grenade+'  STIM X'+R.items.stim+(R.tribbles?'  TRIBBLES: '+R.tribbles:''),W/2,222,'#94b0c2',1,'c');
 uiBlock=false;}
function renderPlanet(){drawStars(0.05,R.map.neb);const p=PLANET,t=anim;const col={grass:'#38b764',desert:'#c8a060',ice:'#c8d6e2',lava:'#b13e53',cave:'#566c86',station:'#94b0c2'}[p.t.th];
 disc(150,140,60,'#0b0d17');disc(150,140,58,col);ctx.globalAlpha=0.3;disc(132,122,30,'#ffffff');ctx.globalAlpha=1;for(let i=0;i<8;i++){ctx.fillStyle='#1a1c2c';ctx.globalAlpha=0.25;ctx.fillRect(110+((i*37+t*0.2)%80),100+i*10,20,3);}ctx.globalAlpha=1;
 drawShip(SHIPSPR[R.ship.art],250,80+Math.sin(t*0.05)*2,false,1,1,false);shipHUD();
 frame9(240,100,230,140,'#a7f070','#0b0d17');txt(p.name,250,108,'#a7f070',2);txt(p.t.n,250,122,'#94b0c2');
 wrap(p.t.d+' '+OBJS[p.o].d,52).forEach((l,i)=>txt(l,250,134+i*8,'#f4f4f4'));txt('OBJECTIVE: '+OBJS[p.o].n,250,160,'#ffcd75');
 txt('LIFE SIGNS: '+(R.ship.sys.sensors.lvl>=2?p.foes.map(k=>FOES[k].n).join(', '):'UNCLEAR (UPGRADE SENSORS)'),250,170,'#ff6070');
 if(btn(250,200,100,14,'BEAM DOWN',{col:'#a7f070',key:['Enter']})){startAwaySelect({kind:'planet',foes:p.foes,theme:p.t.th,obj:p.o});p.done=true;}
 if(btn(358,200,100,14,'LEAVE ORBIT',{col:'#b13e53',key:['Escape']}))S='map';}
function renderEvent(){drawStars(0.05,R.map.neb);shipHUD();const e=EV.e;frame9(50,36,380,200,'#ffcd75','#0b0d17');lcars(56,42,368,9,'#ff9966');txt(e.title,W/2,44,'#0b0d17',1,'c',null);
 if(!EV.res){wrap(e.text,88).forEach((l,i)=>txt(l,62,60+i*9,'#f4f4f4'));let y=130;e.opts.forEach((o,i)=>{const okk=!o.req||o.req();const lab=(i+1)+'. '+o.t;if(okk||o.t.startsWith('[')){if(btn(62,y,356,13,lab,{dis:!okk,key:['Digit'+(i+1)],col:o.t.startsWith('[')?'#73eff7':'#41a6f6'})){EV.res=o.go();sfx.chirp();}y+=17;}});}
 else{wrap(EV.res.text,88).forEach((l,i)=>txt(l,62,64+i*9,'#ffcd75'));if(btn(W/2-50,208,100,14,'CONTINUE',{key:['Enter','Space']})){const a=EV.res.after;EV=null;if(S==='event')S='map';if(a)a();}}}
function renderStore(){drawStars(0.05,R.map.neb);shipHUD();frame9(30,30,420,206,'#73eff7','#0b0d17');txt('STARBASE '+(R.sector*111+7)+'  -  TRADING POST',W/2,36,'#73eff7',1,'c');if(R.F.id==='ferengi')txt('FERENGI DISCOUNT: 25% OFF',W/2,44,'#ffcd75',1,'c');
 txt('SUPPLIES',44,52,'#ffcd75');STORE.stock.forEach((it,i)=>{const y=62+i*16;txt(it.n,44,y+3,it.sold?'#566c86':'#f4f4f4');if(btn(160,y,60,12,it.sold?'SOLD':price(it.p)+' LAT',{dis:it.sold||R.lat<price(it.p),col:'#ffcd75'}))buy(it);});
 txt('SHIPYARD',244,52,'#ffcd75');const s=R.ship;
 const rp=price(2),need=s.maxHull-s.hull;txt('REPAIR HULL ('+need+')',244,65,'#f4f4f4');if(btn(366,62,70,12,'1 PT: '+rp,{dis:!need||R.lat<rp,col:'#a7f070'})){R.lat-=rp;s.hull++;sfx.coin();}
 const fixAll=Math.min(need,Math.floor(R.lat/rp));if(btn(366,76,70,12,'MAX: '+fixAll*rp,{dis:!fixAll,col:'#a7f070'})){R.lat-=fixAll*rp;s.hull+=fixAll;sfx.coin();}
 SYS.forEach((k,i)=>{const y=94+i*16,lv=s.sys[k].lvl,p=price(14+lv*8);txt(SYSN[k]+' LV'+lv+(s.sys[k].dmg?' (DMG '+s.sys[k].dmg+')':''),244,y+3,SYSCOL[k]);if(btn(366,y,70,12,lv>=5?'MAX':'UPG: '+p,{dis:lv>=5||R.lat<p,col:'#ffcd75',tip:'+1 '+SYSN[k]+' LEVEL. ALSO REPAIRS IT.'})){R.lat-=p;s.sys[k].lvl++;s.sys[k].dmg=0;sfx.coin();}});
 const pp=price(20+s.power*5);txt('REACTOR POWER '+s.power,244,161,'#f4f4f4');if(btn(366,158,70,12,s.power>=14?'MAX':'UPG: '+pp,{dis:s.power>=14||R.lat<pp,col:'#ffcd75',tip:'+1 POWER TO SPREAD ACROSS SYSTEMS IN COMBAT.'})){R.lat-=pp;s.power++;sfx.coin();}
 const hp=price(25);txt('REINFORCE HULL +5 MAX',244,177,'#f4f4f4');if(btn(366,174,70,12,'UPG: '+hp,{dis:R.lat<hp,col:'#ffcd75'})){R.lat-=hp;s.maxHull+=5;s.hull+=5;sfx.coin();}
 if(!R.ship.cloak&&R.F.id!=='fed'){}
 if(btn(W/2-50,214,100,14,'UNDOCK',{key:['Escape','Enter'],col:'#b13e53'})){S='map';setMusic('explore');}}
function renderEnd(win){drawStars(win?0.4:0.05);if(win){drawShip(SHIPSPR[R.ship.art],W/2,90+Math.sin(anim*0.05)*3,false,1,2,false);}
 txt(win?'THE BORG ARE DEFEATED!':'VOYAGE ENDED',W/2,win?142:50,win?'#a7f070':'#ff6070',3,'c');if(!win)wrap(R.why||'',70).forEach((l,i)=>txt(l,W/2,82+i*9,'#f4f4f4',1,'c'));
 if(win)txt('THE '+R.ship.name+' RETURNS HOME A LEGEND.',W/2,166,'#ffcd75',1,'c');
 const st=R.stats;[['SECTOR REACHED',R.sector+'/5'],['JUMPS',st.jumps],['SHIPS DEFEATED',st.ships],['AWAY MISSIONS WON',st.missions],['FOES DEFEATED',st.kills],['LATINUM EARNED',st.lat],['CREW SURVIVING',alive().length+'/'+R.crew.length]].forEach((r,i)=>{txt(r[0],W/2-90,(win?180:110)+i*9,'#94b0c2');txt(r[1],W/2+90,(win?180:110)+i*9,'#f4f4f4',1,'r');});
 if(btn(W/2-60,250,120,13,'NEW VOYAGE',{key:['Enter'],col:'#ffcd75'})){S='faction';setMusic('menu');}}
// ---------------- loop ----------------
function update(){anim++;updParts();if(shake>0){shake*=0.85;if(shake<0.3)shake=0;}if(flashA>0)flashA=Math.max(0,flashA-0.04);
 if(S==='map')updJump();if(S==='combat')updCombat();if(S==='away'&&A){if(A.busy>0)A.busy--;}}
function render(){tip=null;uiBlock=crewPanel&&S==='map';ctx.save();if(shake>0)ctx.translate(Math.round(rand(-shake,shake)),Math.round(rand(-shake,shake)));
 switch(S){case 'title':renderTitle();break;case 'faction':renderFaction();break;case 'map':if(crewPanel){uiBlock=false;}renderMap();break;case 'planet':renderPlanet();break;case 'event':renderEvent();break;case 'store':renderStore();break;case 'combat':renderCombat();break;
  case 'awaysel':renderAwaySel();break;case 'away':awayInput();if(S==='away')renderAway();else if(S==='awayend')renderAwayEnd();break;case 'awayend':renderAwayEnd();break;case 'gameover':renderEnd(false);break;case 'victory':renderEnd(true);break;}
 ctx.restore();drawToasts(S==='event'||S==='awaysel'||S==='faction'||S==='title');if(flashA>0){ctx.globalAlpha=Math.min(1,flashA);rect(0,0,W,H,flashC);ctx.globalAlpha=1;}drawTip();drawCursor();
 if(pressed.KeyM&&S!=='map')setMute(!muted);
 for(const k in pressed)delete pressed[k];mouse.lp=false;mouse.rp=false;}
let last=performance.now(),acc=0;const STEP=1000/60;
function loop(now){acc+=Math.min(100,now-last);last=now;while(acc>=STEP){acc-=STEP;update();}render();requestAnimationFrame(loop);}
setMusic('menu');requestAnimationFrame(loop);
window.__ff={get R(){return R;},get S(){return S;},set S(v){S=v;},get C(){return C;},get A(){return A;},newRun,startCombat,startAway,startAwaySelect,startEvent,EVENTS,update,render,act,genSector,openStore,mouse,pressed};
