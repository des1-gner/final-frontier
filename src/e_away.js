// ================= AWAY MISSIONS (turn-based tactical roguelike) =================
let A=null,ASEL=null;
const TS=16,MW=30,MH=13,MY=14;
const ABIL={
 rally:{n:'RALLY',cd:8,d:'WHOLE TEAM HEALS 3 AND DEALS +2 DAMAGE FOR 4 TURNS.'},
 order:{n:'MAKE IT SO',cd:10,d:'EVERY OTHER TEAM MEMBER IMMEDIATELY TAKES A FREE ACTION.'},
 burst:{n:'PHASER BURST',cd:4,d:'FIRE TWICE AT THE TARGET.',tgt:'foe'},
 stun:{n:'STUN',cd:6,d:'PHASERS ON STUN. TARGET LOSES 2 TURNS.',tgt:'foe'},
 scan:{n:'TRICORDER',cd:12,d:'REVEAL THE WHOLE MAP AND ALL LIFEFORMS FOR 15 TURNS.'},
 analyze:{n:'ANALYZE',cd:5,d:'FIND A WEAK POINT. TARGET TAKES +50% DAMAGE FOR 6 TURNS.',tgt:'foe'},
 turret:{n:'TURRET',cd:12,d:'DEPLOY A PHASER TURRET NEXT TO YOU FOR 10 TURNS.'},
 overload:{n:'OVERLOAD',cd:7,d:'OVERLOAD A POWER CELL. 7 DAMAGE IN A 3X3 AREA AROUND THE TARGET.',tgt:'foe'},
 hypo:{n:'HYPOSPRAY',cd:4,d:'HEAL YOURSELF OR AN ADJACENT ALLY FOR 10. CAN REVIVE THE DOWNED.'},
 revive:{n:'TRIAGE',cd:10,d:'HEAL EVERY ADJACENT ALLY FOR 8 AND CURE STUN.'},
};
const THEMES={grass:{f:['#38704a','#3f7a50','#336844'],w:['#5e4632','#8a6a4a'],deco:'#a7f070',liq:'#3b78d8',liqN:'WATER'},desert:{f:['#c8a060','#d0aa68','#bc9658'],w:['#8a6a4a','#b08a5a'],deco:'#6a8a3a',liq:null},ice:{f:['#c8d6e2','#d4e0ea','#bccad6'],w:['#566c86','#94b0c2'],deco:'#f4f4f4',liq:'#41a6f6',liqN:'ICE WATER'},lava:{f:['#3a2a2a','#423030','#332424'],w:['#1a1c2c','#5d2a2a'],deco:'#ef7d57',liq:'#ef7d57',liqN:'LAVA',hot:true},cave:{f:['#3a3a4a','#424256','#333344'],w:['#1a1c2c','#566c86'],deco:'#73eff7',liq:'#29366f',liqN:'POOL'},station:{f:['#333c57','#3a4466','#2e3650'],w:['#566c86','#94b0c2'],deco:'#ffcd75',liq:null,inside:true}};
const tileCache={};
function tileImg(th,kind,v){const key=th+kind+v;if(tileCache[key])return tileCache[key];const T=THEMES[th];const [c,x]=mkCanvas(TS,TS);const r=mulberry(v*97+kind.length*13+th.length);
 if(kind==='f'){x.fillStyle=T.f[v%3];x.fillRect(0,0,TS,TS);for(let i=0;i<6;i++){x.fillStyle=T.f[(v+1+i)%3];x.fillRect(Math.floor(r()*TS),Math.floor(r()*TS),1+(r()*2|0),1);}if(T.inside){x.fillStyle='#29366f';x.fillRect(0,0,TS,1);x.fillRect(0,0,1,TS);if(v===1){x.fillStyle='#ffcd75';x.fillRect(7,7,2,2);}}}
 else if(kind==='w'){x.fillStyle=T.w[0];x.fillRect(0,0,TS,TS);x.fillStyle=T.w[1];x.fillRect(0,0,TS,3);for(let i=0;i<5;i++)x.fillRect(Math.floor(r()*TS),3+Math.floor(r()*12),2,1);if(T.inside){x.fillStyle='#29366f';for(let i=4;i<TS;i+=5)x.fillRect(0,i,TS,1);x.fillStyle='#73eff7';if(v===2)x.fillRect(4,6,8,2);}}
 else if(kind==='d'){x.drawImage(tileImg(th,'f',v),0,0);x.fillStyle=T.deco;if(T.inside){x.fillStyle='#566c86';x.fillRect(3,5,10,8);x.fillStyle=T.deco;x.fillRect(5,7,2,2);x.fillRect(9,7,2,2);}else for(let i=0;i<4;i++){const px=3+Math.floor(r()*10),py=4+Math.floor(r()*9);x.fillRect(px,py,1,3);x.fillRect(px-1,py+1,1,1);x.fillRect(px+1,py,1,1);}}
 return tileCache[key]=c;}
