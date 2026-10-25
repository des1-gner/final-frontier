// ================= SHIP COMBAT (turn-based, FTL flavoured) =================
let C=null;
const effLvl=s=>Math.max(0,s.lvl-s.dmg);
function totalPower(side){return side.power+(side===R.ship&&atStation('engineering')?(atStation('engineering').role==='ENG'?2:1):0);}
function autoAlloc(side,bias){const order=bias||['shields','weapons','engines','sensors'];side.alloc=side.alloc||{};for(const k of SYS)side.alloc[k]=0;let p=totalPower(side);
 for(let pass=0;pass<6&&p>0;pass++)for(const k of order){if(p<=0)break;if(side.alloc[k]<effLvl(side.sys[k])){side.alloc[k]++;p--;}}}
function fixAlloc(side){let used=0;for(const k of SYS){side.alloc[k]=Math.min(side.alloc[k]||0,effLvl(side.sys[k]));used+=side.alloc[k];}let over=used-totalPower(side);for(const k of ['sensors','engines','weapons','shields']){while(over>0&&side.alloc[k]>0){side.alloc[k]--;over--;}}}
function usedPower(side){return SYS.reduce((s,k)=>s+(side.alloc[k]||0),0);}
function startCombat(key,o={}){const d=ESHIPS[key];const sc=d.boss?1:(o.overrun?0.6+R.sector*0.15:0.75+R.sector*0.2);
 const sys={};for(const k of SYS)sys[k]={lvl:Math.max(1,Math.round(d.sys[k]*(d.boss?1:Math.min(1.4,0.8+R.sector*0.12)))),dmg:0};
 const en={key,d,name:d.n,art:d.art,hull:Math.round(d.hull*sc),maxHull:Math.round(d.hull*sc),sys,power:d.power+(d.boss?0:Math.floor(R.sector/2)),torps:d.torps,sh:0,cloakT:0,adapt:0,evade:0,bonus:0};
 autoAlloc(en,['weapons','shields','engines','sensors']);if(!R.ship.alloc)autoAlloc(R.ship);fixAlloc(R.ship);
 C={en,phase:'player',q:[],target:'weapons',log:[],turn:1,evade:0,cloakT:0,bonus:0,hailed:false,overrun:o.overrun,shake:0};
 C.sh=shMax(R.ship);en.sh=shMax(en);S='combat';setMusic('battle');sfx.alert();clog(o.overrun?'THE BORG HAVE OVERRUN THIS SYSTEM!':'RED ALERT! '+en.name+' ENGAGING.','#ff6070');}
function clog(s,c='#f4f4f4'){C.log.push({s,c});if(C.log.length>4)C.log.shift();}
const shMax=side=>(side.alloc.shields||0)*2;
function evasion(side,isMe){let e=(side.alloc.engines||0)*7;if(isMe){e+=stnBonus('helm')*10+C.evade;}else e+=side.evade;return clamp(e,0,65);}
function accuracy(side,isMe){let a=72+(side.alloc.sensors||0)*6;if(isMe)a+=stnBonus('tactical')*10;return a;}
// ---- queued animations ----
function qAnim(o){C.q.push(Object.assign({t:0},o));}
function shipPos(isMe){return isMe?{x:118,y:112}:{x:364,y:112};}
function fire(att,def,isMe,kind){const ap=shipPos(isMe),dp=shipPos(!isMe);const wpn=isMe?R.F.wpn:att.d.wpn;
 const cloakB=isMe?C.bonus:att.bonus;if(isMe)C.bonus=0;else att.bonus=0;
 const hitP=cloakB?100:accuracy(att,isMe)-evasion(def,!isMe);const hit=Math.random()*100<hitP;
 let dmg=kind==='torp'?(wpn==='plasma'?7:5):Math.max(1,1+(att.alloc.weapons||0)+(isMe?Math.floor(stnBonus('tactical')):Math.floor(R.sector/2)+(att.d.tier>=2?1:0)));
 if(kind!=='torp'&&def.d&&def.d.adapt&&isMe){dmg=Math.max(1,Math.round(dmg*Math.max(0.5,1-def.adapt*0.12)));}
 if(cloakB)dmg=Math.ceil(dmg*1.5);
 const tgtSys=isMe?C.target:choice(['weapons','weapons','shields','shields','engines','sensors']);
 const col=kind==='torp'?(wpn==='plasma'?'#a7f070':'#ff6040'):WPNCOL[wpn]||'#ef7d57';
 if(kind==='torp'){sfx.torp();}else if(wpn==='phaser')sfx.phaser();else sfx.disruptor();
 qAnim({type:kind==='torp'?'torp':'beam',x0:ap.x+(isMe?40:-40),y0:ap.y+(isMe?-4:0),x1:dp.x+rand(-20,20),y1:dp.y+rand(-12,12),col,dur:kind==='torp'?34:28,miss:!hit,
  done:()=>{if(!hit){clog((isMe?'WE':'THEY')+' MISSED!','#94b0c2');return;}applyHit(def,!isMe,dmg,kind,tgtSys,isMe);}});}
