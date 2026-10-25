// ================= RUN STATE, SECTOR MAP, EVENTS, STORE =================
let S='title',R=null,EV=null,STORE=null,PLANET=null,SEL=null,anim=0;
const SECTORS=['NEUTRAL ZONE','BADLANDS','BRIAR PATCH','GAMMA QUADRANT RIFT','BORG SPACE'];
const STATIONS=['helm','tactical','engineering','science','sickbay'];
const STN={helm:{n:'HELM',d:'+EVASION',role:'CMD'},tactical:{n:'TACTICAL',d:'+ACCURACY, +DAMAGE',role:'SEC'},engineering:{n:'ENGINEERING',d:'+1 POWER, REPAIRS',role:'ENG'},science:{n:'SCIENCE',d:'+SHIELD REGEN, SCANS',role:'SCI'},sickbay:{n:'SICKBAY',d:'HEALS CREW EACH JUMP',role:'MED'}};
function newRun(fi){const F=FACTIONS[fi];const sys={};for(const k of SYS)sys[k]={lvl:F.sys[k],dmg:0};
 R={F,ship:{name:F.ship,art:F.art,hull:F.hull,maxHull:F.hull,sys,power:F.power,torps:F.torps,cloak:!!F.cloak},fuel:F.fuel,lat:F.lat,items:{medkit:2,grenade:1,stim:0},crew:[],sector:1,stats:{kills:0,ships:0,missions:0,jumps:0,lat:0},seed:randi(1,1e9)};
 for(const role of F.crew)R.crew.push(mkCrew(role,choice(F.races)));autoStations();genSector();S='map';setMusic('explore');toast('WELCOME ABOARD, CAPTAIN','#ffcd75');}
const alive=()=>R.crew.filter(c=>c.alive);
const hasRole=r=>alive().some(c=>c.role===r);
function autoStations(){for(const c of R.crew)c.station=null;const free=alive();for(const st of STATIONS){let c=free.find(c=>!c.station&&c.role===STN[st].role);if(c)c.station=st;}for(const st of STATIONS){if(R.crew.some(c=>c.station===st))continue;const c=free.find(c=>!c.station);if(c)c.station=st;}}
const atStation=st=>R.crew.find(c=>c.alive&&c.station===st);
function stnBonus(st){const c=atStation(st);if(!c)return 0;return c.role===STN[st].role?1:0.5;}
function price(p){return Math.max(1,Math.round(p*(R.F.id==='ferengi'?0.75:1)));}
function gain(k,n,quiet){if(k==='lat'){if(n>0&&R.F.id==='ferengi')n=Math.round(n*1.25);R.lat=Math.max(0,R.lat+n);if(n>0)R.stats.lat+=n;}else if(k==='fuel')R.fuel=Math.max(0,R.fuel+n);else if(k==='torps')R.ship.torps=Math.max(0,R.ship.torps+n);else if(k==='hull')R.ship.hull=clamp(R.ship.hull+n,0,R.ship.maxHull);
 if(!quiet)toast((n>0?'+':'')+n+' '+{lat:'LATINUM',fuel:'DILITHIUM',torps:'TORPEDOES',hull:'HULL'}[k],n>0?'#a7f070':'#ff6070');if(k==='hull'&&R.ship.hull<=0)gameOver('THE '+R.ship.name+' WAS DESTROYED.');}
