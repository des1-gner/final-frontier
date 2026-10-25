// ================= DATA: ships, factions, crew, foes =================
function bakeShip(w,h,paint){const [c,x]=mkCanvas(w,h);paint(x,w,h);const o=outlineC(c);return{r:o,l:flipC(o),wr:tintC(o,'#ffffff'),w:o.width,h:o.height};}
// ---- ship painters (side view, nose to the right) ----
const SHIPART={
 fed:(x)=>{ // saucer + secondary hull + nacelles
  poly(x,[[16,22],[44,20],[50,24],[44,28],[20,28]],'#94b0c2');rect2(x,18,22,26,3,'#c2d3e0');
  poly(x,[[22,20],[28,10],[31,10],[27,21]],'#566c86');rect2(x,4,6,30,5,'#c2d3e0');rect2(x,4,6,30,2,'#e8eef7');rect2(x,32,6,3,5,'#ff3040');rect2(x,4,7,2,3,'#41a6f6');
  ell(x,52,16,16,4,'#c2d3e0');ell(x,52,15,15,2,'#e8eef7');rect2(x,46,11,10,2,'#94b0c2');rect2(x,48,10,6,1,'#73eff7');
  rect2(x,45,20,6,6,'#94b0c2');rect2(x,48,24,3,3,'#41a6f6');for(let i=0;i<5;i++)rect2(x,40+i*5,16,1,1,'#ffcd75');},
 klingon:(x)=>{ // bird of prey
  poly(x,[[4,16],[30,10],[38,14],[30,18]],'#4a6a3a');poly(x,[[10,14],[36,14],[30,30],[2,32]],'#38503a');poly(x,[[10,14],[36,14],[30,18],[4,18]],'#5a7a4a');
  poly(x,[[34,12],[52,9],[58,12],[52,15],[34,15]],'#4a6a3a');rect2(x,54,11,4,2,'#ff3040');rect2(x,2,30,4,3,'#ff3040');rect2(x,20,15,8,1,'#a7f070');
  for(let i=0;i<4;i++)rect2(x,8+i*5,22+i,3,1,'#2a3a2a');},
 romulan:(x)=>{ // warbird: two curved hulls
  poly(x,[[2,4],[30,8],[56,14],[46,16],[24,12],[6,8]],'#4a8a5a');poly(x,[[2,30],[30,26],[56,20],[46,18],[24,22],[6,26]],'#3a6a4a');
  poly(x,[[40,14],[60,16],[56,18],[40,20]],'#5aa06a');rect2(x,54,16,4,2,'#a7f070');poly(x,[[8,9],[26,12],[26,13],[8,10]],'#a7f070');rect2(x,2,4,3,2,'#73eff7');rect2(x,2,28,3,2,'#73eff7');},
 ferengi:(x)=>{ // marauder crescent
  poly(x,[[4,10],[40,6],[58,14],[60,18],[40,14],[10,16]],'#c0783a');poly(x,[[4,24],[40,28],[58,20],[60,18],[40,20],[10,18]],'#9a5a2a');
  ell(x,30,17,10,3,'#e0a060');rect2(x,54,16,6,3,'#a7f070');rect2(x,4,11,3,4,'#ffcd75');rect2(x,4,19,3,4,'#ffcd75');for(let i=0;i<4;i++)rect2(x,14+i*8,10+i,2,1,'#ffcd75');},
 orion:(x)=>{poly(x,[[4,12],[36,8],[48,14],[36,20],[4,18]],'#38703a');poly(x,[[10,8],[24,2],[28,8]],'#2a5a2a');rect2(x,40,13,6,2,'#a7f070');rect2(x,4,13,2,4,'#ff3040');},
 gorn:(x)=>{rect2(x,6,8,40,16,'#6a5a3a');rect2(x,6,8,40,4,'#8a7a4a');rect2(x,40,4,12,24,'#5a4a2a');rect2(x,48,12,6,8,'#ffcd75');rect2(x,2,10,4,12,'#ef7d57');for(let i=0;i<5;i++)rect2(x,10+i*6,16,4,4,'#4a3a2a');},
 cardassian:(x)=>{poly(x,[[2,16],[20,6],[50,12],[60,16],[50,20],[20,26]],'#a89a6a');poly(x,[[20,10],[46,13],[46,19],[20,22]],'#8a7a4a');rect2(x,54,15,6,2,'#ffcd75');rect2(x,2,15,3,3,'#ef7d57');rect2(x,26,15,14,2,'#5a4a2a');},
 jem:(x)=>{ell(x,30,16,24,8,'#5a4a8a');ell(x,30,14,22,4,'#7a6aaa');poly(x,[[10,22],[18,30],[24,22]],'#4a3a7a');poly(x,[[36,22],[44,30],[48,22]],'#4a3a7a');rect2(x,48,14,8,4,'#73eff7');rect2(x,6,14,6,3,'#73eff7');},
 sphere:(x)=>{ell(x,24,24,22,22,'#2a3a2a');for(let i=4;i<46;i+=5){rect2(x,4,i,40,1,'#1a1c2c');rect2(x,i,4,1,40,'#1a1c2c');}for(let i=0;i<14;i++)rect2(x,8+((i*37)%32),8+((i*53)%32),2,1,'#a7f070');},
 cube:(x)=>{rect2(x,0,0,72,72,'#2a3a2a');for(let i=0;i<72;i+=4){rect2(x,0,i,72,1,'#1a1c2c');rect2(x,i,0,1,72,'#1a1c2c');}for(let i=0;i<60;i++)rect2(x,(i*29)%70,(i*47)%70,2,1,i%5?'#38b764':'#a7f070');rect2(x,30,30,12,12,'#38b764');rect2(x,33,33,6,6,'#a7f070');},
 fedrogue:(x)=>{SHIPART.fed(x);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(90,40,60,0.45)';x.fillRect(0,0,80,40);x.globalCompositeOperation='source-over';},
};
function rect2(x,a,b,w,h,col){x.fillStyle=col;x.fillRect(a,b,w,h);}
const SHIPSPR={};
for(const k in SHIPART){const big=k==='cube'?[72,72]:k==='sphere'?[48,48]:[68,36];SHIPSPR[k]=bakeShip(big[0],big[1],SHIPART[k]);}

// ---- factions (player choices) ----
const FACTIONS=[
 {id:'fed',n:'UNITED FEDERATION',short:'FEDERATION',ship:'USS ENDEAVOUR',cls:'EXPLORER CLASS',art:'fed',col:'#41a6f6',wpn:'phaser',
  hull:30,sys:{shields:2,weapons:2,engines:2,sensors:2},power:6,torps:6,fuel:8,lat:30,
  crew:['CMD','SEC','SCI','ENG','MED'],races:['HUMAN','VULCAN','ANDORIAN','BETAZOID','TRILL','BOLIAN','BAJORAN'],
  perk:'DIPLOMATS: HAILING IS FAR MORE LIKELY TO WORK. A FULL MEDICAL BAY HEALS CREW EVERY JUMP.',stats:[3,3,3,4]},
 {id:'klingon',n:'KLINGON EMPIRE',short:'KLINGON',ship:"IKS QO'NOS FURY",cls:'BIRD-OF-PREY',art:'klingon',col:'#b13e53',wpn:'disruptor',
  hull:26,sys:{shields:1,weapons:3,engines:2,sensors:1},power:6,torps:5,fuel:7,lat:25,cloak:true,
  crew:['CMD','SEC','SEC','ENG'],races:['KLINGON'],
  perk:'WARRIORS: CREW DEAL +50% MELEE DAMAGE. CAN CLOAK. BOARDING ACTIONS ARE STRONGER.',stats:[4,2,2,3]},
 {id:'romulan',n:'ROMULAN STAR EMPIRE',short:'ROMULAN',ship:"IRW TAL'SHIAR",cls:"D'DERIDEX WARBIRD",art:'romulan',col:'#38b764',wpn:'plasma',
  hull:34,sys:{shields:2,weapons:2,engines:1,sensors:3},power:7,torps:4,fuel:7,lat:30,cloak:true,
  crew:['CMD','SEC','SCI','ENG'],races:['ROMULAN','REMAN'],
  perk:'SPIES: CAN CLOAK. PLASMA TORPEDOES DEAL HEAVY DAMAGE. SENSORS REVEAL ENEMY SYSTEMS.',stats:[3,3,4,3]},
 {id:'ferengi',n:'FERENGI ALLIANCE',short:'FERENGI',ship:'FMS GREAT PROFIT',cls:"D'KORA MARAUDER",art:'ferengi',col:'#ffcd75',wpn:'phaser',
  hull:28,sys:{shields:2,weapons:1,engines:3,sensors:2},power:6,torps:3,fuel:10,lat:120,
  crew:['CMD','ENG','SCI','MED'],races:['FERENGI'],
  perk:'TRADERS: START RICH, 25% STORE DISCOUNT, CAN ALWAYS BRIBE. EXTRA LATINUM FROM LOOT.',stats:[2,4,3,2]},
];
// ---- crew ----
const ROLES={
 CMD:{n:'COMMAND',col:'#b13e53',hp:20,mel:3,ran:4,station:'helm',ab:['rally','order']},
 SEC:{n:'SECURITY',col:'#ffcd75',hp:24,mel:5,ran:5,station:'tactical',ab:['burst','stun']},
 SCI:{n:'SCIENCE',col:'#41a6f6',hp:16,mel:2,ran:3,station:'science',ab:['scan','analyze']},
 ENG:{n:'ENGINEERING',col:'#ffcd75',hp:20,mel:3,ran:3,station:'engineering',ab:['turret','overload']},
 MED:{n:'MEDICAL',col:'#41a6f6',hp:16,mel:2,ran:3,station:'sickbay',ab:['hypo','revive']},
};
const RACES={
 HUMAN:{skin:'#e0b090',hp:0,mel:0,ran:1,note:'ADAPTABLE: +1 RANGED'},
 VULCAN:{skin:'#e8c8a0',hp:0,mel:2,ran:0,note:'NERVE PINCH: +2 MELEE'},
 ANDORIAN:{skin:'#73a8f7',hp:2,mel:1,ran:0,note:'+2 HP, +1 MELEE',ant:true},
 BETAZOID:{skin:'#e0b090',hp:0,mel:0,ran:0,note:'EMPATH: SENSES NEARBY FOES',senses:true},
 TRILL:{skin:'#d8a880',hp:1,mel:0,ran:1,note:'+1 HP, +1 RANGED',spots:true},
 BOLIAN:{skin:'#5a7ad8',hp:3,mel:0,ran:0,note:'+3 HP'},
 BAJORAN:{skin:'#d8a070',hp:1,mel:1,ran:0,note:'+1 HP, +1 MELEE'},
 KLINGON:{skin:'#8a5a3a',hp:4,mel:2,ran:0,note:'+4 HP, +2 MELEE',ridge:true},
 ROMULAN:{skin:'#d8c8a0',hp:0,mel:1,ran:1,note:'+1 MELEE, +1 RANGED'},
 REMAN:{skin:'#b8b8c8',hp:3,mel:2,ran:-1,note:'+3 HP, +2 MELEE'},
 FERENGI:{skin:'#e09060',hp:-2,mel:0,ran:0,note:'GREEDY: +LATINUM FROM LOOT',ears:true},
};
const NAMES={HUMAN:['KIRK','RIKER','SISKO','JANEWAY','PIKE','HARPER','REYES','OKAFOR','CHEN','DUBOIS','MORROW','LAREN'],VULCAN:["T'PEL","SOREK","T'LAR","SURAK","VORIK","T'SAI"],ANDORIAN:["SHRAN","THY'LEK","TALAS","KELIS"],BETAZOID:['LWAXANA','TAM','ELORA','DEVINONI'],TRILL:['DAX','KAHN','TOBIN','EZRI'],BOLIAN:['MOT','RIXX','BOQ'],BAJORAN:['KIRA','RO','ODAN','LEETA','BAREIL'],
 KLINGON:['KORAX','GRENK','MAKTAR',"K'VAGH",'TOREL','KURN','BATAK','LURSA','VIXIS'],ROMULAN:["TOMALAK","SELA","DONATRA","VRENAK","KORVAL","T'RUL"],REMAN:['VKRUK','SHINZOR'],FERENGI:['GRISH','NOG','BRUNT','ZEK','KRAX','LEKK','OMAG']};
let crewUid=0;
function mkCrew(role,race){const R0=ROLES[role],rc=RACES[race];const name=choice(NAMES[race]);return{id:++crewUid,name,race,role,lvl:1,xp:0,maxHp:R0.hp+rc.hp,hp:R0.hp+rc.hp,mel:R0.mel+rc.mel,ran:R0.ran+rc.ran,station:null,alive:true,kills:0};}
function crewXp(c,n){c.xp+=n;while(c.xp>=c.lvl*12){c.xp-=c.lvl*12;c.lvl++;c.maxHp+=3;c.hp=Math.min(c.maxHp,c.hp+3);if(c.lvl%2)c.mel++;else c.ran++;toast(c.name+' REACHED LEVEL '+c.lvl,'#a7f070');}}
// crew pixel sprite (10x14) cache
const crewSprCache={};
function crewSpr(c){const key=c.race+c.role+(c.foe||'');if(crewSprCache[key])return crewSprCache[key];const rc=RACES[c.race]||{skin:'#e0b090'};const uni=ROLES[c.role]?ROLES[c.role].col:'#566c86';
 const [cv2,x]=mkCanvas(10,14);
 x.fillStyle=rc.skin;x.fillRect(3,1,4,4);x.fillStyle='#1a1c2c';x.fillRect(3,0,4,1);
 if(rc.ears){x.fillStyle=rc.skin;x.fillRect(1,1,2,3);x.fillRect(7,1,2,3);}if(rc.ant){x.fillStyle=rc.skin;x.fillRect(3,-1,1,1);x.fillRect(6,-1,1,1);x.fillRect(3,0,1,1);x.fillRect(6,0,1,1);}
 if(rc.ridge){x.fillStyle='#5e4632';x.fillRect(3,1,4,1);x.fillStyle='#1a1c2c';x.fillRect(2,1,1,4);x.fillRect(7,1,1,4);}
 x.fillStyle='#1a1c2c';x.fillRect(4,3,1,1);x.fillRect(6,3,1,1);
 x.fillStyle='#1a1c2c';x.fillRect(2,5,6,5);x.fillStyle=uni;x.fillRect(2,5,6,2);x.fillRect(1,6,1,3);x.fillRect(8,6,1,3);x.fillStyle=rc.skin;x.fillRect(1,9,1,1);x.fillRect(8,9,1,1);
 x.fillStyle='#ffcd75';x.fillRect(3,6,1,1);x.fillStyle='#1a1c2c';x.fillRect(3,10,2,3);x.fillRect(5,10,2,3);x.fillStyle='#0b0d17';x.fillRect(2,13,3,1);x.fillRect(5,13,3,1);
 const o=outlineC(cv2);return crewSprCache[key]={r:o,l:flipC(o)};}
// ---- away-mission foes ----
const FOES={
 jem:{n:"JEM'HADAR",hp:14,mel:4,ran:4,range:5,col:'#7a6a8a',skin:'#a89aa8',shroud:true,xp:6},
 borg:{n:'BORG DRONE',hp:16,mel:5,ran:0,range:0,col:'#333c57',skin:'#94b0c2',slow:true,adapt:true,xp:7},
 klingon:{n:'KLINGON WARRIOR',hp:16,mel:6,ran:3,range:4,col:'#5e4632',skin:'#8a5a3a',xp:6},
 romulan:{n:'ROMULAN SOLDIER',hp:11,mel:3,ran:4,range:6,col:'#566c86',skin:'#d8c8a0',xp:5},
 cardassian:{n:'CARDASSIAN SOLDIER',hp:12,mel:3,ran:4,range:5,col:'#6a6a50',skin:'#a0a890',xp:5},
 gorn:{n:'GORN',hp:24,mel:7,ran:0,range:0,col:'#38704a',skin:'#5a9a5a',slow:true,xp:8},
 orion:{n:'ORION PIRATE',hp:9,mel:4,ran:3,range:5,col:'#5d275d',skin:'#38b764',xp:4},
 beast:{n:'ALIEN BEAST',hp:10,mel:5,ran:0,range:0,col:'#b13e53',skin:'#ef7d57',fast:true,xp:4,beast:true},
 sentry:{n:'SECURITY SENTRY',hp:12,mel:0,ran:5,range:7,col:'#94b0c2',skin:'#ff3040',still:true,xp:5,mech:true},
 tribble:{n:'TRIBBLE',hp:1,mel:0,ran:0,range:0,col:'#a0703a',skin:'#c8904a',harmless:true,breed:true,xp:0},
 fedsec:{n:'ROGUE SECURITY',hp:12,mel:3,ran:4,range:6,col:'#ffcd75',skin:'#e0b090',xp:5},
};
const foeSprCache={};
function foeSpr(k){if(foeSprCache[k])return foeSprCache[k];const f=FOES[k];let c;
 if(f.beast)c=fromRows(["...rr.rr...","..rooroor..",".roowoowor.","rooooooooor","roooooooooo","oo.oooooo.o","o..o....o.o"],{o:f.skin,r:f.col});
 else if(f.mech)c=fromRows(["...kkkk...","..kggggk..",".kgRRRRgk.",".kggggggk.","..kgddgk..","...kddk...","..kkddkk..",".kggddggk."]);
 else if(f.harmless)c=fromRows(["..nnnn..",".nNnnNn.","nnnnnnnn","nNnnnnNn",".nnnnnn."]);
 else{const [cc,x]=mkCanvas(10,14);x.fillStyle=f.skin;x.fillRect(3,1,4,4);if(k==='borg'){x.fillStyle='#566c86';x.fillRect(3,1,2,2);x.fillStyle='#ff3040';x.fillRect(6,2,1,1);}else if(k==='gorn'){x.fillRect(2,1,6,4);x.fillStyle='#ffcd75';x.fillRect(6,2,1,1);}else{x.fillStyle='#1a1c2c';x.fillRect(4,3,1,1);x.fillRect(6,3,1,1);}
  if(k==='jem'){x.fillStyle='#d8c8d8';x.fillRect(2,1,1,3);x.fillRect(7,1,1,3);}if(k==='cardassian'){x.fillStyle='#6a6a50';x.fillRect(2,4,6,1);}
  x.fillStyle=f.col;x.fillRect(2,5,6,5);x.fillRect(1,6,1,3);x.fillRect(8,6,1,3);x.fillStyle='#1a1c2c';x.fillRect(3,10,2,3);x.fillRect(5,10,2,3);if(k==='gorn'){x.fillStyle=f.skin;x.fillRect(1,5,8,6);}c=cc;}
 const o=outlineC(c);return foeSprCache[k]={r:o,l:flipC(o)};}
// ---- enemy starships ----
const ESHIPS={
 orion:{n:'ORION RAIDER',art:'orion',hull:10,sys:{shields:1,weapons:1,engines:2,sensors:1},power:4,torps:1,crew:'orion',tier:1,wpn:'disruptor',loot:[12,24]},
 gorn:{n:'GORN CRUISER',art:'gorn',hull:15,sys:{shields:2,weapons:2,engines:1,sensors:1},power:5,torps:2,crew:'gorn',tier:1,wpn:'disruptor',loot:[15,28]},
 klingon:{n:'KLINGON RAIDER',art:'klingon',hull:14,sys:{shields:1,weapons:3,engines:2,sensors:1},power:6,torps:3,crew:'klingon',tier:2,wpn:'disruptor',cloak:true,loot:[18,32]},
 romulan:{n:'ROMULAN WARBIRD',art:'romulan',hull:20,sys:{shields:3,weapons:2,engines:1,sensors:2},power:7,torps:2,crew:'romulan',tier:2,wpn:'plasma',cloak:true,loot:[20,36]},
 cardassian:{n:'CARDASSIAN GALOR',art:'cardassian',hull:18,sys:{shields:2,weapons:3,engines:1,sensors:1},power:6,torps:2,crew:'cardassian',tier:2,wpn:'disruptor',loot:[20,34]},
 ferengi:{n:'FERENGI MARAUDER',art:'ferengi',hull:16,sys:{shields:2,weapons:1,engines:3,sensors:2},power:6,torps:1,crew:'orion',tier:1,wpn:'phaser',loot:[30,50],greedy:true},
 fedrogue:{n:'ROGUE STARFLEET SHIP',art:'fedrogue',hull:20,sys:{shields:2,weapons:2,engines:2,sensors:2},power:7,torps:3,crew:'fedsec',tier:2,wpn:'phaser',loot:[20,36]},
 jem:{n:"JEM'HADAR ATTACK SHIP",art:'jem',hull:16,sys:{shields:2,weapons:3,engines:3,sensors:2},power:8,torps:3,crew:'jem',tier:3,wpn:'disruptor',loot:[25,40]},
 sphere:{n:'BORG SPHERE',art:'sphere',hull:24,sys:{shields:3,weapons:3,engines:2,sensors:3},power:9,torps:2,crew:'borg',tier:4,wpn:'borg',adapt:true,loot:[30,50]},
 cube:{n:'BORG CUBE',art:'cube',hull:55,sys:{shields:3,weapons:4,engines:1,sensors:4},power:12,torps:4,crew:'borg',tier:5,wpn:'borg',adapt:true,boss:true,loot:[0,0]},
};
const WPNCOL={phaser:'#ef7d57',disruptor:'#a7f070',plasma:'#38b764',borg:'#73ff9a'};
const SYS=['shields','weapons','engines','sensors'];
const SYSN={shields:'SHIELDS',weapons:'WEAPONS',engines:'ENGINES',sensors:'SENSORS'};
const SYSCOL={shields:'#41a6f6',weapons:'#ef7d57',engines:'#ffcd75',sensors:'#a7f070'};
const ITEMS={medkit:{n:'MEDKIT',d:'HEAL A CREW MEMBER FOR 12',price:8},grenade:{n:'PHOTON GRENADE',d:'BLAST A 3X3 AREA FOR 8 DAMAGE',price:12},stim:{n:'COMBAT STIM',d:'+3 DAMAGE FOR 5 TURNS',price:10}};