// ---- map generation ----
function genMap(th,interior){const m=[];for(let y=0;y<MH;y++){m.push([]);for(let x=0;x<MW;x++)m[y].push(1);}
 if(interior){const rooms=[];for(let i=0;i<40&&rooms.length<8;i++){const w=randi(4,7),h=randi(3,5),x=randi(1,MW-w-1),y=randi(1,MH-h-1);if(rooms.some(r=>x<r.x+r.w+1&&x+w+1>r.x&&y<r.y+r.h+1&&y+h+1>r.y))continue;rooms.push({x,y,w,h});}
  rooms.sort((a,b)=>a.x-b.x);for(const r of rooms)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)m[y][x]=0;
  for(let i=1;i<rooms.length;i++){const a=rooms[i-1],b=rooms[i];let x=a.x+(a.w>>1),y=a.y+(a.h>>1);const tx=b.x+(b.w>>1),ty=b.y+(b.h>>1);while(x!==tx){m[y][x]=0;x+=Math.sign(tx-x);}while(y!==ty){m[y][x]=0;y+=Math.sign(ty-y);}}
  for(const r of rooms)if(chance(0.6)){const x=r.x+randi(0,r.w-1),y=r.y;if(m[y][x]===0)m[y][x]=2;}}
 else{const dens=th==='cave'?0.48:0.42;for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++)m[y][x]=chance(dens)?1:0;
  for(let it=0;it<4;it++){const n=m.map(r=>r.slice());for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){let c=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(m[y+dy][x+dx]===1)c++;n[y][x]=c>=5?1:0;}for(let y=0;y<MH;y++)m[y]=n[y];}
  // keep largest region
  const reg=new Array(MW*MH).fill(-1);let best=-1,bestN=0,id=0;for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(m[y][x]===0&&reg[y*MW+x]<0){let n=0;const st=[[x,y]];reg[y*MW+x]=id;while(st.length){const [cx,cy]=st.pop();n++;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx>=0&&ny>=0&&nx<MW&&ny<MH&&m[ny][nx]===0&&reg[ny*MW+nx]<0){reg[ny*MW+nx]=id;st.push([nx,ny]);}}}if(n>bestN){bestN=n;best=id;}id++;}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(m[y][x]===0&&reg[y*MW+x]!==best)m[y][x]=1;
  if(bestN<120)return genMap(th,interior);
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++)if(m[y][x]===0){if(chance(0.08))m[y][x]=2;else if(THEMES[th].liq&&chance(0.04)){m[y][x]=3;if(m[y][x+1]===0&&chance(0.5))m[y][x+1]=3;}}}
 return m;}
const walk=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH&&A.map[y][x]!==1;
const opaque=(x,y)=>x<0||y<0||x>=MW||y>=MH||A.map[y][x]===1;
function bfs(sx,sy){const d=new Array(MW*MH).fill(-1);d[sy*MW+sx]=0;const q=[[sx,sy]];while(q.length){const [x,y]=q.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(walk(nx,ny)&&d[ny*MW+nx]<0){d[ny*MW+nx]=d[y*MW+x]+1;q.push([nx,ny]);}}}return d;}
function losT(x0,y0,x1,y1){let dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,e=dx+dy,x=x0,y=y0;while(!(x===x1&&y===y1)){if((x!==x0||y!==y0)&&opaque(x,y))return false;const e2=2*e;if(e2>=dy){e+=dy;x+=sx;}if(e2<=dx){e+=dx;y+=sy;}}return true;}
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const unitAt=(x,y)=>A.team.find(u=>!u.gone&&u.x===x&&u.y===y)||A.foes.find(f=>f.hp>0&&f.x===x&&f.y===y);
function freeNear(x,y){for(let r=0;r<6;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const nx=x+dx,ny=y+dy;if(walk(nx,ny)&&A.map[ny][nx]!==3&&!unitAt(nx,ny))return[nx,ny];}return[x,y];}
// ---- start ----
function startAwaySelect(o){ASEL={o,pick:new Set(alive().slice(0,Math.min(4,alive().length)).map(c=>c.id))};S='awaysel';}
function startAway(o){const th=o.theme||(o.kind==='board'||o.kind==='defend'?'station':'grass');const interior=THEMES[th].inside;
 A={kind:o.kind,th,o,map:genMap(th,interior),team:[],foes:[],items:[],fx:[],texts:[],log:[],turn:0,sel:0,busy:0,scanT:0,objDone:false,over:null,seen:new Uint8Array(MW*MH),vis:new Uint8Array(MW*MH),loot:{lat:0,fuel:0,torps:0}};
 let floors=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(A.map[y][x]===0)floors.push([x,y]);
 const left=floors.filter(f=>f[0]<MW/3);const pad=o.kind==='defend'?choice(floors.filter(f=>Math.abs(f[0]-MW/2)<4)||floors):choice(left.length?left:floors);A.pad={x:pad[0],y:pad[1]};
 const d=bfs(pad[0],pad[1]);let far=pad,fd=0;for(const f of floors){const v=d[f[1]*MW+f[0]];if(v>fd){fd=v;far=f;}}
 if(o.kind!=='defend')A.obj={x:far[0],y:far[1],type:o.kind==='board'?'bridge':(o.obj||(PLANET&&PLANET.o)||'data')};
 const team=o.team||alive().filter(c=>ASEL&&ASEL.pick.has(c.id));for(const c of team){const [x,y]=freeNear(pad[0],pad[1]);A.team.push(mkTeam(c,x,y));}
 const n=(o.kind==='defend'?3:4)+R.sector+(o.kind==='board'?1:0);const cand=floors.filter(f=>d[f[1]*MW+f[0]]>7||o.kind==='defend'&&d[f[1]*MW+f[0]]>9);
 for(let i=0;i<n&&cand.length;i++){const f=cand.splice(randi(0,cand.length-1),1)[0];addFoe(choice(o.foes),f[0],f[1]);}
 if(o.kind==='board'){const cap=addFoe(o.foes[0],far[0],far[1]);cap.hp=cap.maxHp=Math.round(cap.maxHp*1.7);cap.mel+=2;cap.ran+=1;cap.captain=true;cap.name='ENEMY CAPTAIN';}
 if(o.kind!=='defend')for(let i=0;i<randi(2,4);i++){const f=choice(floors);if(!unitAt(f[0],f[1]))A.items.push({x:f[0],y:f[1],k:choice(['lat','lat','fuel','medkit','torps','grenade'])});}
 computeVis();S='away';setMusic('away');sfx.beam();for(const u of A.team)burst(u.x*TS+8,MY+u.y*TS+8,16,'#73eff7',1.5,30);
 alog(o.kind==='defend'?'REPEL THE BOARDERS!':o.kind==='board'?'FIND AND DEFEAT THE ENEMY CAPTAIN ON THEIR BRIDGE.':OBJS[A.obj.type]?OBJS[A.obj.type].n+'. THEN BEAM BACK UP.':'EXPLORE THE DERELICT.','#ffcd75');}