function addCrew(role,race){if(alive().length>=8){toast('NO ROOM FOR MORE CREW','#ff6070');return null;}const c=mkCrew(role||choice(Object.keys(ROLES)),race||choice(R.F.races.concat(['HUMAN','BAJORAN','VULCAN'])));R.crew.push(c);autoStations();toast(c.name+' ('+ROLES[c.role].n+') JOINED THE CREW','#a7f070');return c;}
function killCrew(c,why){if(!c||!c.alive)return;c.alive=false;c.hp=0;c.station=null;toast(c.name+' '+(why||'WAS KILLED'),'#ff6070');sfx.death();autoStations();if(!alive().length)gameOver('YOUR ENTIRE CREW WAS LOST.');}
function hurtCrew(c,n){if(!c||!c.alive)return;c.hp-=n;if(c.hp<=0)killCrew(c);}
function gameOver(why){if(S==='gameover')return;R.why=why;S='gameover';setMusic('menu');sfx.bigboom();}
// ---------------- sector generation ----------------
function genSector(){const nodes=[],cols=8;let id=0;
 for(let c=0;c<cols;c++){const k=c===0||c===cols-1?1:randi(2,3);for(let i=0;i<k;i++)nodes.push({id:id++,col:c,x:Math.round(34+c*(412/(cols-1))+(c&&c<cols-1?rand(-10,10):0)),y:Math.round(k===1?140:62+(i+0.5)*(156/k)+rand(-10,10)),type:'empty',visited:false,edges:[]});}
 const link=(a,b)=>{if(!a.edges.includes(b.id)){a.edges.push(b.id);b.edges.push(a.id);}};
 for(const a of nodes){const next=nodes.filter(b=>b.col===a.col+1);let any=false;for(const b of next)if(Math.abs(b.y-a.y)<95){link(a,b);any=true;}if(!any&&next.length)link(a,next.reduce((p,q)=>Math.abs(q.y-a.y)<Math.abs(p.y-a.y)?q:p));}
 for(const b of nodes)if(b.col>0&&!b.edges.some(e=>nodes[e].col===b.col-1)){const prev=nodes.filter(a=>a.col===b.col-1);link(b,prev.reduce((p,q)=>Math.abs(q.y-b.y)<Math.abs(p.y-b.y)?q:p));}
 for(const a of nodes)if(chance(0.25)){const same=nodes.find(b=>b.col===a.col&&b!==a&&Math.abs(b.y-a.y)<70);if(same)link(a,same);}
 const W8=[['hostile',30],['event',30],['planet',18],['nebula',7],['empty',8],['store',4]];const tot=W8.reduce((s,w)=>s+w[1],0);
 for(const n of nodes){if(n.col===0){n.type='start';n.visited=true;continue;}if(n.col===cols-1){n.type=R.sector===5?'boss':'exit';continue;}let r=rand(0,tot);for(const [t,w] of W8){r-=w;if(r<=0){n.type=t;break;}}}
 const mid=nodes.filter(n=>n.col>=2&&n.col<=6);if(!mid.some(n=>n.type==='store'))choice(mid).type='store';if(!mid.some(n=>n.type==='planet'))choice(mid.filter(n=>n.type!=='store')).type='planet';
 for(const n of nodes)if(n.type==='planet')n.planet=mkPlanet();
 const neb=[];for(let i=0;i<3;i++)neb.push({x:rand(40,440),y:rand(40,230),r:randi(40,80),c:choice(['#5d275d','#29366f','#257179','#7a2450'])});
 R.map={nodes,cur:0,front:-1.5,neb};}
