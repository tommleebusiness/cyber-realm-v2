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

function getCPS(){return Math.floor(S.ps*S.gm);}
function fmt(n){if(n>=1e6)return(n/1e6).toFixed(1)+"M";if(n>=1e3)return(n/1e3).toFixed(1)+"K";return Math.floor(n);}

function tap(){
  var v=Math.floor(S.cp*S.gm);
  S.c+=v;S.ct+=v;S.cl++;S.rp+=v;
  id("tpinfo").textContent="+"+fmt(v);
  var btn=id("tpbtn");btn.style.transform="scale(.85)";setTimeout(function(){btn.style.transform=""},80);
  draw();
}

id("tpbtn").addEventListener("touchstart",function(e){e.preventDefault();tap();},{passive:false});
id("tpbtn").addEventListener("mousedown",function(e){e.preventDefault();tap();});

function initNewGame(){S={c:0,ct:0,n:0,d:0,e:0,g:0,cl:0,bs:0,pr:0,pp:0,cp:1,ps:0,ns:0,ds:0,es:0,gm:1,dm:1,rl:1,rp:0,rg:100,up:{},ac:[],quests:[],cb:null,bh:0};}
function loadGame(){
  if(!curUser)return;
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

id("tup").onclick=function(){id("panel").classList.add("show");};
id("tbo").onclick=function(){id("panel").classList.add("show");};
id("tst").onclick=function(){id("panel").classList.add("show");};

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