function mkTeam(c,x,y){const R0=ROLES[c.role];return{crew:c,name:c.name,team:true,x,y,hp:c.hp,maxHp:c.maxHp,mel:c.mel*(R.F.id==='klingon'?1.5:1),ran:c.ran,range:6,cd:{},stunT:0,buff:0,stimT:0,down:0,face:1,ab:R0.ab,role:c.role};}
function addFoe(k,x,y){const f=FOES[k],sc=1+R.sector*0.12;const u={foe:k,name:f.n,x,y,hp:Math.round(f.hp*sc),maxHp:Math.round(f.hp*sc),mel:f.mel+Math.floor(R.sector/2),ran:f.ran+Math.floor(R.sector/3),range:f.range,alert:A.kind==='defend',stunT:0,adapt:0,analyzed:0,shownT:0,face:-1,turnT:0};A.foes.push(u);return u;}
function alog(s,c='#f4f4f4'){A.log.push({s,c});if(A.log.length>3)A.log.shift();}
function atext(x,y,s,c){A.texts.push({x:x*TS+8,y:MY+y*TS,s,c,t:0});}
function computeVis(){A.vis.fill(0);for(const u of A.team){if(u.gone||u.down)continue;for(let y=Math.max(0,u.y-7);y<=Math.min(MH-1,u.y+7);y++)for(let x=Math.max(0,u.x-7);x<=Math.min(MW-1,u.x+7);x++){if((x-u.x)**2+(y-u.y)**2>52)continue;if(losT(u.x,u.y,x,y)){A.vis[y*MW+x]=1;A.seen[y*MW+x]=1;}}}if(A.scanT>0){A.vis.fill(1);A.seen.fill(1);}}
const visible=f=>A.vis[f.y*MW+f.x]&&(!FOES[f.foe].shroud||f.shownT>0||A.scanT>0||A.team.some(u=>!u.gone&&dist(u,f)<=1));
// ---- combat resolution ----
function dmgRoll(base){return Math.max(1,Math.round(base+rand(0,2)));}
function attack(a,t,ranged){if(!t||t.hp<=0)return;const isT=!!a.team;a.face=t.x>a.x?1:t.x<a.x?-1:a.face;
 let hit=ranged?0.82-(dist(a,t)>4?0.1:0):0.92;if(t.stunT>0)hit=1;
 const ax=a.x*TS+8,ay=MY+a.y*TS+6,tx=t.x*TS+8,ty=MY+t.y*TS+6;
 if(ranged){A.fx.push({type:'beam',x0:ax,y0:ay,x1:tx,y1:ty,col:isT?(R.F.wpn==='phaser'?'#ef7d57':'#a7f070'):'#ff3040',t:8});sfx.hand();}else sfx.hit();
 if(!chance(hit)){atext(t.x,t.y,'MISS','#94b0c2');return;}
 let d=dmgRoll(ranged?a.ran:a.mel);if(isT){if(a.buff>0)d+=2;if(a.stimT>0)d+=3;}if(t.analyzed>0)d=Math.round(d*1.5);
 if(!t.team&&FOES[t.foe].adapt&&ranged){d=Math.max(0,Math.round(d*(1-t.adapt*0.25)));t.adapt++;if(t.adapt===3)atext(t.x,t.y,'ADAPTED!','#a7f070');}
 if(!isT&&FOES[a.foe].shroud)a.shownT=3;
 hurtU(t,d,a);}
function hurtU(t,d,src){if(d<=0){atext(t.x,t.y,'0','#94b0c2');return;}t.hp-=d;atext(t.x,t.y,'-'+d,t.team?'#ff6070':'#ffcd75');burst(t.x*TS+8,MY+t.y*TS+8,6,t.team?'#b13e53':'#ffcd75',1.5,16);
 if(!t.team){t.alert=true;if(t.hp<=0){burst(t.x*TS+8,MY+t.y*TS+8,16,FOES[t.foe].col,2,24);sfx.death();if(src&&src.team){if(src.crew){crewXp(src.crew,FOES[t.foe].xp);src.crew.kills++;}R.stats.kills++;}if(t.captain){A.objDone=true;alog('ENEMY CAPTAIN DEFEATED! THE SHIP IS OURS!','#a7f070');}if(FOES[t.foe].harmless)alog('A TRIBBLE MEETS ITS END. NOBODY FEELS GOOD ABOUT THIS.','#94b0c2');}}
 else if(t.hp<=0&&!t.down&&!t.turret){t.hp=0;t.down=4;alog(t.name+' IS DOWN! BLEEDING OUT IN 4 TURNS.','#ff6070');sfx.death();}
 else if(t.turret&&t.hp<=0)t.gone=true;}