function applyHit(def,defIsMe,dmg,kind,tgtSys,attIsMe){let sh=defIsMe?C.sh:def.sh;let hull=0,absorbed=0;
 if(kind==='torp'){absorbed=Math.min(sh,Math.ceil(dmg/3));sh-=absorbed;hull=dmg-absorbed;}else{absorbed=Math.min(sh,dmg);sh-=absorbed;hull=dmg-absorbed;}
 if(defIsMe)C.sh=sh;else def.sh=sh;const p=shipPos(defIsMe);
 if(absorbed>0){qAnim({type:'shield',x:p.x,y:p.y,me:defIsMe,dur:18});sfx.shield();}
 if(hull>0){const side=defIsMe?R.ship:def;side.hull-=hull;burst(p.x+rand(-20,20),p.y+rand(-10,10),20,'#ffcd75',2.5,30);burst(p.x,p.y,8,'#ef7d57',1.5,40,2);sfx.boom(hull/5);shake=Math.max(shake,hull);
  const s=side.sys[tgtSys];if(chance(0.65)&&s.dmg<s.lvl){s.dmg++;clog((defIsMe?'OUR ':'ENEMY ')+SYSN[tgtSys]+' DAMAGED!',defIsMe?'#ff6070':'#a7f070');fixAlloc(side);if(defIsMe){const st={weapons:'tactical',engines:'helm',shields:'engineering',sensors:'science'}[tgtSys];const c=atStation(st);if(c&&chance(0.5)){hurtCrew(c,4);clog(c.name+' IS INJURED AT '+STN[st].n,'#ff6070');}}}
  clog((defIsMe?'HULL HIT! -':'DIRECT HIT! -')+hull+' HULL',defIsMe?'#ff6070':'#ffcd75');
  if(!defIsMe&&def.d.adapt){if(kind!=='torp'){def.adapt++;if(def.adapt===3)clog('THE BORG ARE ADAPTING TO OUR PHASERS!','#a7f070');}else if(def.adapt>0){def.adapt=Math.max(0,def.adapt-2);clog('TORPEDO HIT DISRUPTS THEIR ADAPTATION!','#ffcd75');}}
  if(defIsMe&&R.ship.hull<=0){R.ship.hull=0;qAnim({type:'die',me:true,dur:60,done:()=>gameOver('THE '+R.ship.name+' WAS DESTROYED BY THE '+C.en.name+'.')});}
  if(!defIsMe&&def.hull<=0){def.hull=0;C.phase='anim';qAnim({type:'die',me:false,dur:70,done:()=>combatWon()});}}
 else clog((defIsMe?'OUR':'THEIR')+' SHIELDS HOLD.','#41a6f6');}