const PTYPES=[{n:'CLASS M',th:'grass',d:'A LUSH WORLD WITH BREATHABLE AIR.'},{n:'DESERT WORLD',th:'desert',d:'BLISTERING SANDS AND ANCIENT RUINS.'},{n:'ICE WORLD',th:'ice',d:'FROZEN TUNDRA UNDER A PALE SUN.'},{n:'VOLCANIC WORLD',th:'lava',d:'MOLTEN RIVERS AND TOXIC ASH.'},{n:'CAVE NETWORK',th:'cave',d:'DEEP TUNNELS RICH IN DILITHIUM.'},{n:'DERELICT STATION',th:'station',d:'AN ABANDONED STARBASE, POWER FLICKERING.'}];
const OBJS={artifact:{n:'RECOVER THE ARTIFACT',d:'AN ANCIENT ICONIAN RELIC IS HIDDEN HERE.'},rescue:{n:'RESCUE THE COLONISTS',d:'SURVIVORS ARE TRAPPED AND CALLING FOR HELP.'},dilithium:{n:'MINE DILITHIUM',d:'RAW CRYSTALS CAN FUEL OUR WARP DRIVE.'},data:{n:'DOWNLOAD THE DATA CORE',d:'A COMPUTER CORE HOLDS VALUABLE INTEL.'}};
function foePool(){const s=R.sector;const pool=[['orion',3],['beast',3],['sentry',2],['tribble',1]];if(s>=1)pool.push(['gorn',1.5],['cardassian',2]);if(s>=2)pool.push(['klingon',2],['romulan',2]);if(s>=3)pool.push(['jem',3]);if(s>=4)pool.push(['borg',3]);return pool.filter(p=>!(R.F.id==='klingon'&&p[0]==='klingon')&&!(R.F.id==='romulan'&&p[0]==='romulan'));}
function mkPlanet(){const t=choice(PTYPES);const o=choice(Object.keys(OBJS));const pool=foePool();const foes=[];for(let i=0;i<2;i++){let tot=pool.reduce((s,p)=>s+p[1],0),r=rand(0,tot);for(const [k,w] of pool){r-=w;if(r<=0){if(!foes.includes(k))foes.push(k);break;}}}if(!foes.length)foes.push('beast');return{t,o,foes,name:choice(['CETI','RIGEL','VEGA','TALOS','EXO','KESSIK','DORVAN','MINOS','TEZWA','BREEN','OMEGA','THETA'])+' '+choice(['II','III','IV','V','VI','PRIME','B'])};}
// ---------------- jumping ----------------
let JUMP=null;
function canJump(n){const cur=R.map.nodes[R.map.cur];return cur.edges.includes(n.id);}
function jumpTo(n){JUMP={to:n.id,t:0};sfx.warp();}
function updJump(){if(!JUMP)return;JUMP.t++;warpFx=Math.min(1,JUMP.t/30);if(JUMP.t===50){const n=R.map.nodes[JUMP.to];R.map.cur=n.id;R.stats.jumps++;
  if(R.fuel>0)R.fuel--;else{toast('NO DILITHIUM! WARP CORE STRAIN','#ff6070');gain('hull',-3);}
  R.map.front+=0.5;
  for(const c of alive()){let h=1;if(atStation('sickbay')===c)h=0;const med=atStation('sickbay');if(med)h+=med.role==='MED'?3:1;if(R.F.id==='fed')h+=1;c.hp=Math.min(c.maxHp,c.hp+h);}
  if(R.ship.sys)for(const k of SYS)if(R.ship.sys[k].dmg>0&&atStation('engineering')&&chance(0.5))R.ship.sys[k].dmg--;
  JUMP=null;warpFx=0;arrive(n);}}
function arrive(n){const wasVisited=n.visited;n.visited=true;if(S==='gameover')return;
 if(n.col<=R.map.front&&n.type!=='exit'&&n.type!=='boss'){startCombat('sphere',{overrun:true});return;}
 if(wasVisited&&n.type!=='exit'&&n.type!=='store'&&n.type!=='boss')return;
 switch(n.type){
  case 'hostile':startCombat(pickEnemy());break;
  case 'event':startEvent(pickEvent());break;
  case 'planet':PLANET=n.planet;S='planet';break;
  case 'store':openStore();break;
  case 'nebula':startEvent(EVENTS.find(e=>e.id==='nebula'));break;
  case 'empty':if(chance(0.3)){gain('lat',randi(4,10));toast('SALVAGE FLOATING IN SPACE','#94b0c2');}else toast('NOTHING BUT EMPTY SPACE','#94b0c2');break;
  case 'boss':sfx.alert();startEvent(EVENTS.find(e=>e.id==='cube'));break;}}
function pickEnemy(){const s=R.sector;const pool=Object.keys(ESHIPS).filter(k=>{const e=ESHIPS[k];if(e.boss)return false;if(k===R.F.id||(k==='fedrogue'&&R.F.id!=='fed'?false:k==='fedrogue'&&R.F.id==='fed'?false:false))return false;return e.tier<=Math.min(4,s+1)&&e.tier>=Math.max(1,s-2)&&!(k==='sphere'&&s<4);});
 const filtered=pool.filter(k=>!(R.F.id==='fed'&&k==='fedrogue'));return choice(filtered.length?filtered:['orion']);}
