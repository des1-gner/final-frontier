'use strict';
// ================================================================
//  FINAL FRONTIER  -  a Star Trek themed roguelike (unofficial fan game)
//  FTL-style sector jumps + turn-based ship combat + Rogue Fable-style
//  away missions. Single file, no assets.
// ================================================================
const W=480,H=270;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=false;
function fit(){const s=Math.min(innerWidth/W,innerHeight/H);const k=s>=1?Math.floor(s):s;cv.style.width=W*k+'px';cv.style.height=H*k+'px';}
addEventListener('resize',fit);fit();
const rand=(a,b)=>a+Math.random()*(b-a),randi=(a,b)=>Math.floor(rand(a,b+1)),clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,choice=a=>a[Math.floor(Math.random()*a.length)];
const chance=p=>Math.random()<p;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=randi(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
function mulberry(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

// ---------------- font ----------------
const FONT={A:'25755',B:'65656',C:'34443',D:'65556',E:'74647',F:'74644',G:'34553',H:'55755',I:'72227',J:'11152',K:'55655',L:'44447',M:'57755',N:'65555',O:'25552',P:'65644',Q:'25563',R:'65655',S:'34216',T:'72222',U:'55557',V:'55552',W:'55775',X:'55255',Y:'55222',Z:'71247',
'0':'75557','1':'26227','2':'61247','3':'61216','4':'55711','5':'74616','6':'34757','7':'71222','8':'75757','9':'75716',
' ':'00000','.':'00002',',':'00024',':':'02020','!':'22202','?':'61202','-':'00700','+':'02720','/':'11244','*':'05250','%':'51245','<':'12421','>':'42124','(':'12221',')':'42224',"'":'22000','=':'07070','#':'57575','[':'32223',']':'62226','_':'00007','&':'25253','"':'55000'};
function drawStrTo(c,s,x,y,col,sc){c.fillStyle=col;for(let i=0;i<s.length;i++){const g=FONT[s[i]];if(!g)continue;for(let r=0;r<5;r++){const b=g.charCodeAt(r)-48;if(!b)continue;for(let q=0;q<3;q++)if(b&(4>>q))c.fillRect(x+(i*4+q)*sc,y+r*sc,sc,sc);}}}
const txtW=(s,sc=1)=>String(s).length*4*sc-sc;
function txt(s,x,y,col='#f4f4f4',sc=1,align='l',sh='#1a1c2c'){s=String(s).toUpperCase();const w=txtW(s,sc);if(align==='c')x-=w/2;else if(align==='r')x-=w;x=Math.round(x);y=Math.round(y);if(sh){const o=Math.max(1,sc>>1);drawStrTo(ctx,s,x+o,y+o,sh,sc);}drawStrTo(ctx,s,x,y,col,sc);return w;}
// word-wrap into lines of max chars
function wrap(s,max){const out=[];for(const para of String(s).toUpperCase().split('\n')){let line='';for(const w of para.split(' ')){if((line+' '+w).trim().length>max){out.push(line.trim());line=w;}else line+=' '+w;}out.push(line.trim());}return out;}

// ---------------- pixel helpers ----------------
const PAL={k:'#1a1c2c',d:'#333c57',G:'#566c86',g:'#94b0c2',w:'#f4f4f4',r:'#b13e53',o:'#ef7d57',y:'#ffcd75',l:'#a7f070',L:'#38b764',t:'#257179',s:'#29366f',b:'#3b5dc9',B:'#41a6f6',c:'#73eff7',p:'#5d275d',P:'#ff77a8',m:'#f6a6d0',R:'#ff3040',n:'#8a6a4a',N:'#5e4632'};
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return [c,x];}
function fromRows(rows,pal){pal=Object.assign({},PAL,pal||{});const h=rows.length,w=Math.max(...rows.map(r=>r.length));const [c,x]=mkCanvas(w,h);for(let j=0;j<h;j++)for(let i=0;i<rows[j].length;i++){const ch=rows[j][i];if(ch!=='.'&&pal[ch]){x.fillStyle=pal[ch];x.fillRect(i,j,1,1);}}return c;}
function flipC(src){const [c,x]=mkCanvas(src.width,src.height);x.translate(src.width,0);x.scale(-1,1);x.drawImage(src,0,0);return c;}
function tintC(src,col){const [c,x]=mkCanvas(src.width,src.height);x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c;}
function outlineC(src,col='#1a1c2c'){const [c,x]=mkCanvas(src.width+2,src.height+2);const t=tintC(src,col);for(const [dx,dy] of [[0,1],[2,1],[1,0],[1,2]])x.drawImage(t,dx,dy);x.drawImage(src,1,1);return c;}
function ell(c,cx,cy,rx,ry,col){c.fillStyle=col;for(let y=-ry;y<=ry;y++){const dx=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/((ry+0.5)*(ry+0.5)))));c.fillRect(Math.round(cx-dx),Math.round(cy+y),dx*2+1,1);}}
function poly(c,pts,col){c.fillStyle=col;let y0=Infinity,y1=-Infinity;for(const p of pts){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const yc=y+0.5,xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]));}xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2){const xa=Math.round(xs[i]),xb=Math.round(xs[i+1]);if(xb>xa)c.fillRect(xa,y,xb-xa,1);}}}
function disc(x,y,r,col){ctx.fillStyle=col;x=Math.round(x);y=Math.round(y);r=Math.round(r);if(r<=0){ctx.fillRect(x,y,1,1);return;}for(let dy=-r;dy<=r;dy++){const dx=Math.round(Math.sqrt(r*r-dy*dy));ctx.fillRect(x-dx,y+dy,dx*2+1,1);}}
function ring(x,y,r,col,th=1){ctx.fillStyle=col;const n=Math.max(12,Math.floor(r*6.3));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;ctx.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r),th,th);}}
function ringE(x,y,rx,ry,col){ctx.fillStyle=col;const n=Math.floor((rx+ry)*3.2);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;ctx.fillRect(Math.round(x+Math.cos(a)*rx),Math.round(y+Math.sin(a)*ry),1,1);}}
function line(x0,y0,x1,y1,col,th=1){ctx.fillStyle=col;const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));const o=th>>1;for(let i=0;i<=n;i++)ctx.fillRect(Math.round(lerp(x0,x1,i/n))-o,Math.round(lerp(y0,y1,i/n))-o,th,th);}
function rect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function frame9(x,y,w,h,col='#566c86',bg='#1a1c2c'){rect(x,y,w,h,'#0b0d17');rect(x+1,y+1,w-2,h-2,col);rect(x+2,y+2,w-4,h-4,bg);}
// LCARS-ish rounded bar
function lcars(x,y,w,h,col){rect(x+h/2,y,w-h,h,col);disc(x+h/2,y+h/2-0.5,h/2-0.5,col);disc(x+w-h/2,y+h/2-0.5,h/2-0.5,col);}