// ---- player actions ----
function act(a){if(C.phase!=='player')return;const en=C.en,me=R.ship;C.evade=0;let endsTurn=true;
 if(C.cloakT>0&&(a==='phaser'||a==='torp')){C.cloakT=0;C.bonus=1;clog('DECLOAKING. FIRE!','#a7f070');}
 switch(a){
  case 'phaser':fire(me,en,true,'phaser');break;
  case 'torp':me.torps--;fire(me,en,true,'torp');break;
  case 'evade':C.evade=25;C.sh=Math.min(shMax(me),C.sh+1);clog('EVASIVE PATTERN DELTA!','#ffcd75');break;
  case 'repair':{let best=null;for(const k of SYS)if(me.sys[k].dmg>0&&(!best||me.sys[k].dmg>me.sys[best].dmg))best=k;const n=atStation('engineering')?2:1;for(let i=0;i<n;i++){if(best&&me.sys[best].dmg>0)me.sys[best].dmg--;}gain('hull',2,true);clog(best?'DAMAGE CONTROL REPAIRS '+SYSN[best]+'. +2 HULL':'HULL PATCHED. +2 HULL','#a7f070');break;}
  case 'hail':{C.hailed=true;if(en.d.wpn==='borg'){clog('"RESISTANCE IS FUTILE."','#a7f070');break;}
   let p=0.12+(R.F.id==='fed'?0.35:0)+(hasRole('CMD')?0.08:0)+(en.hull<en.maxHull*0.4?0.2:0);if(Math.random()<p){C.phase='done';qAnim({type:'wait',dur:30,done:()=>{toast('THEY AGREE TO STAND DOWN.','#a7f070');endCombat();}});clog('THEY ACCEPT OUR TERMS. CEASEFIRE.','#a7f070');return;}clog('THEY REFUSE TO STAND DOWN.','#ff6070');break;}
  case 'bribe':{const cost=price(15+R.sector*8);if(R.lat<cost)return;R.lat-=cost;sfx.coin();C.phase='done';clog('THEY TAKE '+cost+' LATINUM AND LEAVE.','#ffcd75');qAnim({type:'wait',dur:30,done:endCombat});return;}
  case 'board':C.phase='done';sfx.beam();startAwaySelect({kind:'board',ship:en.key,foes:[en.d.crew],reward:'board'});return;
  case 'cloak':C.cloakT=2;sfx.cloak();clog('CLOAKING DEVICE ENGAGED.','#a7f070');break;
  case 'flee':{const p=0.35+(me.alloc.engines||0)*0.12+stnBonus('helm')*0.1;if(Math.random()<p){gain('fuel',-1,true);C.phase='done';sfx.warp();clog('WARP SPEED, NOW!','#ffcd75');qAnim({type:'flee',dur:50,done:()=>{toast('WE ESCAPED','#ffcd75');endCombat();}});return;}clog('THEY ARE PURSUING! ESCAPE FAILED.','#ff6070');break;}}
 if(endsTurn){C.phase='anim';C.next='enemy';}}
function enemyTurn(){const en=C.en,me=R.ship;if(en.hull<=0)return;en.evade=0;
 if(C.cloakT>0&&chance(0.8)){clog('THE ENEMY CANNOT FIND US.','#a7f070');return;}
 if(en.cloakT>0){en.cloakT--;if(en.cloakT===0){en.bonus=1;clog(en.name+' DECLOAKS!','#ff6070');}else{clog('THE ENEMY IS CLOAKED...','#94b0c2');return;}}
 if(en.d.cloak&&chance(0.12)&&en.sh<shMax(en)){en.cloakT=2;sfx.cloak();clog(en.name+' CLOAKS!','#ff6070');return;}
 if(en.hull<en.maxHull*0.35&&chance(0.3)){let best=null;for(const k of SYS)if(en.sys[k].dmg>0)best=k;if(best){en.sys[best].dmg--;en.hull+=2;clog('THE ENEMY REPAIRS THEIR '+SYSN[best]+'.','#94b0c2');return;}en.evade=25;clog('THE ENEMY TAKES EVASIVE ACTION.','#94b0c2');return;}
 const melee=['klingon','borg','jem','gorn'].includes(en.d.crew);if(melee&&C.sh<=0&&chance(0.18)&&alive().length>=2&&!C.boarded){C.boarded=true;clog('INTRUDER ALERT! THEY ARE BOARDING US!','#ff6070');sfx.beam();C.phase='done';qAnim({type:'wait',dur:30,done:()=>startAway({kind:'defend',theme:'station',foes:[en.d.crew],team:alive().slice(0,4),reward:'defend'})});return;}
 if((en.alloc.weapons||0)<=0){clog('THEIR WEAPONS ARE OFFLINE!','#a7f070');return;}
 if(en.torps>0&&chance(0.3)){en.torps--;fire(en,me,false,'torp');}else fire(en,me,false,'phaser');
 if(en.d.boss&&chance(0.5))fire(en,me,false,'phaser');}