// ---------------- events ----------------
const EVENTS=[];
function E(id,title,text,opts,w=1){EVENTS.push({id,title,text,opts,w});}
const ok=(text,after)=>({text,after});
E('distress','DISTRESS CALL','A FREIGHTER IS LOSING LIFE SUPPORT. THEIR CAPTAIN BEGS FOR HELP.',[
 {t:'SEND AN ENGINEERING TEAM (-1 DILITHIUM)',go:()=>{gain('fuel',-1);if(chance(0.6)){gain('lat',randi(15,30));return ok('THE GRATEFUL CREW PAYS US IN LATINUM.');}addCrew();return ok('ONE OF THEIR CREW ASKS TO JOIN US.');}},
 {t:'[MED] TREAT THE INJURED',req:()=>hasRole('MED'),go:()=>{addCrew();gain('lat',10);return ok('WE SAVE EVERYONE. A YOUNG OFFICER SIGNS ON.');}},
 {t:'[FERENGI] SALVAGE THEIR CARGO',req:()=>R.F.id==='ferengi',go:()=>{gain('lat',40);return ok('RULE OF ACQUISITION #22: A WISE MAN CAN HEAR PROFIT IN THE WIND.');}},
 {t:'IT COULD BE A TRAP. IGNORE IT.',go:()=>ok('WE MOVE ON. THE SIGNAL FADES.')}]);
E('pirates','ORION AMBUSH','ORION RAIDERS DECLOAK AND DEMAND OUR CARGO.',[
 {t:'RAISE SHIELDS. RED ALERT!',go:()=>ok('BATTLE STATIONS!',()=>startCombat('orion'))},
 {t:'PAY THEM OFF (-20 LATINUM)',req:()=>R.lat>=20,go:()=>{gain('lat',-20);return ok('THE PIRATES TAKE THE LATINUM AND LEAVE.');}},
 {t:'[KLINGON] THREATEN THEM WITH A GLORIOUS DEATH',req:()=>R.F.id==='klingon',go:()=>{gain('lat',15);return ok('THE ORIONS FLEE, DROPPING THEIR LOOT.');}},
 {t:'[SEC] BOARD THEM FIRST',req:()=>hasRole('SEC'),go:()=>ok('WE BEAM A STRIKE TEAM ONTO THEIR SHIP.',()=>startAwaySelect({kind:'board',ship:'orion',foes:['orion'],reward:'board'}))}]);
E('anomaly','SPATIAL ANOMALY','SENSORS DETECT A SUBSPACE ANOMALY RIPPLING WITH STRANGE ENERGY.',[
 {t:'[SCI] STUDY IT',req:()=>hasRole('SCI'),go:()=>{const k=choice(SYS);R.ship.sys[k].lvl=Math.min(5,R.ship.sys[k].lvl+1);return ok('THE DATA LETS US UPGRADE OUR '+SYSN[k]+'!');}},
 {t:'FLY THROUGH IT',go:()=>{if(chance(0.5)){gain('fuel',3);return ok('THE ANOMALY RECHARGES OUR DILITHIUM.');}gain('hull',-5);return ok('THE HULL BUCKLES UNDER GRAVIMETRIC SHEAR.');}},
 {t:'STEER CLEAR',go:()=>ok('BETTER SAFE THAN SORRY.')}]);