// ---------------- particles ----------------
let parts=[];
function P(x,y,vx,vy,life,col,sz=1,g=0){if(parts.length>1500)return;parts.push({x,y,vx,vy,life,max:life,col,sz,g});}
function burst(x,y,n,col,sp=2,life=30,sz=1){for(let i=0;i<n;i++){const a=rand(0,6.28),s=rand(0.3,1)*sp;P(x,y,Math.cos(a)*s,Math.sin(a)*s,rand(life*0.6,life),col,sz);}}
function updParts(){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life--;p.vy+=p.g;p.vx*=0.96;p.vy*=0.96;p.x+=p.vx;p.y+=p.vy;if(p.life<=0){parts[i]=parts[parts.length-1];parts.pop();}}}
function drawParts(){for(const p of parts){ctx.globalAlpha=Math.min(1,p.life/p.max*1.6);ctx.fillStyle=p.col;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.sz,p.sz);}ctx.globalAlpha=1;}
let shake=0,flashA=0,flashC='#fff';
function flash(c,a){flashC=c;flashA=Math.max(flashA,a);}

// ---------------- starfield ----------------
const STARS=[];for(let i=0;i<160;i++)STARS.push({x:rand(0,W),y:rand(0,H),z:rand(0.1,1),c:choice(['#f4f4f4','#94b0c2','#73eff7','#ffcd75','#566c86'])});
let warpFx=0;
function drawStars(speed=0.15,neb){rect(0,0,W,H,'#05060f');
 if(neb){ctx.globalAlpha=0.18;for(const n of neb){ctx.fillStyle=n.c;for(let r=n.r;r>2;r-=6){ctx.globalAlpha=0.05;ell(ctx,n.x,n.y,r,Math.round(r*0.6),n.c);}}ctx.globalAlpha=1;}
 for(const s of STARS){s.x-=s.z*(speed+warpFx*6);if(s.x<0){s.x+=W;s.y=rand(0,H);}ctx.fillStyle=s.c;if(warpFx>0.2){ctx.globalAlpha=0.7;ctx.fillRect(Math.round(s.x),Math.round(s.y),Math.round(1+s.z*warpFx*30),1);ctx.globalAlpha=1;}else ctx.fillRect(Math.round(s.x),Math.round(s.y),s.z>0.8?2:1,1);}}