function heal(u,n){if(u.down){u.down=0;u.hp=0;alog(u.name+' IS BACK ON THEIR FEET!','#a7f070');}u.hp=Math.min(u.maxHp,u.hp+n);atext(u.x,u.y,'+'+n,'#a7f070');sfx.heal();burst(u.x*TS+8,MY+u.y*TS+8,8,'#a7f070',1,20);}
function nearestFoe(u,needVis=true){let b=null,bd=99;for(const f of A.foes)if(f.hp>0&&!FOES[f.foe].harmless&&(!needVis||visible(f))){const d=dist(u,f);if(d<bd){bd=d;b=f;}}return b;}
function canShoot(a,t){return dist(a,t)<=a.range&&losT(a.x,a.y,t.x,t.y);}
function stepToward(u,tx,ty,avoidAdj){const d=bfs(tx,ty);let best=null,bv=d[u.y*MW+u.x];if(bv<0)bv=999;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=u.x+dx,ny=u.y+dy;if(!walk(nx,ny)||unitAt(nx,ny))continue;const v=d[ny*MW+nx];if(v>=0&&v<bv){bv=v;best=[nx,ny];}}if(best){u.face=best[0]>u.x?1:best[0]<u.x?-1:u.face;u.x=best[0];u.y=best[1];onStep(u);return true;}return false;}
function onStep(u){if(!u.team)return;if(A.map[u.y][u.x]===3&&THEMES[A.th].hot){hurtU(u,2);alog(u.name+' IS BURNED BY LAVA!','#ef7d57');}
 const it=A.items.find(i=>i.x===u.x&&i.y===u.y);if(it){A.items.splice(A.items.indexOf(it),1);sfx.pickup();const n={lat:randi(6,14),fuel:randi(1,2),torps:1,medkit:1,grenade:1}[it.k];if(it.k==='medkit'||it.k==='grenade'){R.items[it.k]+=n;}else A.loot[it.k]+=n;atext(u.x,u.y,'+'+n+' '+{lat:'LATINUM',fuel:'DILITHIUM',torps:'TORPEDO',medkit:'MEDKIT',grenade:'GRENADE'}[it.k],'#ffcd75');}
 if(A.obj&&!A.objDone&&A.obj.type!=='bridge'&&u.x===A.obj.x&&u.y===A.obj.y){A.objDone=true;sfx.good();alog({artifact:'ARTIFACT SECURED!',rescue:'COLONISTS FOUND! GET THEM TO THE BEAM-UP POINT.',dilithium:'DILITHIUM MINED!',data:'DATA CORE DOWNLOADED!'}[A.obj.type]+' BEAM UP WHEN READY.','#a7f070');}}
// ---- abilities ----
function abTarget(u){const h=hoverFoe();if(h&&visible(h))return h;return nearestFoe(u);}
function useAb(u,k){const a=ABIL[k];if((u.cd[k]||0)>0)return false;let t=null;if(a.tgt==='foe'){t=abTarget(u);if(!t||!canShoot(u,t)){alog('NO TARGET IN SIGHT.','#94b0c2');return false;}}
 switch(k){
  case 'rally':for(const v of A.team)if(!v.gone&&!v.down){v.buff=4;heal(v,3);}alog(u.name+': "STAND TOGETHER!"','#ffcd75');break;
  case 'order':alog(u.name+': "MAKE IT SO."','#ffcd75');for(const v of A.team)if(v!==u&&!v.gone&&!v.down&&!v.turret)allyAct(v);break;
  case 'burst':attack(u,t,true);if(t.hp>0)attack(u,t,true);break;
  case 'stun':A.fx.push({type:'beam',x0:u.x*TS+8,y0:MY+u.y*TS+6,x1:t.x*TS+8,y1:MY+t.y*TS+6,col:'#73eff7',t:10});t.stunT=2;atext(t.x,t.y,'STUNNED','#73eff7');sfx.hand();break;
  case 'scan':A.scanT=15;sfx.chirp();alog('TRICORDER SWEEP: ALL LIFEFORMS LOCATED.','#73eff7');break;
  case 'analyze':t.analyzed=6;atext(t.x,t.y,'WEAK POINT','#a7f070');sfx.chirp();break;
  case 'turret':{const [x,y]=freeNear(u.x,u.y);if(x===u.x&&y===u.y)return false;A.team.push({name:'TURRET',team:true,turret:true,x,y,hp:8,maxHp:8,mel:0,ran:4,range:6,cd:{},stunT:0,buff:0,stimT:0,down:0,life:10,face:1,ab:[]});sfx.click();alog('TURRET DEPLOYED.','#ffcd75');break;}
  case 'overload':boomAt(t.x,t.y,7,u);break;
  case 'hypo':{const v=A.team.filter(v=>!v.gone&&!v.turret&&dist(u,v)<=1).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(!v)return false;heal(v,10);break;}
  case 'revive':{let any=false;for(const v of A.team)if(!v.gone&&!v.turret&&v!==u&&dist(u,v)<=1){heal(v,8);v.stunT=0;any=true;}if(!any)return false;break;}}
 u.cd[k]=a.cd;return true;}
function boomAt(x,y,d,src){sfx.boom(1);shake=4;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){burst((x+dx)*TS+8,MY+(y+dy)*TS+8,8,choice(['#ffcd75','#ef7d57','#f4f4f4']),2,24);const v=unitAt(x+dx,y+dy);if(v&&!(v.team&&src&&src.team&&v===src))hurtU(v,v.team?Math.ceil(d/2):d,src);}}
function useItem(u,k){if(!R.items[k])return false;if(k==='medkit'){const v=A.team.filter(v=>!v.gone&&!v.turret&&dist(u,v)<=1).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(!v)return false;heal(v,12);}else if(k==='grenade'){const t=abTarget(u);if(!t||dist(u,t)>5||!losT(u.x,u.y,t.x,t.y)){alog('NO TARGET IN RANGE.','#94b0c2');return false;}boomAt(t.x,t.y,8,u);}else if(k==='stim'){u.stimT=5;atext(u.x,u.y,'STIM!','#ffcd75');sfx.heal();}R.items[k]--;return true;}
// ---- AI ----
function allyAct(v){if(v.gone||v.down||v.stunT>0)return;const t=nearestFoe(v);
 if(v.turret){if(t&&canShoot(v,t))attack(v,t,true);return;}
 if(v.role==='MED'&&!v.cd.hypo){const hurt=A.team.find(w=>!w.gone&&!w.turret&&dist(v,w)<=1&&(w.down||w.hp<w.maxHp*0.5));if(hurt){heal(hurt,10);v.cd.hypo=ABIL.hypo.cd;return;}}
 const downed=A.team.find(w=>w.down&&!w.gone);if(downed&&v.role==='MED'&&dist(v,downed)>1){stepToward(v,downed.x,downed.y);return;}
 if(t){if(v.role==='SEC'&&!v.cd.burst&&canShoot(v,t)){useAb(v,'burst');return;}if(v.role==='ENG'&&!v.cd.turret&&dist(v,t)<6&&chance(0.5)){if(useAb(v,'turret'))return;}
  if(dist(v,t)<=1&&v.mel>=v.ran){attack(v,t,false);return;}if(canShoot(v,t)){attack(v,t,true);return;}stepToward(v,t.x,t.y);return;}
 const lead=A.team[A.sel];if(lead&&lead!==v&&!lead.gone&&dist(v,lead)>2)stepToward(v,lead.x,lead.y);}