function newTurn(){const me=R.ship,en=C.en;C.turn++;fixAlloc(me);fixAlloc(en);
 C.sh=Math.min(shMax(me),C.sh+1+Math.floor(stnBonus('science')));en.sh=Math.min(shMax(en),en.sh+1);
 if(en.d.boss&&en.hull<en.maxHull&&C.turn%2===0)en.hull=Math.min(en.maxHull,en.hull+1);
 if(C.cloakT>0)C.cloakT--;autoAlloc(en,['weapons','shields','engines','sensors']);C.phase='player';}
function updCombat(){if(!C)return;const a=C.q[0];
 if(a){a.t++;if(a.t>=a.dur){C.q.shift();if(a.done)a.done();}return;}
 if(C.phase==='anim'){if(C.next==='enemy'){C.next=null;enemyTurn();if(!C.q.length&&C.phase==='anim')C.next='new';else C.next='new';return;}if(C.next==='new'){C.next=null;if(S==='combat'&&C.phase==='anim')newTurn();}}}
function combatWon(){const en=C.en,d=en.d;R.stats.ships++;sfx.bigboom();flash('#ffffff',0.6);
 if(d.boss){S='victory';setMusic('menu');sfx.victory();return;}
 const lat=Math.round(randi(d.loot[0],d.loot[1])*(1+R.sector*0.15));gain('lat',lat);if(chance(0.5))gain('fuel',randi(1,2));if(chance(0.4))gain('torps',randi(1,2));
 for(const c of alive())if(c.station)crewXp(c,4);endCombat();}