E('q','AN OMNIPOTENT VISITOR','A FLASH OF LIGHT. A SMUG FIGURE IN A JUDGE\'S ROBE APPEARS ON THE BRIDGE: "LET\'S PLAY A LITTLE GAME, CAPTAIN."',[
 {t:'PLAY HIS GAME',go:()=>{const r=randi(0,3);if(r===0){gain('lat',60);return ok('"HOW AMUSING." LATINUM RAINS ONTO THE BRIDGE.');}if(r===1){for(const k of SYS)R.ship.sys[k].dmg=0;gain('hull',99);return ok('"CONSIDER IT A GIFT." THE SHIP IS FULLY REPAIRED.');}if(r===2){const c=choice(alive());crewXp(c,30);return ok('"YOUR '+c.name+' AMUSES ME." THEY FEEL WISER.');}gain('fuel',-2);return ok('"BORING!" HE SNAPS AND OUR DILITHIUM VANISHES.');}},
 {t:'REFUSE. "WE ARE NOT YOUR PLAYTHINGS."',go:()=>{if(chance(0.5)){gain('lat',20);return ok('"PLUCKY. FINE." HE LEAVES A TIP.');}return ok('HE SIGHS DRAMATICALLY AND VANISHES.');}}],0.6);
E('derelict','DERELICT VESSEL','A DARK STARSHIP DRIFTS AHEAD. NO LIFE SIGNS... OR SO SENSORS SAY.',[
 {t:'SEND AN AWAY TEAM',go:()=>ok('WE PREPARE TO BEAM OVER.',()=>startAwaySelect({kind:'derelict',theme:'station',foes:['sentry',choice(foePool())[0]],obj:'data'}))},
 {t:'SCAN AND SALVAGE FROM A DISTANCE',go:()=>{gain('lat',randi(5,12));gain('torps',1);return ok('WE TRACTOR IN SOME LOOSE SALVAGE.');}},
 {t:'LEAVE IT',go:()=>ok('SOME MYSTERIES ARE BEST LEFT ALONE.')}]);
E('plague','PLAGUE COLONY','A COLONY BROADCASTS A PLEA. A FAST-SPREADING FEVER IS KILLING THEM.',[
 {t:'[MED] DEVELOP A CURE',req:()=>hasRole('MED'),go:()=>{gain('lat',30);crewXp(alive().find(c=>c.role==='MED'),20);return ok('THE CURE WORKS. THEY PAY US GENEROUSLY.');}},
 {t:'BEAM DOWN SUPPLIES',go:()=>{if(chance(0.4)){const c=choice(alive());hurtCrew(c,8);return ok(c.name+' CATCHES THE FEVER BUT PULLS THROUGH.');}gain('lat',10);return ok('THE COLONISTS THANK US.');}},
 {t:'QUARANTINE PROTOCOLS. WE CANNOT RISK IT.',go:()=>ok('WE LEAVE THEM TO THEIR FATE.')}]);
E('tribbles','TRIBBLE TRADER','A CHEERFUL TRADER OFFERS US A CUTE, PURRING FURBALL.',[
 {t:'BUY ONE (-5 LATINUM)',req:()=>R.lat>=5,go:()=>{gain('lat',-5);R.tribbles=(R.tribbles||0)+1;return ok('IT PURRS. IT IS VERY CUTE. WHAT COULD GO WRONG?');}},
 {t:'NO THANKS',go:()=>ok('THE TRADER SHRUGS.')}]);
E('ionstorm','ION STORM','A VIOLENT ION STORM BLOCKS OUR COURSE.',[
 {t:'PUSH THROUGH',go:()=>{const helm=stnBonus('helm');if(chance(0.4+helm*0.4))return ok('SUPERB PILOTING GETS US THROUGH UNHARMED.');gain('hull',-4);const k=choice(SYS);R.ship.sys[k].dmg=Math.min(R.ship.sys[k].lvl,R.ship.sys[k].dmg+1);return ok('THE STORM DAMAGES OUR '+SYSN[k]+'.');}},
 {t:'GO AROUND (-1 DILITHIUM)',go:()=>{gain('fuel',-1);return ok('A LONG DETOUR, BUT SAFE.');}}]);
E('refugees','REFUGEE SHUTTLE','A SHUTTLE FULL OF REFUGEES FLEEING THE WAR ASKS FOR ASYLUM.',[
 {t:'TAKE THEM IN',go:()=>{addCrew();if(chance(0.3))addCrew();return ok('SOME OF THEM VOLUNTEER TO SERVE.');}},
 {t:'GIVE THEM SUPPLIES (-1 DILITHIUM)',go:()=>{gain('fuel',-1);gain('lat',8);return ok('THEY PRESS A SMALL GIFT ON US.');}},
 {t:'TURN THEM AWAY',go:()=>ok('THE SHUTTLE DRIFTS OFF INTO THE DARK.')}]);
