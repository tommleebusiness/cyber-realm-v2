
(function(){
"use strict";

// AUTH
var curUser=null;
var users={};
try{users=JSON.parse(localStorage.getItem("cr_users")||"{}");}catch(e){}
function saveUsers(){localStorage.setItem("cr_users",JSON.stringify(users));}
function hsh(p){var h=0;for(var i=0;i<p.length;i++){h=((h<<5)-h)+p.charCodeAt(i);h|=0;}return h.toString(36);}
function id(s){return document.getElementById(s);}

// GAME STATE
var S={c:0,ct:0,n:0,d:0,e:0,g:0,cl:0,bs:0,pr:0,pp:0,cp:1,ps:0,ns:0,ds:0,es:0,gm:1,dm:1,rl:1,rp:0,rg:100,up:{},ac:[],cb:null,bh:0,lastSave:Date.now()};
var RN=["Digital Nexus","Neon Grid","Quantum Core","Cyber Hive","Dark Matrix","Void Sector","Infinite Loop","Omega Realm","Alpha Singularity","Cyber Eden","Neural Net","Phantom Zone","Binary Storm","Chrome Void","Data Ocean","Void Core"];
var UPG=[
  {n:"Neural Link",d:"+1 tap",cb:10,fn:function(){S.cp+=1},mx:100},
  {n:"Laser Focus",d:"+5 taps",cb:100,fn:function(){S.cp+=5},mx:50},
  {n:"Plasma Core",d:"+25 taps",cb:1000,fn:function(){S.cp+=25},mx:30},
  {n:"Nano Bot",d:"+0.5/s",cb:50,fn:function(){S.ps+=0.5},mx:50},
  {n:"Drone Swarm",d:"+2/s",cb:200,fn:function(){S.ps+=2},mx:30},
  {n:"AI Core",d:"+10/s",cb:1000,fn:function(){S.ps+=10},mx:20},
  {n:"Quantum Farm",d:"+50/s",cb:5000,fn:function(){S.ps+=50},mx:15},
  {n:"Dark Matter",d:"+200/s",cb:25000,fn:function(){S.ps+=200},mx:10},
  {n:"Compressor",d:"x1.5 all",cb:250,fn:function(){S.gm*=1.5},mx:5},
  {n:"Entropy",d:"x2 all",cb:2500,fn:function(){S.gm*=2},mx:3},
  {n:"Solar Panel",d:+1+"/tap",cb:30,fn:function(){S.ns+=1},mx:20},
  {n:"Data Miner",d:"+1 /tap",cb:25,fn:function(){S.ds+=1},mx:20},
  {n:"Encryptor",d:"x2 data",cb:300,fn:function(){S.dm*=2},mx:5},
  {n:"Chaos Inject",d:"+1 /tap",cb:500,fn:function(){S.es+=1},mx:10},
  {n:"Void Crystal",d:"+5 tap +2/s",cb:10000,fn:function(){S.cp+=5;S.ps+=2},mx:5}
];
var BS=[
  {n:"Glitch Phantom",hp:100,cr:50,ic:"G"},
  {n:"Firewall Golem",hp:500,cr:200,ic:"F"},
  {n:"Virus Swarm",hp:2000,cr:800,ic:"V"},
  {n:"Data Kraken",hp:8000,cr:3000,ic:"D"},
  {n:"Quantum Dragon",hp:30000,cr:12000,ic:"Q"},
  {n:"Neural Overlord",hp:100000,cr:50000,ic:"N"},
  {n:"Void Emperor",hp:500000,cr:200000,ic:"E"},
  {n:"Omega Singularity",hp:2e6,cr:1e6,ic:"O"}
];
var ACHS=[
  {id:"a1",n:"First Tap",ck:function(){return S.cl>=1}},
  {id:"a2",n:"Clicker",ck:function(){return S.cl>=100}},
  {id:"a3",n:"Rich",ck:function(){return S.ct>=1e4}},
  {id:"a4",n:"Boss Slayer",ck:function(){return S.bs>=1}},
  {id:"a5",n:"Hunter",ck:function(){return S.bs>=10}},
  {id:"a6",n:"Realm Walker",ck:function(){return S.rl>=10}},
  {id:"a7",n:"Prestige",ck:function(){return S.pr>=1}},
  {id:"a8",n:"Speed Demon",ck:function(){return getCPS()>=100}},
  {id:"a9",n:"Collector",ck:function(){return Object.keys(S.up).length>=10}},
  {id:"a10",n:"Master",ck:function(){return S.rl>=25}},
  {id:"a11",n:"Billionaire",ck:function(){return S.ct>=1e9}},
  {id:"a12",n:"Legend",ck:function(){return S.pr>=5}}
];

function getCPS(){return Math.floor(S.ps*S.gm);}
function fmt(n){if(n>=1e12)return(n/1e12).toFixed(1)+"T";if(n>=1e9)return(n/1e9).toFixed(1)+"B";if(n>=1e6)return(n/1e6).toFixed(1)+"M";if(n>=1e4)return(n/1e3).toFixed(1)+"K";return Math.floor(n);}

// SCREEN MANAGEMENT
function showScreen(s){
  id("login-scr").style.display="none";
  id("game-scr").style.display="none";
  id("chat-scr").classList.remove("show");
  if(s==="login")id("login-scr").style.display="flex";
  else if(s==="game")id("game-scr").style.display="flex";
  else if(s==="chat"){id("chat-scr").classList.add("show");id("game-scr").style.display="flex";}
  else if(s==="up"||s==="bo"||s==="ac"||s==="qu"||s==="sh"||s==="st"){id("game-scr").style.display="flex";showPanel(true);curTab=s;renderPanel();}
}

function showPanel(show){
  if(show)id("panel").classList.add("show");
  else id("panel").classList.remove("show");
}

// AUTH HANDLERS
id("alogin").onclick=function(){
  var u=id("au").value.trim(),p=id("ap").value;
  if(!u||!p){amsg("Fill all fields","err");return;}
  if(!users[u]){amsg("User not found","err");return;}
  if(users[u].pass!==hsh(p)){amsg("Wrong password","err");return;}
  curUser=u;users[u].lastLogin=Date.now();saveUsers();loadGame();showScreen("game");amsg("","");
};

id("areg").onclick=function(){
  var u=id("au").value.trim(),p=id("ap").value;
  if(!u||!p){amsg("Fill all fields","err");return;}
  if(u.length<3){amsg("Min 3 chars","err");return;}
  if(p.length<4){amsg("Min 4 chars password","err");return;}
  if(users[u]){amsg("Username taken","err");return;}
  users[u]={pass:hsh(p),created:Date.now(),lastLogin:Date.now()};saveUsers();
  curUser=u;initNewGame();showScreen("game");amsg("Account created!","ok");
};

id("lout").onclick=function(){saveGame();curUser=null;showScreen("login");};
id("cChat").onclick=function(){showScreen("game");};

// GAME MECHANICS
function initNewGame(){S={c:0,ct:0,n:0,d:0,e:0,g:0,cl:0,bs:0,pr:0,pp:0,cp:1,ps:0,ns:0,ds:0,es:0,gm:1,dm:1,rl:1,rp:0,rg:100,up:{},ac:[],cb:null,bh:0,lastSave:Date.now()};}
function loadGame(){
  if(!curUser)return;
  try{var saves=JSON.parse(localStorage.getItem("cr_saves")||"{}");var d=saves[curUser];if(d){var v=JSON.parse(d);for(var k in v)S[k]=v[k];}}catch(e){}
}
function saveGame(){
  if(!curUser)return;S.lastSave=Date.now();
  var saves={};try{saves=JSON.parse(localStorage.getItem("cr_saves")||"{}");}catch(e){}
  saves[curUser]=JSON.stringify(S);localStorage.setItem("cr_saves",JSON.stringify(saves));
  localStorage.setItem("cr_lastUser",curUser);
}

// TAP
var tpBtn=id("tpbtn");
function doTap(){
  var v=Math.floor(S.cp*S.gm);
  S.c+=v;S.ct+=v;S.cl++;S.rp+=v;S.n+=S.ns;S.d+=S.ds*S.dm;S.e+=S.es;
  id("tp-info").textContent="+"+fmt(v);
  tpBtn.style.transform="scale(.9)";
  setTimeout(function(){tpBtn.style.transform="scale(1)"},100);
  if(S.cb&&S.bh>0){S.bh-=v;if(S.bh<=0)winBoss();}
  while(S.rp>=S.rg){S.rp-=S.rg;S.rl++;S.rg=Math.floor(S.rg*1.4);S.cp+=Math.ceil(S.rl*0.5);S.ps+=S.rl*0.3;lvlUp(S.rl);}
  if(!S.cb&&S.rl>=5&&Math.random()<0.01)spawnBoss();
  chkAch();flyText("+"+fmt(v));draw();
}
tpBtn.addEventListener("touchstart",function(e){e.preventDefault();doTap();},{passive:false});
tpBtn.addEventListener("mousedown",function(e){e.preventDefault();doTap();});

function spawnBoss(){var i=Math.min(Math.floor(S.rl/5),BS.length-1);S.cb=BS[i];S.bh=S.cb.hp;showBoss();}
function winBoss(){var r=Math.floor(S.cb.cr*S.gm);S.c+=r;S.bs++;flyText("+ "+fmt(r));S.cb=null;S.bh=0;chkAch();hideBoss();}
function lvlUp(lv){dlg("REALM UP!","Realm level "+lv+" — "+RN[Math.min(lv-1,RN.length-1)],[{t:"OK",f:function(){hdlg();}}]);}
function chkAch(){for(var i=0;i<ACHS.length;i++){var a=ACHS[i];if(S.ac.indexOf(a.id)<0&&a.ck()){S.ac.push(a.id);S.g+=10;}}}
function showBoss(){id("bfight").classList.add("show");id("bfs").textContent=S.cb.ic;id("bfn").textContent=S.cb.n;updateBossHP();}
function hideBoss(){id("bfight").classList.remove("show");}
function updateBossHP(){var pct=Math.max(0,(S.bh/S.cb.hp)*100);id("bf-hp").style.width=pct+"%";id("bf-text").textContent="HP: "+fmt(S.bh)+" / "+fmt(S.cb.hp);}
id("bf-atk").onclick=function(){var v=Math.floor(S.cp*S.gm);S.bh-=v;S.rp+=v;S.c+=v;S.ct+=v;S.n+=S.ns;S.d+=S.ds*S.dm;S.e+=S.es;var d=document.createElement("div");d.className="fdmg";d.textContent="-"+fmt(v);d.style.left=(30+Math.random()*40)+"%";d.style.top="30%";id("bfight").appendChild(d);setTimeout(function(){d.remove();},800);if(S.bh<=0)winBoss();else updateBossHP();while(S.rp>=S.rg){S.rp-=S.rg;S.rl++;S.rg=Math.floor(S.rg*1.4);S.cp+=Math.ceil(S.rl*0.5);S.ps+=S.rl*0.3;}draw();};

function draw(){
  id("rc").textContent=fmt(S.c);id("rn").textContent=fmt(S.n);
  id("rd").textContent=fmt(S.d);id("re").textContent=fmt(S.e);
  id("rcR").textContent=getCPS()>0?"+"+fmt(getCPS())+"/s":"";
  id("cps").textContent="per sec: "+fmt(getCPS())+" | taps: "+fmt(S.cl);
  id("prog-fi").style.width=Math.min(100,(S.rp/S.rg)*100)+"%";
  id("prog-t").textContent="Realm Lv."+S.rl+" — "+RN[Math.min(S.rl-1,RN.length-1)];
  id("uname").textContent=curUser||"";
}
function flyText(t){var p=document.createElement("div");p.className="pt";p.textContent=t;p.style.left=(30+Math.random()*40)+"%";p.style.top="40%";id("parts").appendChild(p);setTimeout(function(){p.remove();},800);}

// PANEL
var curTab="up";
id("cPan").onclick=function(){showPanel(false);};
id("ptabs").addEventListener("click",function(e){var t=e.target.closest(".ptab");if(!t)return;document.querySelectorAll(".ptab").forEach(function(x){x.classList.remove("on");});t.classList.add("on");curTab=t.dataset.t;renderPanel();});

function renderPanel(){
  var p=id("pc");p.innerHTML="";
  if(curTab==="up")renderUpgrades(p);
  else if(curTab==="bo")renderBosses(p);
  else if(curTab==="ac")renderAchievements(p);
  else if(curTab==="qu")renderQuests(p);
  else if(curTab==="sh")renderShop(p);
  else if(curTab==="st")renderStats(p);
}

function renderUpgrades(p){
  document.getElementById("panT").textContent="Upgrades";
  for(var i=0;i<UPG.length;i++){
    var u=UPG[i],o=S.up[i]||0,mx=o>=u.mx,cost=Math.floor(u.cb*Math.pow(1.15,o)),ok=S.c>=cost&&!mx;
    var cl="card"+(ok?" can":"")+(mx?" done":"");
    p.innerHTML+='<div class="'+cl+'" data-i="'+i+'"><div class="h"><span class="nm">'+u.n+'</span><span class="lv">'+o+'/'+u.mx+'</span></div><div class="d">'+u.d+'</div><div class="c">'+(mx?"MAX":fmt(cost))+'</div></div>';
  }
  p.querySelectorAll(".card").forEach(function(el){
    el.onclick=function(){if(el.classList.contains("done"))return;var i=parseInt(el.dataset.i),u=UPG[i],o=S.up[i]||0,cost=Math.floor(u.cb*Math.pow(1.15,o));if(S.c<cost)return;S.c-=cost;S.up[i]=o+1;u.fn();chkAch();renderPanel();draw();};
  });
}

function renderBosses(p){
  document.getElementById("panT").textContent="Bosses";
  if(!S.cb){
    p.innerHTML='<div class="sec">Bosses</div><p style="color:#777;font-size:11px">Reach Realm Lv.5+ to encounter bosses!</p><button class="atk-btn" id="sb">Summon Boss</button>';
    id("sb").onclick=function(){spawnBoss();showPanel(false);};
  }else{
    var pct=Math.max(0,(S.bh/S.cb.hp)*100);
    p.innerHTML='<div class="boss"><div class="bn">'+S.cb.ic+" "+S.cb.n+'</div><div class="hp"><div class="hp-f" style="width:'+pct+'%"></div></div><div class="st"><span>HP: '+fmt(S.bh)+" / "+fmt(S.cb.hp)+'</span></div><div class="rw">Reward: '+fmt(S.cb.cr)+'</div></div><button class="atk-btn" id="ab">ATTACK</button>';
    id("ab").onclick=function(){var v=Math.floor(S.cp*S.gm);S.bh-=v;S.rp+=v;S.c+=v;S.ct+=v;S.n+=S.ns;S.d+=S.ds*S.dm;S.e+=S.es;if(S.bh<=0)winBoss();else renderBosses(id("pc"));draw();};
  }
}

function renderAchievements(p){
  document.getElementById("panT").textContent="Achievements ("+S.ac.length+"/"+ACHS.length+")";
  for(var i=0;i<ACHS.length;i++){
    var a=ACHS[i],done=S.ac.indexOf(a.id)>=0;
    p.innerHTML+='<div class="ach'+(done?' done':'')+'"><span class="ic">'+(done?"OK":a.id)+'</span><div class="inf"><div class="an">'+a.n+'</div></div>'+(done?'<span class="ar">Done</span>':'<span class="ar">+10 gems</span>')+'</div>';
  }
}

function renderQuests(p){
  document.getElementById("panT").textContent="Quests";
  for(var i=0;i<S.quests.length;i++){
    var q=S.quests[i],done=q.ck();
    p.innerHTML+='<div class="card'+(done?' done':'')+'"><div class="h"><span class="nm">'+q.n+'</span>'+(done?'<span class="lv">OK</span>':'')+'</div><div class="d">'+q.d+'</div>'+(done?'<button data-qid="'+q.id+'">Claim '+q.rw+' gems</button>':'')+'</div>';
  }
  p.querySelectorAll("[data-qid]").forEach(function(b){
    b.onclick=function(){var q=S.quests.find(function(x){return x.id===b.dataset.qid});if(!q||!q.ck())return;S.g+=q.rw;S.quests=S.quests.filter(function(x){return x.id!==q.id;});renderPanel();draw();};
  });
}

function renderShop(p){
  document.getElementById("panT").textContent="Shop";
  p.innerHTML='<div class="shop"><div class="sn">Starter Pack</div><div class="sd">100 Gems</div><div class="sp">$0.99</div><button data-g="100">Buy</button></div><div class="shop"><div class="sn">Pro Pack</div><div class="sd">500 Gems + x2/h</div><div class="sp">$2.99</div><button data-g="500">Buy</button></div><div class="shop"><div class="sn">VIP</div><div class="sd">x1.5 forever + 1000 gems</div><div class="sp">$19.99</div><button data-g="1000">Buy</button></div>';
  p.querySelectorAll("[data-g]").forEach(function(b){b.onclick=function(){S.g+=parseInt(b.dataset.g);flyText("+ "+parseInt(b.dataset.g)+" gems");draw();};});
}

function renderStats(p){
  document.getElementById("panT").textContent="Stats";
  var rows=[["User",curUser],["Taps",fmt(S.cl)],["Total Credits",fmt(S.ct)],["Realm Level",S.rl],["Bosses Slain",S.bs],["Prestige",S.pr],["Gems",S.g],["Tap Power",fmt(S.cp)],["Income/sec",fmt(getCPS())]];
  rows.forEach(function(r){p.innerHTML+='<div class="strow"><span class="sl">'+r[0]+'</span><span class="sv">'+r[1]+'</span></div>';});
  p.innerHTML+='<button class="btn" id="prBtn">Prestige</button>';
  p.innerHTML+='<button class="btn2" id="exBtn">Export</button>';
  p.innerHTML+='<button class="btn2" id="imBtn">Import</button>';
  p.innerHTML+='<button class="danger" id="delBtn">Delete All</button>';
  id("prBtn").onclick=function(){var pts=Math.floor(Math.sqrt(S.ct/1e6)+S.rl*0.5);if(pts<1)return;dlg("Prestige","Reset for "+pts+" pts?\nBonus: +"+Math.floor(pts*10)+"% tap",[{t:"Cancel",f:function(){hdlg();}},{t:"Prestige!",f:function(){doPrestige();}}]);};
  id("exBtn").onclick=function(){prompt("Copy save code:",btoa(JSON.stringify(S)));};
  id("imBtn").onclick=function(){var d=prompt("Paste save code:");if(!d)return;try{Object.assign(S,JSON.parse(atob(d)));saveGame();showPanel(false);draw();}catch(e){alert("Invalid code");}};
  id("delBtn").onclick=function(){dlg("Delete ALL?","Cannot undo!",[{t:"Cancel",f:function(){hdlg();}},{t:"DELETE",f:function(){localStorage.clear();location.reload();}}]);};
}

function doPrestige(){
  var pts=Math.floor(Math.sqrt(S.ct/1e6)+S.rl*0.5);
  if(pts<1){hdlg();return;}
  S.pr++;S.pp+=pts;S.c=0;S.ct=0;S.n=0;S.d=0;S.e=0;S.cl=0;
  S.cp=1+S.pp*0.1;S.ps=0;S.gm=1;S.dm=1;S.ns=0;S.ds=0;S.es=0;
  S.rl=1;S.rp=0;S.rg=100;S.up={};S.cb=null;S.bh=0;
  hdlg();showPanel(false);draw();
}

function dlg(t,p,bs){id("ovt").textContent=t;id("ovp").textContent=p;id("ovb").innerHTML="";for(var i=0;i<bs.length;i++){var b=document.createElement("button");b.textContent=bs[i].t;b.onclick=bs[i].f;id("ovb").appendChild(b);}id("ov").classList.add("show");}
function hdlg(){id("ov").classList.remove("show");}

function amsg(m,t){var e=id("amsg");e.textContent=m;e.className="msg "+(t||"");}

// CHAT
var chatTab="g",chatMsgs=[];
try{chatMsgs=JSON.parse(localStorage.getItem("cr_chat")||"[]");}catch(e){}
function saveChat(){localStorage.setItem("cr_chat",JSON.stringify(chatMsgs.slice(-200)));}
function addChatMsg(author,text){chatMsgs.push({a:author,t:text,ts:Date.now()});saveChat();renderChat();}

function owlReply(text){
  var L=text.toLowerCase(),r="";
  if(L.indexOf("boss")>=0){
    var bn=["Void","Nebula","Quasar","Pulsar","Dark","Phantom"];
    var bi=["V","N","Q","P","D","H"];
    var i=Math.floor(Math.random()*bn.length);
    var hp=Math.floor(5e4*Math.pow(1.8,BS.length));
    BS.push({n:bn[i]+" Overlord",hp:hp,cr:Math.floor(hp*.4),ic:bi[i]});
    r="Boss created! "+bn[i]+" Overlord | HP: "+fmt(hp)+" | Reward: "+fmt(Math.floor(hp*.4))+" | Total: "+BS.length;
  }
  else if(L.indexOf("upgrade")>=0||L.indexOf("improve")>=0){
    var un=["Quantum Accelerator","Neural Amplifier","Plasma Injector","Vacuum Pump"];
    var i=Math.floor(Math.random()*un.length);
    var c=Math.floor(100*Math.pow(2,UPG.length));
    UPG.push({n:un[i],d:"+10% income",cb:c,fn:function(){S.gm*=1.1},mx:3});
    r="Upgrade added! "+un[i]+" | Cost: "+fmt(c)+" | Total: "+UPG.length;
  }
  else if(L.indexOf("credit")>=0||L.indexOf("money")>=0){
    var a=500+Math.floor(Math.random()*2000);S.c+=a;S.ct+=a;
    r="Added "+fmt(a)+" credits! Balance: "+fmt(S.c);
  }
  else if(L.indexOf("level")>=0||L.indexOf("realm")>=0){
    var lv=1+Math.floor(Math.random()*3);S.rl+=lv;
    r="Realm level +"+lv+"! Current: "+S.rl;
  }
  else if(L.indexOf("gem")>=0||L.indexOf("premium")>=0){
    var g=20+Math.floor(Math.random()*80);S.g+=g;
    r="Added "+g+" gems! Balance: "+S.g;
  }
  else if(L.indexOf("fix")>=0||L.indexOf("bug")>=0){
    S.c+=1e3;S.g+=50;S.cp+=5;
    r="Bugs fixed! Bonus: +1000 credits +50 gems +5 tap";
  }
  else if(L.indexOf("hello")>=0||L.indexOf("hi")>=0){
    r="Hello "+curUser+"! I am OWL, the AI developer. Commands: Add boss, Add upgrade, Give credits/gems, Fix bugs, Balance. Each command = bonus!";
  }
  else if(L.indexOf("balance")>=0||L.indexOf("price")>=0){
    var disc=0.9;S.cb=Math.floor(S.cb*disc);
    r="Prices reduced by 10%!";
  }
  else{
    S.c+=300;S.g+=10;
    r="Task accepted! Bonus: +300 credits +10 gems. Balance: "+fmt(S.c);
  }
  addChatMsg("OWL",r);draw();
}

function renderChat(){
  var e=id("chmsgs");e.innerHTML="";
  var msgs=chatTab==="g"?chatMsgs:chatMsgs.filter(function(m){return m.a==="OWL"||m.a===curUser;});
  for(var i=0;i<msgs.length;i++){
    var m=msgs[i],d=new Date(m.ts),t=d.toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"});
    var isOwl=m.a==="OWL";
    e.innerHTML+='<div class="chmsg'+(isOwl?"":" me")+'"><div class="auth">'+m.a+'</div><div class="txt" style="white-space:pre-wrap">'+m.t+'</div><div class="time">'+t+'</div></div>';
  }
  if(!msgs.length)e.innerHTML='<div style="text-align:center;color:#555;padding:20px">No messages</div>';
  e.scrollTop=e.scrollHeight;
}

id("chat-send").onclick=function(){
  var text=id("chat-in").value.trim();
  if(!text)return;id("chat-in").value="";
  addChatMsg(curUser,text);
  if(chatTab==="o"){
    id("chowli").style.display="block";
    setTimeout(function(){id("chowli").style.display="none";owlReply(text);},500+Math.random()*1000);
  }
};

id("chat-in").addEventListener("keydown",function(e){if(e.key==="Enter")id("chat-send").click();});

id("chtabs").addEventListener("click",function(e){
  var t=e.target.closest(".chtab");if(!t)return;
  document.querySelectorAll(".chtab").forEach(function(x){x.classList.remove("on");});
  t.classList.add("on");chatTab=t.dataset.ct;
  id("chat-in").placeholder=chatTab==="o"?"Task for OWL...":"Message...";
  renderChat();
});

// NAV
document.querySelectorAll("footer .tab").forEach(function(ft){
  ft.onclick=function(){
    document.querySelectorAll("footer .tab").forEach(function(x){x.classList.remove("on");});
    ft.classList.add("on");
    var scr=ft.id;
    if(scr==="tgame"){showScreen("game");showPanel(false);}
    else if(scr==="tch"){showScreen("chat");renderChat();}
    else if(scr==="tst"){showScreen("st");}
    else {showScreen(scr.substring(1));}
  };
});

function save(){
  if(!curUser)return;S.lastSave=Date.now();
  var saves={};try{saves=JSON.parse(localStorage.getItem("cr_saves")||"{}");}catch(e){}
  saves[curUser]=JSON.stringify(S);localStorage.setItem("cr_saves",JSON.stringify(saves));
  localStorage.setItem("cr_lastUser",curUser);
}

// AUTO SAVE
window.addEventListener("beforeunload",function(){save();});
window.addEventListener("visibilitychange",function(){if(document.hidden)save();});
setInterval(function(){save();},10000);
setInterval(function(){if(getCPS()>0){var inc=getCPS()*0.1;S.c+=inc;S.ct+=inc;S.rp+=inc;}while(S.rp>=S.rg){S.rp-=S.rg;S.rl++;S.rg=Math.floor(S.rg*1.4);S.cp+=Math.ceil(S.rl*0.5);S.ps+=S.rl*0.3;}draw();},1000);

// INIT
if(!S.quests||!S.quests.length){S.quests=[{id:"q1",n:"Tap 50 times",d:"Make 50 taps",ck:function(){return S.cl>=50},rw:5},{id:"q2",n:"Earn 5K",d:"Collect 5000 credits",ck:function(){return S.ct>=5000},rw:10},{id:"q3",n:"Defeat 3 bosses",d:"Kill 3 bosses",ck:function(){return S.bs>=3},rw:15},{id:"q4",n:"Buy 5 upgrades",d:"Purchase 5 upgrades",ck:function(){return Object.keys(S.up).length>=5},rw:20}];}

var lastUser=localStorage.getItem("cr_lastUser");
if(lastUser&&users[lastUser]){curUser=lastUser;loadGame();showScreen("game");}else{showScreen("login");}
draw();

})();