function foeAct(f){const F=FOES[f.foe];if(f.hp<=0)return;if(f.stunT>0)return;
 if(F.breed){if(A.foes.filter(o=>o.foe==='tribble'&&o.hp>0).length<30&&chance(0.08)){const [x,y]=freeNear(f.x,f.y);if(!unitAt(x,y)){addFoe('tribble',x,y);}}if(chance(0.5)){const [dx,dy]=choice([[1,0],[-1,0],[0,1],[0,-1]]);if(walk(f.x+dx,f.y+dy)&&!unitAt(f.x+dx,f.y+dy)){f.x+=dx;f.y+=dy;}}return;}
 const tgts=A.team.filter(u=>!u.gone&&!u.down);if(!tgts.length)return;let t=null,bd=99;for(const u of tgts){const d=dist(f,u);if(d<bd){bd=d;t=u;}}
 if(!f.alert){if(bd<=7&&losT(f.x,f.y,t.x,t.y)){f.alert=true;for(const o of A.foes)if(dist(o,f)<6)o.alert=true;}else return;}
 if(F.slow&&(f.turnT++%2))return;
 for(let n=0;n<(F.fast?2:1);n++){if(t.gone||t.down){const alt=tgts.filter(u=>!u.down);if(!alt.length)return;t=alt[0];}
  if(dist(f,t)<=1&&F.mel>0){attack(f,t,false);return;}if(F.ran>0&&canShoot(f,t)&&(F.mel<F.ran||dist(f,t)>1)){attack(f,t,true);return;}if(!F.still)stepToward(f,t.x,t.y);}}
function endTurn(){A.turn++;for(const u of A.team){if(u.gone)continue;if(u.down){u.down--;if(u.down<=0){u.gone=true;killCrew(u.crew,'DIED ON THE AWAY MISSION');}}for(const k in u.cd)if(u.cd[k]>0)u.cd[k]--;if(u.buff>0)u.buff--;if(u.stimT>0)u.stimT--;if(u.stunT>0)u.stunT--;if(u.turret&&--u.life<=0)u.gone=true;}
 for(const f of A.foes){if(f.stunT>0)f.stunT--;if(f.analyzed>0)f.analyzed--;if(f.shownT>0)f.shownT--;}A.foes=A.foes.filter(f=>f.hp>0);if(A.scanT>0)A.scanT--;
 const live=A.team.filter(u=>!u.gone&&!u.turret);if(!live.length||live.every(u=>u.down)){for(const u of live){u.gone=true;killCrew(u.crew,'WAS LOST ON THE AWAY MISSION');}finishAway(false);return;}
 if(A.kind==='defend'&&!A.foes.some(f=>!FOES[f.foe].harmless)){A.objDone=true;finishAway(true);return;}
 if(A.kind==='board'&&A.objDone){finishAway(true);return;}
 if(A.team[A.sel]&&(A.team[A.sel].gone||A.team[A.sel].down||A.team[A.sel].turret))selectNext();computeVis();}
function selectNext(){for(let i=1;i<=A.team.length;i++){const j=(A.sel+i)%A.team.length,u=A.team[j];if(!u.gone&&!u.down&&!u.turret){A.sel=j;return;}}}
function playerDone(){const u=A.team[A.sel];for(const v of A.team)if(v!==u)allyAct(v);for(const f of A.foes.slice())foeAct(f);A.busy=8;endTurn();}
function finishAway(win){if(A.over)return;for(const u of A.team)if(u.crew&&!u.gone){u.crew.hp=Math.max(1,u.hp);}A.over={win};R.stats.missions+=win?1:0;
 const L=A.loot,lines=[];if(L.lat){gain('lat',L.lat,true);lines.push('+'+L.lat+' LATINUM');}if(L.fuel){gain('fuel',L.fuel,true);lines.push('+'+L.fuel+' DILITHIUM');}if(L.torps){gain('torps',L.torps,true);lines.push('+'+L.torps+' TORPEDOES');}
 if(win){for(const u of A.team)if(u.crew&&!u.gone)crewXp(u.crew,5);const t=A.obj&&A.obj.type;
  if(A.kind==='board'){const d=ESHIPS[A.o.ship];const lat=Math.round(randi(d.loot[0],d.loot[1])*1.6);gain('lat',lat,true);gain('torps',3,true);gain('fuel',2,true);lines.push('SHIP CAPTURED! +'+lat+' LATINUM, +3 TORPEDOES, +2 DILITHIUM');R.stats.ships++;}
  else if(t==='artifact'){const lat=randi(30,50);gain('lat',lat,true);lines.push('THE ARTIFACT SELLS FOR '+lat+' LATINUM');if(chance(0.5)){const k=choice(SYS);R.ship.sys[k].lvl=Math.min(5,R.ship.sys[k].lvl+1);lines.push('ITS TECHNOLOGY UPGRADES OUR '+SYSN[k]);}}
  else if(t==='rescue'){gain('lat',10,true);lines.push('THE COLONISTS PAY 10 LATINUM');const c=addCrew();if(c)lines.push(c.name+' JOINS THE CREW');}
  else if(t==='dilithium'){const n=randi(4,6);gain('fuel',n,true);lines.push('+'+n+' DILITHIUM');}
  else if(t==='data'){gain('torps',2,true);gain('lat',20,true);R.map.revealed=true;lines.push('+2 TORPEDOES, +20 LATINUM, SECTOR MAP REVEALED');}}
 A.over.lines=lines;S='awayend';}