E('probe','ANCIENT PROBE','AN ANCIENT PROBE TRANSMITS AN UNKNOWN MATHEMATICAL LANGUAGE.',[
 {t:'[SCI] DECODE THE SIGNAL',req:()=>hasRole('SCI'),go:()=>{R.ship.power=Math.min(14,R.ship.power+1);return ok('IT CONTAINS A REACTOR DESIGN. +1 SHIP POWER!');}},
 {t:'[ENG] CANNIBALISE IT',req:()=>hasRole('ENG'),go:()=>{gain('torps',3);gain('lat',10);return ok('ITS PARTS MAKE GOOD TORPEDO CASINGS.');}},
 {t:'DESTROY IT',go:()=>{gain('lat',5);return ok('IT EXPLODES QUIETLY.');}}]);
E('rival','A RIVAL CAPTAIN','A WARSHIP HAILS US. ITS CAPTAIN CHALLENGES OUR CREW TO SINGLE COMBAT FOR HONOUR.',[
 {t:'[SEC] ACCEPT THE DUEL',req:()=>hasRole('SEC'),go:()=>{const c=alive().find(c=>c.role==='SEC');if(chance(0.55+c.lvl*0.05+(R.F.id==='klingon'?0.2:0))){crewXp(c,25);gain('lat',25);return ok(c.name+' WINS! THE RIVAL GRUNTS AND PAYS UP.');}hurtCrew(c,12);return ok(c.name+' IS BADLY BEATEN.');}},
 {t:'DECLINE. OPEN FIRE INSTEAD.',go:()=>ok('SO BE IT.',()=>startCombat(choice(['klingon','cardassian','gorn'].filter(k=>k!==R.F.id))))},
 {t:'DECLINE POLITELY',go:()=>{if(chance(0.5))return ok('THEY CALL US COWARDS AND LEAVE.');return ok('THEY ATTACK ANYWAY!',()=>startCombat(pickEnemy()));}}]);
E('holodeck','HOLODECK MALFUNCTION','THE HOLODECK SAFETY PROTOCOLS HAVE FAILED. A 1920S GANGSTER PROGRAM HAS CREW TRAPPED.',[
 {t:'[ENG] SHUT IT DOWN',req:()=>hasRole('ENG'),go:()=>{for(const c of alive())crewXp(c,4);return ok('WE RESTORE CONTROL. EVERYONE LEARNED SOMETHING.');}},
 {t:'PLAY ALONG WITH THE STORY',go:()=>{const c=choice(alive());if(chance(0.6)){crewXp(c,15);return ok(c.name+' SOLVES THE MYSTERY IN STYLE.');}hurtCrew(c,6);return ok(c.name+' IS HURT BY A VERY REAL TOMMY GUN.');}}]);
E('merchant','TRADING CONVOY','A MERCHANT CONVOY OFFERS TO TRADE.',[
 {t:'BUY 3 DILITHIUM (-'+'12 LATINUM)',req:()=>R.lat>=price(12),go:()=>{gain('lat',-price(12));gain('fuel',3);return ok('A FAIR TRADE.');}},
 {t:'BUY 3 TORPEDOES (-15 LATINUM)',req:()=>R.lat>=price(15),go:()=>{gain('lat',-price(15));gain('torps',3);return ok('TORPEDOES LOADED.');}},
 {t:'SELL 2 TORPEDOES (+14 LATINUM)',req:()=>R.ship.torps>=2,go:()=>{gain('torps',-2);gain('lat',14);return ok('PLEASURE DOING BUSINESS.');}},
 {t:'MOVE ON',go:()=>ok('SAFE TRAVELS.')}]);