// ---------------- audio ----------------
let ac=null,master,sfxG,musG,nbuf,muted=localStorage.getItem('ff_mute')==='1';
const Music={track:'menu',step:0,next:0};
function audioInit(){if(ac){if(ac.state==='suspended')ac.resume();return;}const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=new A();const comp=ac.createDynamicsCompressor();comp.connect(ac.destination);master=ac.createGain();master.gain.value=muted?0:0.5;master.connect(comp);sfxG=ac.createGain();sfxG.connect(master);musG=ac.createGain();musG.gain.value=0.28;musG.connect(master);nbuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;Music.next=ac.currentTime+0.1;}
function setMute(m){muted=m;localStorage.setItem('ff_mute',m?'1':'0');if(master)master.gain.setTargetAtTime(m?0:0.5,ac.currentTime,0.02);}
function tone(o){if(!ac)return;const n=o.at!==undefined?o.at:ac.currentTime+(o.d||0);const t=o.t||0.1,v=o.v||0.2;const os=ac.createOscillator(),g=ac.createGain();os.type=o.type||'square';os.frequency.setValueAtTime(o.f,n);if(o.f2)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),n+t);if(o.det)os.detune.value=o.det;g.gain.setValueAtTime(0.0001,n);g.gain.exponentialRampToValueAtTime(v,n+(o.a||0.004));g.gain.exponentialRampToValueAtTime(0.0001,n+t);os.connect(g);g.connect(o.dest||sfxG);os.start(n);os.stop(n+t+0.05);}
function noise(o){if(!ac)return;const n=o.at!==undefined?o.at:ac.currentTime+(o.d||0);const t=o.t||0.2;const s=ac.createBufferSource();s.buffer=nbuf;s.loop=true;const f=ac.createBiquadFilter();f.type=o.ft||'lowpass';f.frequency.setValueAtTime(o.f||1000,n);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,n+t);f.Q.value=o.q||1;const g=ac.createGain();g.gain.setValueAtTime(0.0001,n);g.gain.exponentialRampToValueAtTime(o.v||0.2,n+(o.a||0.005));g.gain.exponentialRampToValueAtTime(0.0001,n+t);s.connect(f);f.connect(g);g.connect(o.dest||sfxG);s.start(n,Math.random()*0.5);s.stop(n+t+0.05);}
const sfxLast={};function lim(k,ms){const n=performance.now();if(sfxLast[k]&&n-sfxLast[k]<ms)return false;sfxLast[k]=n;return true;}
const sfx={
 click(){if(lim('click',40))tone({type:'square',f:1400,f2:1800,t:0.04,v:0.05});},
 hover(){if(lim('hov',50))tone({type:'sine',f:900,t:0.02,v:0.03});},
 chirp(){tone({type:'sine',f:1200,f2:1700,t:0.06,v:0.08});tone({type:'sine',f:1700,f2:2200,t:0.06,v:0.06,d:0.07});},
 phaser(){tone({type:'sawtooth',f:1800,f2:900,t:0.45,v:0.07});tone({type:'square',f:1810,f2:880,t:0.45,v:0.04,det:9});},
 disruptor(){tone({type:'sawtooth',f:500,f2:200,t:0.35,v:0.09});noise({ft:'bandpass',f:900,t:0.3,v:0.12});},
 torp(){tone({type:'sine',f:300,f2:1400,t:0.3,v:0.12});noise({ft:'highpass',f:3000,t:0.25,v:0.05});},
 boom(s=1){if(!lim('boom',50))return;noise({f:900*s+300,f2:60,t:0.4+0.25*s,v:Math.min(0.6,0.3+0.2*s)});tone({type:'sine',f:110,f2:28,t:0.35+0.2*s,v:0.45});},
 bigboom(){noise({f:1600,f2:40,t:1.6,v:0.75});tone({type:'sine',f:90,f2:20,t:1.4,v:0.6});},
 shield(){tone({type:'triangle',f:600,f2:300,t:0.25,v:0.12});noise({ft:'bandpass',f:2000,t:0.2,v:0.06});},
 alert(){for(let i=0;i<3;i++){tone({type:'sawtooth',f:520,f2:780,t:0.32,v:0.07,d:i*0.38});}},
 warp(){tone({type:'sine',f:120,f2:900,t:1.1,v:0.12});noise({ft:'bandpass',f:400,f2:3000,t:1.1,v:0.1});tone({type:'sine',f:900,f2:60,t:0.4,v:0.1,d:1.1});},
 beam(){for(let i=0;i<10;i++)tone({type:'sine',f:1800+i*120+rand(-60,60),t:0.18,v:0.025,d:i*0.06});noise({ft:'highpass',f:6000,t:0.8,v:0.04});},
 hit(){if(lim('hit',40)){noise({ft:'bandpass',f:1200,t:0.1,v:0.2});tone({type:'square',f:220,f2:90,t:0.1,v:0.06});}},
 hand(){if(lim('hand',40)){tone({type:'sawtooth',f:1500,f2:1100,t:0.12,v:0.05});}},
 step(){if(lim('step',60))tone({type:'triangle',f:180,t:0.03,v:0.03});},
 pickup(){[660,880,1320].forEach((f,i)=>tone({type:'triangle',f,t:0.12,v:0.12,d:i*0.05}));},
 heal(){[523,659,784].forEach((f,i)=>tone({type:'sine',f,t:0.2,v:0.08,d:i*0.08}));},
 death(){tone({type:'square',f:400,f2:60,t:0.6,v:0.1});noise({f:800,f2:80,t:0.5,v:0.2});},
 cloak(){tone({type:'sine',f:800,f2:100,t:0.7,v:0.1});},
 coin(){tone({type:'square',f:988,t:0.06,v:0.06});tone({type:'square',f:1319,t:0.12,v:0.06,d:0.06});},
 bad(){tone({type:'square',f:200,f2:120,t:0.3,v:0.08});},
 good(){[523,784,1047].forEach((f,i)=>tone({type:'square',f,t:0.12,v:0.06,d:i*0.07}));},
 victory(){[523,659,784,1047,784,1047,1319].forEach((f,i)=>tone({type:'square',f,t:0.18,v:0.08,d:i*0.12}));},
};
const mf=n=>440*Math.pow(2,(n-69)/12);
// heroic fanfare-ish original melody (not the TV theme)
function mkTrack(bpm,roots,lead,drums,lv){const bass=[],drum=[];for(let b=0;b<4;b++)for(let i=0;i<16;i++){bass.push(i%4===0?roots[b]:i%4===2?roots[b]+7:0);drum.push(drums?(i%8===4?'s':i%8===0?'k':i%2?'h':''):(i===0?'k':''));}return{bpm,bass,lead,drum,len:64,lv,ld:3};}
const TRACKS={
 menu:mkTrack(84,[45,41,43,40],[69,0,0,0,76,0,0,0,74,0,72,0,71,0,0,0, 72,0,0,0,69,0,0,0,65,0,0,0,0,0,0,0, 67,0,0,0,74,0,0,0,72,0,71,0,69,0,0,0, 71,0,0,0,68,0,0,0,64,0,0,0,0,0,0,0],false,0.035),
 explore:mkTrack(96,[48,45,41,43],[0,0,72,0,0,0,76,0,79,0,0,0,76,0,0,0, 0,0,72,0,0,0,69,0,72,0,0,0,0,0,0,0, 0,0,69,0,0,0,72,0,77,0,0,0,76,0,74,0, 0,0,71,0,0,0,74,0,79,0,0,0,0,0,0,0],false,0.03),
 battle:mkTrack(140,[40,40,36,38],[76,0,76,79,0,76,0,74,76,0,0,0,71,0,74,0, 76,0,76,79,0,81,0,79,76,0,0,0,0,0,0,0, 72,0,72,76,0,72,0,71,72,0,0,0,67,0,71,0, 74,0,74,78,0,79,0,78,74,0,0,0,0,0,0,0],true,0.035),
 away:mkTrack(110,[43,43,39,41],[0,0,67,0,70,0,0,0,67,0,0,0,65,0,0,0, 0,0,67,0,70,0,72,0,70,0,0,0,0,0,0,0, 0,0,63,0,67,0,0,0,63,0,0,0,62,0,0,0, 0,0,65,0,69,0,70,0,65,0,0,0,0,0,0,0],true,0.028),
};
function playStep(tr,i,at){const sp=60/tr.bpm/4;const b=tr.bass[i];if(b)tone({type:'triangle',f:mf(b),t:sp*3,v:0.22,at,dest:musG});const l=tr.lead[i];if(l){tone({type:'square',f:mf(l),t:sp*tr.ld*1.4,v:tr.lv,at,dest:musG});tone({type:'triangle',f:mf(l+12),t:sp*tr.ld*1.4,v:tr.lv*0.8,at,dest:musG});}
 const d=tr.drum[i];if(d==='k')tone({type:'sine',f:150,f2:40,t:0.16,v:0.45,at,dest:musG});else if(d==='s')noise({ft:'bandpass',f:1800,q:0.7,t:0.13,v:0.16,at,dest:musG});else if(d==='h')noise({ft:'highpass',f:7000,t:0.03,v:0.05,at,dest:musG});}