function afterAway(){const k=A.kind,win=A.over.win;A=null;if(S==='gameover')return;
 if(k==='board'){if(win){C=null;S='map';setMusic('explore');return;}if(C){S='combat';setMusic('battle');C.phase='anim';C.next='enemy';return;}}
 if(k==='defend'&&C){S='combat';setMusic('battle');C.phase='anim';C.next='new';return;}
 S='map';setMusic('explore');}
// ---- input ----
function hoverTile(){const x=Math.floor(mouse.x/TS),y=Math.floor((mouse.y-MY)/TS);return x>=0&&y>=0&&x<MW&&y<MH?{x,y}:null;}
function hoverFoe(){const t=hoverTile();if(!t)return null;return A.foes.find(f=>f.hp>0&&f.x===t.x&&f.y===t.y)||null;}
function awayInput(){if(A.over||A.busy>0)return;const u=A.team[A.sel];if(!u||u.gone||u.down)return selectNext();
 if(hitk(['Tab'])){selectNext();sfx.click();return;}
 if(u.stunT>0){alog(u.name+' IS STUNNED.','#73eff7');playerDone();return;}
 const dirs={ArrowUp:[0,-1],KeyW:[0,-1],Numpad8:[0,-1],ArrowDown:[0,1],KeyS:[0,1],Numpad2:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],Numpad4:[-1,0],ArrowRight:[1,0],KeyD:[1,0],Numpad6:[1,0],Numpad7:[-1,-1],Numpad9:[1,-1],Numpad1:[-1,1],Numpad3:[1,1],KeyQ:[-1,-1],KeyE:[1,-1],KeyZ:[-1,1],KeyC:[1,1]};
 for(const k in dirs)if(pressed[k]){const [dx,dy]=dirs[k];return tryMove(u,u.x+dx,u.y+dy);}
 if(hitk(['Space','Period','Numpad5'])){alog(u.name+' HOLDS POSITION.','#94b0c2');return playerDone();}
 if(hitk(['KeyF'])){const t=abTarget(u);if(t&&canShoot(u,t)){attack(u,t,true);return playerDone();}alog('NO TARGET IN SIGHT.','#94b0c2');return;}
 if(mouse.lp&&mouse.y<MY+MH*TS&&mouse.y>MY){const t=hoverTile();if(!t)return;const f=hoverFoe();
  if(f&&visible(f)){if(dist(u,f)<=1){attack(u,f,u.mel>=u.ran?false:true);return playerDone();}if(canShoot(u,f)){attack(u,f,true);return playerDone();}alog('NO LINE OF SIGHT.','#94b0c2');return;}
  const v=A.team.find(w=>!w.gone&&!w.turret&&w.x===t.x&&w.y===t.y);if(v){A.sel=A.team.indexOf(v);sfx.click();return;}
  if(walk(t.x,t.y)&&A.seen[t.y*MW+t.x]){if(stepToward(u,t.x,t.y)){sfx.step();return playerDone();}}}}
function tryMove(u,x,y){const o=unitAt(x,y);if(o&&!o.team){if(visible(o)||true){attack(u,o,false);return playerDone();}}if(o&&o.team&&!o.turret&&!o.down){const ox=o.x,oy=o.y;o.x=u.x;o.y=u.y;u.x=ox;u.y=oy;onStep(u);sfx.step();return playerDone();}
 if(!walk(x,y)||o)return;u.face=x>u.x?1:x<u.x?-1:u.face;u.x=x;u.y=y;onStep(u);sfx.step();playerDone();}
