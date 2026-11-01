const $=s=>document.querySelector(s),wait=ms=>new Promise(r=>setTimeout(r,ms)),ui=$('#app'),app=$('#app');
const KEY='tf_interview';let save=JSON.parse(localStorage.getItem(KEY)||'{"plays":0,"wins":0,"best":0}');
const store=()=>{try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}};
$('#l1').href=GAME.links.mlord;$('#l2').href=GAME.links.topfloor;
// ---- audio: chill jazz piano + clean guitar, synthesised (no files) ----
let ac,master,bus,on=true;const B=.8333,mf=m=>440*2**((m-69)/12);
const CH=[{b:38,c:[53,57,60,64]},{b:43,c:[53,59,64,69]},{b:36,c:[55,59,62,64]},{b:45,c:[55,60,64,71]}];
function initAudio(){if(ac){ac.resume();return}ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=on?.55:0;master.connect(ac.destination);bus=ac.createGain();bus.connect(master);
const cv=ac.createConvolver(),n=ac.sampleRate*2.2|0,bf=ac.createBuffer(2,n,ac.sampleRate);for(let c=0;c<2;c++){const d=bf.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3)}
cv.buffer=bf;const w=ac.createGain();w.gain.value=.4;bus.connect(w);w.connect(cv);cv.connect(master);bar(0)}
function tone(fr,d,ty='sine',v=.15,t=0){if(!ac||!on)return;const o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime+t;o.type=ty;o.frequency.value=fr;g.gain.setValueAtTime(.0001,n);g.gain.linearRampToValueAtTime(v,n+.012);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(bus);o.start(n);o.stop(n+d+.05)}
const ep=(f,d,v,t)=>{tone(f,d,'sine',v,t);tone(f*2,d*.5,'sine',v*.3,t);tone(f*4.01,.25,'sine',v*.08,t)};
const gt=(f,d,v,t)=>{tone(f,d,'triangle',v,t);tone(f*2,d*.4,'sine',v*.4,t)};
function bar(k){if(on&&ac.state=='running'){const h=CH[k%4];
h.c.forEach((m,i)=>{ep(mf(m),3,.05,i*.03);ep(mf(m),1.2,.035,2.5*B+i*.03)});
tone(mf(h.b),1.3,'sine',.17);tone(mf(h.b),.9,'sine',.12,2*B);tone(mf(h.b+7),.6,'sine',.1,3.5*B);
[0,2,1,3,2,1,3,2].forEach((x,i)=>{if(Math.random()<.7)gt(mf(h.c[x]+12),.9,.05,i*B/2)});
if(Math.random()<.6)ep(mf(h.c[3]+12),1.6,.05,3*B)}
setTimeout(()=>bar(k+1),B*4000)}
const blip=()=>tone(520+Math.random()*80,.04,'square',.03),good=()=>[523,659,784].forEach((f,i)=>tone(f,.3,'triangle',.15,i*.1)),bad=()=>[300,220,150].forEach((f,i)=>tone(f,.35,'sawtooth',.12,i*.15)),ding=()=>tone(1318,.8,'sine',.2),step=()=>tone(90,.08,'triangle',.2);
$('#snd').onclick=e=>{e.stopPropagation();on=!on;if(master)master.gain.value=on?.55:0;$('#snd').textContent=on?'🔊':'🔇'};
// ---- characters (SVG) ----
function person(o){const h=o.b?'':`<path d="M27 48Q27 18 50 20Q73 18 73 48Q62 32 50 34Q38 32 27 48Z" fill="${o.hair}"/>`+(o.long?`<rect x="26" y="40" width="9" height="42" rx="4" fill="${o.hair}"/><rect x="65" y="40" width="9" height="42" rx="4" fill="${o.hair}"/>`:'');
return `<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg"><path d="M14 200L22 90Q50 72 78 90L86 200Z" fill="${o.suit}" stroke="#d4af3755"/><path d="M40 82L60 82L50 128Z" fill="#f2f2f2"/><path d="M47 88h6l3 36-6 10-6-10z" fill="${o.tie}"/><path d="M40 82L50 128L34 100zM60 82L50 128L66 100z" fill="#0004"/><rect x="43" y="66" width="14" height="18" fill="${o.skin}"/>${o.long?h:''}<ellipse cx="50" cy="48" rx="22" ry="26" fill="${o.skin}"/><ellipse cx="50" cy="48" rx="22" ry="26" fill="#ff2d55" opacity=".3"/>${o.long?'':h}<circle cx="41" cy="48" r="2.2" fill="#111"/><circle cx="59" cy="48" r="2.2" fill="#111"/>${o.g?'<g fill="none" stroke="#d4af37" stroke-width="1.6"><circle cx="41" cy="48" r="6"/><circle cx="59" cy="48" r="6"/><path d="M47 48h6"/></g>':''}${o.s?'<path d="M40 61Q50 57 60 61Q50 64 40 61Z" fill="#222"/>':''}<path d="M43 66Q50 70 57 66" stroke="#733" fill="none" stroke-width="1.6"/>${o.sg?'<g fill="#05050a"><circle cx="41" cy="48" r="6.5"/><circle cx="59" cy="48" r="6.5"/><rect x="46" y="47" width="8" height="2"/></g>':''}${o.hat?'<path d="M29 36Q29 10 50 10Q71 10 71 36Z" fill="#0a0a14"/><rect x="18" y="33" width="64" height="5" rx="2" fill="#0a0a14"/>':''}${o.pin?'<circle cx="32" cy="104" r="3" fill="#d4af37"/>':''}${o.case?'<rect x="64" y="150" width="34" height="26" rx="3" fill="#3a2410" stroke="#d4af37"/><rect x="76" y="146" width="10" height="5" fill="none" stroke="#d4af37"/>':''}</svg>`}
// ---- engine ----
let _n=0;
// Side-view seated character, drawn as SVG in a neon-noir style. Faces right; pass fl=1 to face left.
function fig(o,fl){const id='g'+_n++,f=o.long,H='M78 40Q82 16 108 16Q130 20 132 44L138 56L146 70L136 74L138 82Q140 86 136 88L136 94Q138 100 130 108L116 112Q96 108 84 96Q74 80 78 40Z',A=`<ellipse cx="198" cy="216" rx="14" ry="10" fill="${o.skin}"/><ellipse cx="198" cy="216" rx="14" ry="10" fill="#ff2d55" opacity=".3"/>`;
return `<div class="fl" ${fl?'style="transform:scaleX(-1)"':''}><svg viewBox="0 0 220 240" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}"><stop offset="0" stop-color="#3b0d45"/><stop offset=".6" stop-color="${o.skin}"/><stop offset="1" stop-color="#ffb8a8"/></linearGradient></defs>
<path d="M98 100h24v34q-12 8-24 0z" fill="${o.skin}"/><path d="M98 100h24v34q-12 8-24 0z" fill="#3b0d45" opacity=".5"/>
<path d="M40 240Q38 160 68 134Q100 120 130 130Q150 140 152 172L154 240Z" fill="${o.suit}"/><path d="M68 134Q100 120 130 130Q150 140 152 172L154 240" fill="none" stroke="#ff3d6e" stroke-width="2.5"/><path d="M40 240Q38 160 68 134" fill="none" stroke="#5a7bff" stroke-width="2"/>
${f?'':`<path d="M112 128L132 132L124 152Z" fill="#eee"/><path d="M124 140l8 6-4 30-6-6z" fill="${o.tie}"/>`}${o.coat?'<path d="M104 128L136 132L122 170L96 146Z" fill="#1c1c4a" stroke="#ff3d6e" stroke-width="1.5"/>':''}${o.pin?'<circle cx="118" cy="162" r="3" fill="#d4af37"/>':''}
<path d="M92 176Q70 200 96 212L192 206L194 226L100 232Q60 232 62 196Z" fill="${o.suit}" stroke="#ff3d6e66"/>${o.case?'<rect x="108" y="212" width="52" height="28" rx="4" fill="#3a2410" stroke="#d4af37"/>':''}<rect x="176" y="206" width="8" height="22" fill="#eee"/>${A}
<path d="${H}" fill="url(#${id})"/><path d="${H}" fill="#ff2d55" opacity=".25"/>
${o.hat?'':o.b?'':f?`<path d="M72 102L68 42Q72 6 112 8Q140 10 136 46L134 58Q120 38 102 42Q96 70 100 102Z" fill="${o.hair}"/><path d="M104 22L138 26L136 40L104 36Z" fill="${o.hair}"/>`:`<path d="M78 46Q78 12 108 14Q134 16 132 42Q112 26 96 34Q86 40 84 60Q76 58 78 46Z" fill="${o.hair}"/>`}
${o.sg?'<circle cx="123" cy="52" r="7.5" fill="#05050a"/><path d="M116 52L88 50" stroke="#05050a" stroke-width="2"/>':o.g?'<circle cx="123" cy="52" r="7" fill="none" stroke="#d4af37" stroke-width="1.6"/><path d="M116 52L88 50" stroke="#d4af37"/><path d="M119 52l8-2-1 4z" fill="#fff"/>':'<path d="M117 53l12-3-1 6z" fill="#fff"/>'}
${o.s?`<path d="M128 79Q138 75 143 77Q137 83 128 82Z" fill="${o.hair}"/>`:''}${f?'<path d="M134 84Q140 83 141 86Q139 90 133 88Z" fill="#d41e4e"/>':'<path d="M131 87L138 85" stroke="#511" stroke-width="1.6"/>'}
${o.hat?'<path d="M82 38Q84 6 110 8Q132 10 130 38Z" fill="#0a0a14"/><ellipse cx="108" cy="38" rx="42" ry="7" fill="#0a0a14" stroke="#ff3d6e88"/><path d="M84 32h46v5H84z" fill="#d4af3799"/>':''}</svg></div>`}
const tap=()=>new Promise(r=>{const f=()=>{ui.removeEventListener('click',f);r()};ui.addEventListener('click',f)});
async function say(n,t,noWait){$('#ans').innerHTML='';const bu=$('#bubble');bu.style.opacity=1;bu.className=n=='Visitor'?'l':'r';$('#name').textContent=n;const el=$('#txt');el.textContent='';let sk=false;const h=()=>sk=true;ui.addEventListener('click',h);
for(let i=1;i<=t.length&&!sk;i++){el.textContent=t.slice(0,i);if(i%3==0)blip();await wait(20)}el.textContent=t;ui.removeEventListener('click',h);if(!noWait){await wait(120);el.textContent+=' ▼';await tap()}}
function ask(opts){return new Promise(r=>{const a=$('#ans');a.innerHTML='';opts.forEach((o,i)=>{const b=document.createElement('button');b.innerHTML='<b></b><span></span>';b.firstChild.textContent='ABC'[i];b.lastChild.textContent=o.t;b.onclick=e=>{e.stopPropagation();a.innerHTML='';r(o)};a.appendChild(b)})})}
const fade=async(on)=>{$('#fade').classList.toggle('on',on);await wait(750)};
const anim=(el,c)=>{el.classList.remove(c);void el.offsetWidth;el.classList.add(c)};
function pips(n){$('#prog').innerHTML=GAME.floors.map((_,i)=>`<span class="pip ${i<n?'on':''} ${i==n?'cur':''}"></span>`).join('')}
function screen(h,btn,cls=''){const s=$('#screen');s.innerHTML=h;s.className='show '+cls;if(btn){const b=document.createElement('button');b.textContent=btn;b.onclick=()=>{s.classList.remove('show');title()};s.appendChild(b)}}
function reset(){app.classList.remove('intro');$('#boss').className='ch hide';$('#me').className='ch hide';$('#me').style.left='0%';$('#ans').innerHTML='';$('#txt').textContent='';$('#name').textContent=''}
function title(){reset();pips(-1);$('#props').textContent='🎰🎹🎷';$('#bg').style.setProperty('--c1','#1a1608');
screen(`<p style="letter-spacing:6px;color:#d4af37">TOP FLOOR PRESENTS</p><h1>THE TOP FLOOR</h1><p style="letter-spacing:8px">THE INTERVIEW</p><p>Eight floors. Eight bosses. One job.<br><small>Best floor: ${save.best}/8 · Hired: ${save.wins}</small></p>`,'ENTER THE BUILDING','title');new Image().src='img/banner.webp';
$('#screen button').onclick=()=>{initAudio();$('#screen').classList.remove('show');intro()}}
async function intro(){reset();app.classList.add('intro');pips(-1);const b=$('#bg');b.style.setProperty('--c1','#2a2218');$('#lamp').style.setProperty('--ac','#d4af37');$('#props').textContent='🎰🎹🎷';
$('#boss').innerHTML=fig(GAME.receptionist,1);$('#me').innerHTML=fig(GAME.player);$('#me').style.transition='none';$('#me').style.left='-60%';$('#me').className='ch';await fade(false);
$('#boss').className='ch';await wait(300);$('#me').style.transition='left 3.5s linear';$('#me').classList.add('walk');$('#me').style.left='0%';
const st=setInterval(step,450);await wait(3600);clearInterval(st);$('#me').classList.remove('walk');ding();
for(const[n,t]of GAME.intro)await say(n,t);
$('#bubble').style.opacity=0;$('#me').classList.add('walk');$('#me').style.transition='left 2.5s linear';$('#me').style.left='41%';const s2=setInterval(step,450);await wait(2600);clearInterval(s2);
$('#me').style.opacity=0;await wait(800);tone(110,.6,'triangle',.3);await fade(true);play()}
let chance=1,rep=0;
async function second(f){for(const l of f.fail)await say(f.boss,l);ding();for(const l of GAME.retry)await say('The CEO',l);rep=1}
async function play(){chance=1;rep=0;save.plays++;store();
for(let i=0;i<GAME.floors.length;i++){const f=GAME.floors[i];reset();pips(i);await fade(true);
$('#bg').style.setProperty('--c1',f.c1);$('#lamp').style.setProperty('--ac',f.ac);$('#props').textContent=f.props;$('#boss').innerHTML=fig(f.look,1);$('#me').innerHTML=fig({...GAME.player,case:0});$('#me').style.opacity='';
screen(`<p style="color:${f.ac};letter-spacing:5px">FLOOR ${i+1}</p>${rep?'<p style="color:#e0453a;letter-spacing:4px">YOUR LAST CHANCE</p>':''}<h1>${f.name.toUpperCase()}</h1>`);ding();await wait(2000);$('#screen').classList.remove('show');await fade(false);
$('#boss').classList.remove('hide');await wait(500);$('#me').classList.remove('hide');await wait(500);
await say(f.boss,f.intro);
let failed=0;
for(const q of f.qs){await say(f.boss,q.q,true);const c=await ask(q.a);await say(f.boss,c.r);
if(c.ok){good();anim($('#boss'),'nod')}else{bad();anim($('#boss'),'shake');if(chance>0){chance--;await second(f);failed=1;break}return lose(f,i)}}
if(failed){i--;continue}rep=0;
save.best=Math.max(save.best,i+1);store();
if(i<7){await say(f.boss,f.pass);if(i==0){good();await say('HR','PROMOTION: Junior Trading Broker (provisional). Survive all floors to keep it.')}}}
win()}
async function lose(f,i){for(const l of f.fail)await say(f.boss,l);anim($('#me'),'shake');await fade(true);
screen(`<h1 class="red">${i?"YOU'RE FIRED":'SENT HOME'}</h1><p>${f.fire}</p><p><small>Your one last chance is gone. Back to the beginning.</small></p><p><small>Reached floor ${i+1} of 8</small></p>`,'TRY AGAIN');await fade(false)}
async function win(){const f=GAME.floors[7];for(const l of GAME.win)await say(f.boss,l);
$('#boss').classList.add('stand');await wait(1300);$('#me').style.transition='left 1.5s';$('#me').style.left='30%';$('#boss').style.right='24%';await wait(1600);good();
await say('The Chairman','*firm handshake*');save.wins++;save.best=8;store();await fade(true);
screen(`<h1>CONGRATULATIONS.<br>YOU MADE IT TO THE TOP FLOOR.</h1><p>Welcome to the company. Please do not use the elevator. It's still broken.</p>`,'PLAY AGAIN');await fade(false);$('#boss').style.right=''}
title();$('#fade').classList.remove('on');