setInterval(()=>{if(!ac||!Music.track||ac.state!=='running')return;const tr=TRACKS[Music.track];const sp=60/tr.bpm/4;if(Music.next<ac.currentTime-0.2)Music.next=ac.currentTime+0.02;while(Music.next<ac.currentTime+0.12){playStep(tr,Music.step,Music.next);Music.next+=sp;Music.step=(Music.step+1)%tr.len;}},25);
function setMusic(n){if(Music.track===n)return;Music.track=n;Music.step=0;if(ac)Music.next=ac.currentTime+0.05;}

// ---------------- input + immediate-mode UI ----------------
const keys={},pressed={};
addEventListener('keydown',e=>{if(!keys[e.code])pressed[e.code]=true;keys[e.code]=true;audioInit();if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault();});
addEventListener('keyup',e=>{keys[e.code]=false;});
const mouse={x:-99,y:-99,down:false,lp:false,rp:false};
addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*W;mouse.y=(e.clientY-r.top)/r.height*H;});
cv.addEventListener('mousedown',e=>{audioInit();if(e.button===0){mouse.down=true;mouse.lp=true;}if(e.button===2)mouse.rp=true;e.preventDefault();});
addEventListener('mouseup',e=>{if(e.button===0)mouse.down=false;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
const hitk=a=>a.some(k=>pressed[k]);
const inR=(x,y,w,h)=>mouse.x>=x&&mouse.x<x+w&&mouse.y>=y&&mouse.y<y+h;
let tip=null,uiBlock=false,hovered=null;
// button: returns true on click (or hotkey). opts:{col,dis,key,tip,sel}
function btn(x,y,w,h,label,o={}){const hov=!uiBlock&&inR(x,y,w,h);const dis=o.dis;const col=dis?'#333c57':o.sel?'#ffcd75':hov?(o.hcol||'#73eff7'):(o.col||'#41a6f6');
 lcars(x,y,w,h,col);txt(label,x+w/2,y+Math.round(h/2)-2,dis?'#566c86':'#0b0d17',1,'c',null);
 if(hov&&o.tip)tip=o.tip;if(hov&&hovered!==label){hovered=label;sfx.hover();}
 const clicked=!dis&&!uiBlock&&((hov&&mouse.lp)||(o.key&&hitk(o.key)));if(clicked){sfx.click();mouse.lp=false;if(o.key)for(const k of o.key)pressed[k]=false;}return clicked;}
function drawTip(){if(!tip)return;const L=wrap(tip,44);const w=Math.max(...L.map(l=>txtW(l)))+8,h=L.length*8+6;let x=clamp(mouse.x+8,2,W-w-2),y=clamp(mouse.y+10,2,H-h-2);frame9(x,y,w,h,'#ffcd75','#0b0d17');L.forEach((l,i)=>txt(l,x+4,y+4+i*8,'#f4f4f4',1,'l',null));tip=null;}
function drawCursor(){const x=Math.round(mouse.x),y=Math.round(mouse.y);if(x<0)return;ctx.fillStyle='#1a1c2c';ctx.fillRect(x,y,2,8);ctx.fillRect(x,y,6,2);ctx.fillStyle='#ffcd75';ctx.fillRect(x,y,1,6);ctx.fillRect(x,y,4,1);ctx.fillRect(x+1,y+1,2,2);}
// floating log toasts
const toasts=[];function toast(s,c='#f4f4f4'){toasts.push({s,c,t:0});if(toasts.length>5)toasts.shift();}
function drawToasts(hide){toasts.forEach((t,i)=>{t.t++;if(hide)return;ctx.globalAlpha=t.t>200?Math.max(0,(240-t.t)/40):1;const w=txtW(t.s)+6;ctx.fillStyle='#0b0d17';ctx.fillRect(Math.round(W/2-w/2),27+i*9,w,9);txt(t.s,W/2,29+i*9,t.c,1,'c');});ctx.globalAlpha=1;for(let i=toasts.length-1;i>=0;i--)if(toasts[i].t>240)toasts.splice(i,1);}