// ---- render ----
function renderAway(){rect(0,0,W,H,'#05060f');const th=A.th;const tm=anim;
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=y*MW+x;if(!A.seen[i])continue;const t=A.map[y][x],v=(x*7+y*13)%3,px=x*TS,py=MY+y*TS;
  if(t===1)ctx.drawImage(tileImg(th,'w',v),px,py);else if(t===2)ctx.drawImage(tileImg(th,'d',v),px,py);else ctx.drawImage(tileImg(th,'f',v),px,py);
  if(t===3){rect(px,py,TS,TS,THEMES[th].liq);ctx.fillStyle='#ffffff';ctx.globalAlpha=0.3;ctx.fillRect(px+((tm>>3)+x*5)%12,py+4+((y*3)%8),3,1);ctx.globalAlpha=1;}}
 // pad + objective + items
 const pp=A.pad;if(A.seen[pp.y*MW+pp.x]){ringE(pp.x*TS+8,MY+pp.y*TS+11,6,3,(tm>>4)%2?'#73eff7':'#41a6f6');}
 if(A.obj&&!A.objDone&&A.obj.type!=='bridge'&&A.seen[A.obj.y*MW+A.obj.x]){const x=A.obj.x*TS+8,y=MY+A.obj.y*TS+8+Math.sin(tm*0.1)*1.5;disc(x,y,5,'#1a1c2c');disc(x,y,4,{artifact:'#ffcd75',rescue:'#a7f070',dilithium:'#ff77a8',data:'#73eff7'}[A.obj.type]||'#fff');txt('!',x,y-3,'#1a1c2c',1,'c',null);}
 for(const it of A.items)if(A.vis[it.y*MW+it.x]){const x=it.x*TS+8,y=MY+it.y*TS+10;const col={lat:'#ffcd75',fuel:'#ff77a8',torps:'#ef7d57',medkit:'#f4f4f4',grenade:'#a7f070'}[it.k];rect(x-3,y-3,7,5,'#1a1c2c');rect(x-2,y-2,5,3,col);}
 // units
 const drawU=(u,spr)=>{const x=u.x*TS+3,y=MY+u.y*TS+1;ctx.drawImage(u.face<0?spr.l:spr.r,x,y);const w=12;rect(x-1,y-3,w,2,'#1a1c2c');rect(x-1,y-3,Math.round(w*Math.max(0,u.hp)/u.maxHp),2,u.team?'#a7f070':'#ff6070');};
 for(const f of A.foes)if(f.hp>0&&visible(f)){drawU(f,foeSpr(f.foe));if(f.stunT>0)txt('*',f.x*TS+8,MY+f.y*TS-6,'#73eff7',1,'c');if(f.analyzed>0){ctx.fillStyle='#a7f070';ctx.fillRect(f.x*TS+1,MY+f.y*TS+14,2,2);}if(f.captain)txt('CPT',f.x*TS+8,MY+f.y*TS-9,'#ff6070',1,'c');}
 A.team.forEach((u,i)=>{if(u.gone)return;if(u.turret){const x=u.x*TS+8,y=MY+u.y*TS+10;rect(x-4,y-4,9,7,'#1a1c2c');rect(x-3,y-3,7,5,'#94b0c2');rect(x-1,y-6,2,3,'#566c86');txt(u.life,x,y-12,'#ffcd75',1,'c');return;}
  if(i===A.sel){const x=u.x*TS,y=MY+u.y*TS;ctx.fillStyle='#ffcd75';for(const [a,b] of [[0,0],[13,0],[0,13],[13,13]]){ctx.fillRect(x+a,y+b,3,1);ctx.fillRect(x+a+(a?2:0),y+b,1,3);}}
  if(u.down){ctx.globalAlpha=0.5+0.3*Math.sin(tm*0.2);ctx.save();ctx.translate(u.x*TS+8,MY+u.y*TS+10);ctx.rotate(Math.PI/2);ctx.drawImage(crewSpr(u.crew).r,-6,-7);ctx.restore();ctx.globalAlpha=1;txt(u.down,u.x*TS+8,MY+u.y*TS-6,'#ff6070',1,'c');}
  else drawU(u,crewSpr(u.crew));if(u.buff>0||u.stimT>0){ctx.fillStyle='#ffcd75';ctx.fillRect(u.x*TS+13,MY+u.y*TS+2,2,2);}});
 // fog for seen-but-not-visible
 ctx.globalAlpha=0.55;ctx.fillStyle='#05060f';for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=y*MW+x;if(A.seen[i]&&!A.vis[i])ctx.fillRect(x*TS,MY+y*TS,TS,TS);}ctx.globalAlpha=1;
 for(const f of A.fx){line(f.x0,f.y0,f.x1,f.y1,'#1a1c2c',3);line(f.x0,f.y0,f.x1,f.y1,f.col,1);f.t--;}A.fx=A.fx.filter(f=>f.t>0);
 drawParts();for(const t of A.texts){t.t++;t.y-=0.3;ctx.globalAlpha=Math.min(1,(50-t.t)/12);txt(t.s,t.x,t.y,t.c,1,'c');}ctx.globalAlpha=1;A.texts=A.texts.filter(t=>t.t<50);
 // hover info
 const hf=hoverFoe();if(hf&&visible(hf)){const F=FOES[hf.foe];tip=hf.name+' - HP '+hf.hp+'/'+hf.maxHp+(F.adapt?' - ADAPTS TO RANGED FIRE ('+hf.adapt+')':'')+(F.shroud?' - CAN SHROUD ITSELF':'')+(F.harmless?' - HARMLESS. PURRS.':'');}
 // top bar
 rect(0,0,W,MY,'#0b0d17');const ttl=A.kind==='board'?'BOARDING ACTION':A.kind==='defend'?'INTRUDER ALERT':A.kind==='planet'&&PLANET?PLANET.name+' - '+PLANET.t.n:A.kind==='planet'?'PLANET SURFACE':'DERELICT';txt(ttl,4,4,'#ffcd75');
 txt(A.objDone?'OBJECTIVE COMPLETE':A.kind==='defend'?'FOES LEFT: '+A.foes.filter(f=>!FOES[f.foe].harmless).length:A.kind==='board'?'DEFEAT THE CAPTAIN':OBJS[A.obj.type]?OBJS[A.obj.type].n:'',W/2,4,A.objDone?'#a7f070':'#94b0c2',1,'c');txt('F SHOOT  SPACE WAIT  TAB SWAP  T'+A.turn,W-4,4,'#566c86',1,'r');
 // bottom panel
 const by=MY+MH*TS;frame9(0,by,W,H-by,'#566c86','#0b0d17');
 A.team.filter(u=>!u.turret).forEach((u,i)=>{const x=4+i*76,y=by+4,sel=A.team[A.sel]===u;frame9(x,y,72,20,sel?'#ffcd75':u.gone?'#333c57':'#566c86','#1a1c2c');if(!u.gone)ctx.drawImage(crewSpr(u.crew).r,x+3,y+3);txt(u.name.slice(0,9),x+16,y+4,u.gone?'#566c86':ROLES[u.role].col);
  rect(x+16,y+12,52,3,'#333c57');if(!u.gone)rect(x+16,y+12,Math.round(52*Math.max(0,u.hp)/u.maxHp),3,u.down?'#ff6070':'#a7f070');txt(u.gone?'LOST':u.down?'DOWN':Math.max(0,u.hp)+'/'+u.maxHp,x+68,y+4,'#94b0c2',1,'r');
  if(!uiBlock&&inR(x,y,72,20)){tip=u.name+' - '+u.crew.race+' '+ROLES[u.role].n+' LV'+u.crew.lvl+' - MELEE '+Math.round(u.mel)+' RANGED '+u.ran;if(mouse.lp&&!u.gone&&!u.down){A.sel=A.team.indexOf(u);sfx.click();mouse.lp=false;}}});
 const u=A.team[A.sel];const ay=by+28;
 if(u&&!u.gone&&!A.over){u.ab.forEach((k,i)=>{const cd=u.cd[k]||0;if(btn(4+i*78,ay,74,13,ABIL[k].n+(cd?' ('+cd+')':''),{dis:cd>0||A.busy>0,tip:ABIL[k].d,key:['Digit'+(i+1)]})){if(useAb(u,k))playerDone();}});
  [['medkit','MEDKIT'],['grenade','GRENADE'],['stim','STIM']].forEach(([k,n],i)=>{if(btn(162+i*66,ay,62,13,n+' X'+R.items[k],{dis:!R.items[k]||A.busy>0,tip:ITEMS[k].d,key:['Digit'+(i+3)],col:'#94b0c2'})){if(useItem(u,k))playerDone();}});}
 if(!A.over&&A.kind!=='defend'){const onPad=A.team.some(v=>!v.gone&&!v.down&&dist(v,A.pad)<=1);if(btn(W-84,ay,80,13,A.objDone?'BEAM UP':'ABORT',{col:A.objDone?'#a7f070':'#b13e53',hcol:'#ffcd75',key:['KeyB'],tip:A.objDone?'BEAM THE TEAM BACK TO THE SHIP AND COLLECT THE REWARD.':'BEAM OUT NOW. NO MISSION REWARD (YOU KEEP ANY LOOT).'})){sfx.beam();finishAway(A.objDone&&(A.obj.type!=='rescue'||onPad));}}
 A.log.forEach((l,i)=>txt(l.s,W-4,by+4+i*7,l.c,1,'r'));
}
function renderAwaySel(){drawStars(0.1,R.map.neb);const o=ASEL.o;frame9(60,20,360,230,'#41a6f6','#0b0d17');txt('ASSEMBLE AN AWAY TEAM',W/2,30,'#ffcd75',2,'c');
 const desc=o.kind==='board'?'BEAM ONTO THE '+ESHIPS[o.ship].n+'. DEFEAT THEIR CAPTAIN TO CAPTURE THE SHIP.':o.kind==='derelict'?'EXPLORE THE DERELICT. DOWNLOAD ITS DATA CORE.':PLANET?PLANET.name+': '+OBJS[PLANET.o].d:'';wrap(desc,80).forEach((l,i)=>txt(l,W/2,48+i*8,'#94b0c2',1,'c'));
 txt('SELECT UP TO 4 CREW. CREW LEFT BEHIND STAY AT THEIR STATIONS.',W/2,68,'#566c86',1,'c');
 alive().forEach((c,i)=>{const x=74+(i%2)*170,y=80+Math.floor(i/2)*30,on=ASEL.pick.has(c.id);frame9(x,y,162,26,on?'#ffcd75':'#333c57','#1a1c2c');ctx.drawImage(crewSpr(c).r,x+4,y+6);txt(c.name,x+18,y+5,ROLES[c.role].col);txt(c.race+' '+ROLES[c.role].n+' LV'+c.lvl,x+18,y+13,'#94b0c2');txt(c.hp+'/'+c.maxHp,x+156,y+5,'#a7f070',1,'r');txt(on?'[X]':'[ ]',x+156,y+15,on?'#ffcd75':'#566c86',1,'r');
  if(inR(x,y,162,26)){tip=RACES[c.race].note+'. ABILITIES: '+ROLES[c.role].ab.map(a=>ABIL[a].n).join(', ');if(mouse.lp){if(on)ASEL.pick.delete(c.id);else if(ASEL.pick.size<4)ASEL.pick.add(c.id);sfx.click();}}});
 if(btn(W/2-110,226,100,14,'ENERGIZE',{dis:!ASEL.pick.size,key:['Enter'],col:'#a7f070'})){startAway(Object.assign({},o,{theme:o.theme||(PLANET&&o.kind==='planet'?PLANET.t.th:undefined)}));}
 if(btn(W/2+10,226,100,14,'CANCEL',{col:'#b13e53',key:['Escape']})){ASEL=null;if(o.kind==='board'&&C){S='combat';C.phase='player';}else S=o.kind==='planet'?'planet':'map';}}
function renderAwayEnd(){renderAway();ctx.globalAlpha=0.75;rect(0,0,W,H,'#05060f');ctx.globalAlpha=1;frame9(90,60,300,150,A.over.win?'#a7f070':'#b13e53','#0b0d17');txt(A.over.win?'MISSION ACCOMPLISHED':'MISSION ENDED',W/2,72,A.over.win?'#a7f070':'#ff6070',2,'c');
 const L=A.over.lines.length?A.over.lines:['NO REWARD THIS TIME.'];L.forEach((l,i)=>txt(l,W/2,96+i*10,'#f4f4f4',1,'c'));
 const lost=A.team.filter(u=>u.crew&&u.gone&&!u.crew.alive);if(lost.length)txt('LOST: '+lost.map(u=>u.name).join(', '),W/2,160,'#ff6070',1,'c');
 if(btn(W/2-50,188,100,14,'CONTINUE',{key:['Enter','Space']}))afterAway();}
