"use strict";

var curUser=null,users={};
try{users=JSON.parse(localStorage.getItem("cr_users")||"{}");}catch(e){}
function saveUsers(){localStorage.setItem("cr_users",JSON.stringify(users));}
function h(p){var hv=0;for(var i=0;i<p.length;i++){hv=((hv<<5)-hv)+p.charCodeAt(i);hv|=0;}return hv.toString(36);}
function id(s){return document.getElementById(s);}

function showScreen(s){
  id("login-scr").classList.add("hide");
  id("game-scr").classList.add("hide");
  id("panel").classList.remove("show");
  if(s==="login")id("login-scr").classList.remove("hide");
  else if(s==="game")id("game-scr").classList.remove("hide");
}

function amsg(m,t){var e=id("amsg");e.textContent=m;e.className="msg "+(t||"");}

id("alogin").onclick=function(){
  var u=id("au").value.trim(),p=id("ap").value;
  if(!u||!p){amsg("Fill all fields","err");return;}
  if(!users[u]){amsg("User not found","err");return;}
  if(users[u].pass!==h(p)){amsg("Wrong password","err");return;}
  curUser=u;users[u].lastLogin=Date.now();saveUsers();loadGame();showScreen("game");amsg("","");
};

id("areg").onclick=function(){
  var u=id("au").value.trim(),p=id("ap").value;
  if(!u||!p){amsg("Fill all fields","err");return;}
  if(u.length<3){amsg("Min 3 chars","err");return;}
  if(p.length<4){amsg("Min 4 chars password","err");return;}
  if(users[u]){amsg("Username taken","err");return;}
  users[u]={pass:h(p),created:Date.now(),lastLogin:Date.now()};saveUsers();
  curUser=u;initNewGame();showScreen("game");amsg("Account created!","ok");
};

id("lout").onclick=function(){saveGame();curUser=null;showScreen("login");};
id("pcan").onclick=function(){id("panel").classList.remove("show");};

var S={c:0,ct:0,n:0,d:0,e:0,g:0,cl:0,bs:0,pr:0,pp:0,cp:1,ps:0,ns:0,ds:0,es:0,gm:1,dm:1,rl:1,rp:0,rg:100,up:{},ac:[],quests:[],cb:null,bh:0};
var UPG=[{n:"Neural Link",d:"+1 tap",cb:10,fn:function(){S.cp+=1},mx:100},{n:"Laser Focus",d:"+5 taps",cb:100,fn:function(){S.cp+=5},mx:50},{n:"Plasma Core",d:"+25 taps",cb:1000,fn:function(){S.cp+=25},mx:30},{n:"Nano Bot",d:"+0.5/s",cb:50,fn:function(){S.ps+=0.5},mx:50},{n:"Drone Swarm",d:"+2/s",cb:200,fn:function(){S.ps+=2},mx:30},{n:"AI Core",d:"+10/s",cb:1000,fn:function(){S.ps+=10},mx:20}];
var BS=[{n:"Glitch Phantom",hp:100,cr:50},{n:"Firewall Golem",hp:500,cr:200},{n:"Virus Swarm",hp:2000,cr:800},{n:"Data Kraken",hp:8000,cr:3000},{n:"Quantum Dragon",hp:30000,cr:12000}];

function getCPS(){return Math.floor(S.ps*S.gm);}
function fmt(n){if(n>=1e6)return(n/1e6).toFixed(1)+"M";if(n>=1e3)return(n/1e3).toFixed(1)+"K";return Math.floor(n);}

function tap(){
  var v=Math.floor(S.cp*S.gm);
  S.c+=v;S.ct+=v;S.cl++;S.rp+=v;
  id("tpinfo").textContent="+"+fmt(v);
  var btn=id("tpbtn");btn.style.transform="scale(.85)";setTimeout(function(){btn.style.transform=""},80);
  while(S.rp>=S.rg){S.rp-=S.rg;S.rl++;S.rg=Math.floor(S.rg*1.4);S.cp+=Math.ceil(S.rl*0.5);S.ps+=S.rl*0.3;}
  if(!S.cb&&S.rl>=5&&Math.random()<0.02)spawnBoss();
  draw();
}

function spawnBoss(){var i=Math.min(Math.floor(S.rl/5),BS.length-1);S.cb=BS[i];S.bh=S.cb.hp;id("bfight").classList.add("show");id("bfn").textContent=S.cb.n;updateBossHP();}
function winBoss(){var r=Math.floor(S.cb.cr*S.gm);S.c+=r;S.bs++;S.cb=null;S.bh=0;id("bfight").classList.remove("show");draw();}
function updateBossHP(){var pct=Math.max(0,(S.bh/S.cb.hp)*100);id("bf-hp").style.width=pct+"%";id("bf-text").textContent="HP: "+fmt(S.bh)+" / "+fmt(S.cb.hp);}
id("bf-atk").onclick=function(){var v=Math.floor(S.cp*S.gm);S.bh-=v;S.rp+=v;S.c+=v;S.ct+=v;if(S.bh<=0)winBoss();else updateBossHP();while(S.rp>=S.rg){S.rp-=S.rg;S.rl++;S.rg=Math.floor(S.rg*1.4);S.cp+=Math.ceil(S.rl*0.5);S.ps+=S.rl*0.3;}draw();};

id("tpbtn").addEventListener("touchstart",function(e){e.preventDefault();tap();},{passive:false});
id("tpbtn").addEventListener("mousedown",function(e){e.preventDefault();tap();});