E('nebula','NEBULA','WE ENTER A DENSE MUTARA-CLASS NEBULA. SENSORS ARE NEARLY BLIND.',[
 {t:'HIDE HERE AND REPAIR',go:()=>{gain('hull',4);if(chance(0.35))return ok('SOMETHING FINDS US IN THE MURK!',()=>startCombat(pickEnemy()));return ok('WE PATCH UP THE HULL IN PEACE.');}},
 {t:'[SCI] HARVEST NEBULA GAS',req:()=>hasRole('SCI'),go:()=>{gain('fuel',2);return ok('THE BUSSARD COLLECTORS DRINK DEEP.');}},
 {t:'PRESS ON',go:()=>ok('WE EMERGE ON THE FAR SIDE.')}],0);
E('cube','THE BORG','A BORG CUBE BLOCKS THE WAY HOME. "WE ARE THE BORG. RESISTANCE IS FUTILE."',[
 {t:'ALL HANDS, BATTLE STATIONS!',go:()=>ok('FOR EVERYONE WHO CAME BEFORE US.',()=>startCombat('cube'))}],0);
E('beacon','LONG RANGE BEACON','AN OLD STARFLEET BEACON STILL TRANSMITS SECTOR CHARTS.',[
 {t:'DOWNLOAD THE CHARTS',go:()=>{R.map.revealed=true;return ok('THE WHOLE SECTOR MAP IS REVEALED.');}},
 {t:'[ENG] SALVAGE ITS POWER CELL',req:()=>hasRole('ENG'),go:()=>{gain('fuel',2);return ok('+2 DILITHIUM.');}}]);
E('ambassador','STRANDED AMBASSADOR','A DIPLOMAT\'S SHUTTLE HAS BROKEN DOWN. THEY NEED A RIDE TO A NEARBY STARBASE.',[
 {t:'GIVE THEM PASSAGE',go:()=>{if(chance(0.25))return ok('THE "AMBASSADOR" WAS A CHANGELING SPY! IT ATTACKS.',()=>startCombat(pickEnemy()));gain('lat',35);return ok('THE AMBASSADOR REWARDS US HANDSOMELY.');}},
 {t:'[FED] OFFER FULL DIPLOMATIC HONOURS',req:()=>R.F.id==='fed',go:()=>{gain('lat',45);addCrew('CMD');return ok('THEIR AIDE IS SO IMPRESSED THEY REQUEST A TRANSFER.');}},
 {t:'NOT OUR PROBLEM',go:()=>ok('WE WISH THEM LUCK.')}]);
function pickEvent(){const pool=EVENTS.filter(e=>e.w>0);let tot=pool.reduce((s,e)=>s+e.w,0),r=rand(0,tot);for(const e of pool){r-=e.w;if(r<=0)return e;}return pool[0];}
function startEvent(e){EV={e,res:null};S='event';sfx.chirp();}
// tribbles multiply
function tribbleTick(){if(!R.tribbles)return;R.tribbles=Math.min(999,Math.ceil(R.tribbles*1.6));if(R.tribbles>40&&chance(0.3)){gain('fuel',-1);toast('TRIBBLES ATE THE DILITHIUM STORES!','#ffcd75');}}
// ---------------- store ----------------
function openStore(){STORE={stock:[{k:'fuel',n:'DILITHIUM X1',p:3},{k:'torps',n:'PHOTON TORPEDO',p:6},{k:'medkit',n:'MEDKIT',p:ITEMS.medkit.price},{k:'grenade',n:'PHOTON GRENADE',p:ITEMS.grenade.price},{k:'stim',n:'COMBAT STIM',p:ITEMS.stim.price},{k:'crew',n:'HIRE CREW: '+choice(Object.keys(ROLES)),p:40}]};S='store';setMusic('menu');}
function buy(it){const p=price(it.p);if(R.lat<p){sfx.bad();return;}R.lat-=p;sfx.coin();
 if(it.k==='fuel')R.fuel++;else if(it.k==='torps')R.ship.torps++;else if(ITEMS[it.k])R.items[it.k]++;else if(it.k==='crew'){const role=it.n.split(': ')[1];if(!addCrew(role)){R.lat+=p;}else{it.sold=true;}}}