function endCombat(){C=null;warpFx=0;if(S==='combat'||S==='away'||S==='awaysel'||S==='awayend')S='map';setMusic('explore');tribbleTick();}
// ---- combat rendering ----
function drawShip(spr,x,y,left,alpha,scale,hit){const w=spr.w*scale,h=spr.h*scale;ctx.globalAlpha=alpha;ctx.drawImage(hit?spr.wr:(left?spr.l:spr.r),Math.round(x-w/2),Math.round(y-h/2),w,h);ctx.globalAlpha=1;}
function renderCombat(){drawStars(0.2,R.map.neb);const me=R.ship,en=C.en;const t=anim;
 const ms=SHIPSPR[me.art],es=SHIPSPR[en.art];const mp=shipPos(true),ep=shipPos(false);const bob1=Math.sin(t*0.04)*2,bob2=Math.sin(t*0.035+1)*2;
 const dieA=C.q[0]&&C.q[0].type==='die'?C.q[0]:null,fleeA=C.q[0]&&C.q[0].type==='flee'?C.q[0]:null;
 let mx=mp.x,ex=ep.x;if(fleeA){mx+=Math.pow(fleeA.t/50,3)*500;warpFx=fleeA.t/50;}
 if(!(dieA&&dieA.me&&dieA.t>40))drawShip(ms,mx,mp.y+bob1,false,C.cloakT>0?0.2+0.08*Math.sin(t*0.3):1,2,false);
 const esc=en.d.boss?1.6:2;if(!(dieA&&!dieA.me&&dieA.t>40))drawShip(es,ex,ep.y+bob2,true,en.cloakT>0?0.08:1,esc,dieA&&!dieA.me&&dieA.t%6<3);
 if(dieA){const p=dieA.me?mp:ep;if(dieA.t%4===0){burst(p.x+rand(-50,50),p.y+rand(-25,25),25,choice(['#ffcd75','#ef7d57','#f4f4f4']),3,35,2);sfx.boom(1.5);}}
 if(C.sh>0&&C.cloakT<=0){ctx.globalAlpha=0.12+0.04*Math.sin(t*0.1);ringE(mp.x,mp.y+bob1,82,44,'#41a6f6');ctx.globalAlpha=1;}
 if(en.sh>0&&en.cloakT<=0){ctx.globalAlpha=0.12+0.04*Math.sin(t*0.1);ringE(ep.x,ep.y+bob2,en.d.boss?70:82,en.d.boss?66:44,'#a7f070');ctx.globalAlpha=1;}
 const a=C.q[0];
 if(a&&a.type==='beam'){const k=a.t/a.dur,x1=a.miss?a.x1+(a.x1>a.x0?60:-60):a.x1,y1=a.miss?a.y1-30:a.y1;line(a.x0,a.y0,x1,y1,'#1a1c2c',4);line(a.x0,a.y0,x1,y1,a.col,3);line(a.x0,a.y0,x1,y1,(t>>1)%2?'#fff4c4':'#ffffff',1);if(k>0.5)burst(x1,y1,2,a.col,1.5,10);}
 if(a&&a.type==='torp'){const k=a.t/a.dur,x=lerp(a.x0,a.miss?a.x1+(a.x1>a.x0?80:-80):a.x1,k),y=lerp(a.y0,a.miss?a.y1-40:a.y1,k)-Math.sin(k*Math.PI)*16;disc(x,y,4,a.col);disc(x,y,2,'#ffffff');P(x,y,rand(-0.3,0.3),rand(-0.3,0.3),14,a.col,2);}
 if(a&&a.type==='shield'){ctx.globalAlpha=1-a.t/a.dur;const big=!a.me&&en.d.boss;ringE(a.x,a.y,big?72:84,big?68:46,a.me?'#73eff7':'#a7f070');ringE(a.x,a.y,big?70:82,big?66:44,'#ffffff');ctx.globalAlpha=1;}
 for(const s of [me,en])if(s.hull<s.maxHull*0.5&&t%6===0){const p=s===me?mp:ep;P(p.x+rand(-30,30),p.y+rand(-12,12),rand(-0.5,0),rand(-0.6,-0.2),40,'#566c86',2);}
 drawParts();
 // top bars
 const bar=(x,y,w,v,m,col,label)=>{rect(x,y,w,6,'#0b0d17');rect(x+1,y+1,Math.round((w-2)*clamp(v/m,0,1)),4,col);txt(label,x,y-7,'#94b0c2');};
 txt(me.name,6,4,R.F.col);bar(6,20,120,me.hull,me.maxHull,'#a7f070','HULL '+me.hull+'/'+me.maxHull);bar(6,34,120,C.sh,Math.max(1,shMax(me)),'#41a6f6','SHIELDS '+C.sh+'/'+shMax(me));
 txt(en.name,W-6,4,'#ff6070',1,'r');bar(W-126,20,120,en.hull,en.maxHull,'#ff6070','');txt('HULL '+en.hull+'/'+en.maxHull,W-6,13,'#94b0c2',1,'r');bar(W-126,34,120,en.sh,Math.max(1,shMax(en)),'#a7f070','');txt('SHIELDS '+en.sh+'/'+shMax(en),W-6,27,'#94b0c2',1,'r');
 txt('EVASION '+evasion(me,true)+'%  ACCURACY '+accuracy(me,true)+'%',6,44,'#566c86');if(en.adapt>=3)txt('BORG ADAPTATION: PHASERS -'+Math.min(50,en.adapt*12)+'%',W-6,44,'#a7f070',1,'r');
 txt('TURN '+C.turn,W/2,4,'#566c86',1,'c');
 // bottom panel
 frame9(0,182,W,88,'#566c86','#0b0d17');
 // power allocation
 txt('POWER '+usedPower(me)+'/'+totalPower(me),8,187,'#ffcd75');
 SYS.forEach((k,i)=>{const y=197+i*17,s=me.sys[k];txt(SYSN[k],8,y+2,SYSCOL[k]);for(let j=0;j<s.lvl;j++){const x=58+j*9;rect(x,y,7,8,j>=s.lvl-s.dmg?'#b13e53':j<(me.alloc[k]||0)?SYSCOL[k]:'#333c57');}
  if(C.phase==='player'){if(btn(106,y,14,9,'-',{dis:!(me.alloc[k]>0)})){me.alloc[k]--;if(k==='shields')C.sh=Math.min(C.sh,shMax(me));}if(btn(122,y,14,9,'+',{dis:!(me.alloc[k]<effLvl(s)&&usedPower(me)<totalPower(me))}))me.alloc[k]++;}});
 // actions
 const ax=142,ay=188,bw=80,bh=13,canFire=(me.alloc.weapons||0)>0;
 const A=[['phaser',(R.F.wpn==='phaser'?'PHASERS':'DISRUPTORS'),canFire,'FIRE '+(R.F.wpn==='phaser'?'PHASERS':'DISRUPTORS')+' FOR '+(1+(me.alloc.weapons||0)+Math.floor(stnBonus('tactical')))+' DAMAGE. SHIELDS ABSORB IT FIRST.'],
  ['torp',(R.F.wpn==='plasma'?'PLASMA TORP':'TORPEDO')+' ('+me.torps+')',canFire&&me.torps>0,'FIRE A TORPEDO FOR '+(R.F.wpn==='plasma'?7:5)+' DAMAGE. MOSTLY IGNORES SHIELDS. EACH HIT ALSO DISRUPTS BORG ADAPTATION.'],
  ['evade','EVASIVE',true,'+25% EVASION THIS TURN AND +1 SHIELD.'],['repair','DAMAGE CTRL',true,'REPAIR THE MOST DAMAGED SYSTEM (+1 MORE WITH AN ENGINEER) AND +2 HULL.'],
  R.F.id==='ferengi'&&en.d.wpn!=='borg'?['bribe','BRIBE ('+price(15+R.sector*8)+')',R.lat>=price(15+R.sector*8),'PAY THEM TO GO AWAY. ALWAYS WORKS.']:['hail','HAIL',!C.hailed,'OPEN A CHANNEL AND TRY TO END THIS PEACEFULLY. ONCE PER FIGHT.'],
  ['board','BOARD',en.sh<=0&&en.cloakT<=0&&alive().length>0,'BEAM AN AWAY TEAM ONTO THE ENEMY SHIP. NEEDS THEIR SHIELDS DOWN. CAPTURE IT FOR BIG LOOT.'],
  ['cloak','CLOAK',me.cloak&&C.cloakT<=0,me.cloak?'VANISH FOR 2 TURNS. YOUR NEXT SHOT NEVER MISSES AND DEALS +50%.':'THIS SHIP HAS NO CLOAKING DEVICE.'],
  ['flee','WARP OUT',(me.alloc.engines||0)>0&&R.fuel>0&&!en.d.boss,'TRY TO ESCAPE (COSTS 1 DILITHIUM). BETTER ODDS WITH MORE ENGINE POWER.']];
 A.forEach((b,i)=>{const x=ax+(i%2)*(bw+4),y=ay+Math.floor(i/2)*(bh+4);if(btn(x,y,bw,bh,b[1],{dis:!b[2]||C.phase!=='player',tip:b[3],key:['Digit'+(i+1)]}))act(b[0]);});
 // enemy systems (targeting)
 txt('TARGET SYSTEM',314,187,'#ff6070');
 SYS.forEach((k,i)=>{const x=314+(i%2)*82,y=197+Math.floor(i/2)*22,s=en.sys[k],sel=C.target===k;const show=(me.alloc.sensors||0)>=1||R.F.id==='romulan';
  frame9(x,y,78,19,sel?'#ffcd75':'#333c57','#1a1c2c');txt(SYSN[k],x+4,y+4,SYSCOL[k]);for(let j=0;j<s.lvl;j++)rect(x+4+j*7,y+11,5,4,!show?'#333c57':j>=s.lvl-s.dmg?'#b13e53':j<(en.alloc[k]||0)?SYSCOL[k]:'#566c86');
  if(!uiBlock&&inR(x,y,78,19)){tip='TARGET THEIR '+SYSN[k]+'. HULL HITS MAY DAMAGE IT.';if(mouse.lp){C.target=k;sfx.click();}}});
 C.log.forEach((l,i)=>txt(l.s,W/2,150+i*8,l.c,1,'c'));
 if(C.phase!=='player'&&!C.q.length)txt('...',W/2,182-8,'#566c86',1,'c');}