function initNewGame(){S={c:0,ct:0,n:0,d:0,e:0,g:0,cl:0,bs:0,pr:0,pp:0,cp:1,ps:0,ns:0,ds:0,es:0,gm:1,dm:1,rl:1,rp:0,rg:100,up:{},ac:[],quests:[],cb:null,bh:0};}
function loadGame(){  if(!curUser)return;
  try{var sv=JSON.parse(localStorage.getItem("cr_saves")||"{}");var d=sv[curUser];if(d){var v=JSON.parse(d);for(var k in v)S[k]=v[k];}}catch(e){}
}
function saveGame(){
  if(!curUser)return;
  var sv={};try{sv=JSON.parse(localStorage.getItem("cr_saves")||"{}");}catch(e){}
  sv[curUser]=JSON.stringify(S);localStorage.setItem("cr_saves",JSON.stringify(sv));
  localStorage.setItem("cr_lastUser",curUser);
}

function draw(){
  id("rc").textContent=fmt(S.c);id("rn").textContent=fmt(S.n);
  id("rd").textContent=fmt(S.d);id("re").textContent=fmt(S.e);
  id("rcR").textContent=getCPS()>0?"+"+fmt(getCPS())+"/s":"";
  id("tcps").textContent="per sec: "+fmt(getCPS())+" | taps: "+fmt(S.cl);
  var pct=Math.min(100,(S.rp/S.rg)*100);
  id("prog-fi").style.width=pct+"%";
  id("uname").textContent=curUser||"";
}

function renderPanel(t){
  var p=id("pc");p.innerHTML="";
  if(t==="up"){
    id("panT").textContent="Upgrades";
    for(var i=0;i<UPG.length;i++){
      var u=UPG[i],o=S.up[i]||0,mx=o>=u.mx,cost=Math.floor(u.cb*Math.pow(1.15,o)),ok=S.c>=cost&&!mx;
      p.innerHTML+='<div class="card'+(ok?" can":"")+(mx?" done":"")+'" data-i="'+i+'"><div class="h"><span class="nm">'+u.n+'</span><span class="lv">'+o+'/'+u.mx+'</span></div><div class="d">'+u.d+'</div><div class="c">'+(mx?"MAX":fmt(cost))+'</div></div>';
    }
    p.querySelectorAll(".card").forEach(function(el){
      el.onclick=function(){if(el.classList.contains("done"))return;var i=parseInt(el.dataset.i),u=UPG[i],o=S.up[i]||0,cost=Math.floor(u.cb*Math.pow(1.15,o));if(S.c<cost)return;S.c-=cost;S.up[i]=o+1;u.fn();renderPanel("up");draw();};
    });
  } else if(t==="bo"){
    id("panT").textContent="Bosses";
    if(!S.cb){
      p.innerHTML='<div class="sec">Bosses</div><p style="color:#777;font-size:11px">Reach Realm Lv.5+</p><button class="atk-btn" id="sb">Summon Boss</button>';
      id("sb").onclick=function(){spawnBoss();id("panel").classList.remove("show");};
    } else {
      var pct=Math.max(0,(S.bh/S.cb.hp)*100);
      p.innerHTML='<div class="boss"><div class="bn">'+S.cb.n+'</div><div class="hp"><div class="hp-f" style="width:'+pct+'%"></div></div><div class="st"><span>HP: '+fmt(S.bh)+" / "+fmt(S.cb.hp)+'</span></div><div class="rw">Reward: '+fmt(S.cb.cr)+'</div></div><button class="atk-btn" id="ab">ATTACK</button>';
      id("ab").onclick=function(){var v=Math.floor(S.cp*S.gm);S.bh-=v;S.rp+=v;S.c+=v;S.ct+=v;if(S.bh<=0)winBoss();else renderPanel("bo");draw();};
    }
  } else if(t==="ac"){
    id("panT").textContent="Achievements";
    var achs=[{id:"a1",n:"First Tap",ck:function(){return S.cl>=1}},{id:"a2",n:"Clicker",ck:function(){return S.cl>=100}},{id:"a3",n:"Rich",ck:function(){return S.ct>=1e4}},{id:"a4",n:"Boss Slayer",ck:function(){return S.bs>=1}},{id:"a5",n:"Hunter",ck:function(){return S.bs>=10}},{id:"a6",n:"Realm Walker",ck:function(){return S.rl>=10}}];
    for(var i=0;i<achs.length;i++){var a=achs[i],done=S.ac.indexOf(a.id)>=0;p.innerHTML+='<div class="ach'+(done?' done':'')+'"><span class="ic">'+(done?"OK":a.id)+'</span><div class="inf"><div class="an">'+a.n+'</div></div>'+(done?'<span class="ar">Done</span>':'<span class="ar">+10 gems</span>')+'</div>';}
  } else if(t==="st"){
    id("panT").textContent="Stats";
    var rows=[["User",curUser],["Taps",fmt(S.cl)],["Total Credits",fmt(S.ct)],["Realm Level",S.rl],["Bosses Slain",S.bs],["Tap Power",fmt(S.cp)],["Income/sec",fmt(getCPS())]];
    rows.forEach(function(r){p.innerHTML+='<div class="strow"><span class="sl">'+r[0]+'</span><span class="sv">'+r[1]+'</span></div>';});
  }
}

id("tup").onclick=function(){id("panel").classList.add("show");renderPanel("up");};
id("tbo").onclick=function(){id("panel").classList.add("show");renderPanel("bo");};
id("tst").onclick=function(){id("panel").classList.add("show");renderPanel("st");};

window.addEventListener("beforeunload",function(){saveGame();});
setInterval(function(){saveGame();},30000);
setInterval(function(){
  if(getCPS()>0){var inc=Math.floor(getCPS()*0.3);S.c+=inc;S.ct+=inc;S.rp+=inc;}
  draw();
},1000);

var lastUser=localStorage.getItem("cr_lastUser");
if(lastUser&&users[lastUser]){curUser=lastUser;loadGame();}
else{showScreen("login");}
draw();