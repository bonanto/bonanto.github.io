(function(){
var BRAND='Bonanto';
var NAV=[['Software','/#software'],['About','/about.html'],['Me','/me.html'],['Privacy','/privacy.html'],['GitHub','https://github.com/bonanto']];
var links=NAV.map(function(n){return '<a href="'+n[1]+'">'+n[0]+'</a>'}).join('');
document.body.insertAdjacentHTML('afterbegin','<div class="bg" aria-hidden="true"><i></i><i></i><i></i></div><header id="hd"><div class="wrap"><div class="bar"><a class="brand" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M21 3a13 13 0 1 0 8 23A11 11 0 0 1 21 3z"/></svg>'+BRAND+'</a><div class="links">'+links+'</div><button class="burger" id="bg" aria-label="Menu" aria-expanded="false"><span></span></button></div><nav class="menu">'+links+'</nav></div></header><div class="ov"></div>');
document.body.insertAdjacentHTML('beforeend','<footer><div class="wrap foot"><span>© '+new Date().getFullYear()+' '+BRAND+'. All rights reserved.</span><nav><a href="/about.html">About</a><a href="/me.html">Me</a><a href="/privacy.html">Privacy Policy</a><a href="https://github.com/bonanto">GitHub</a><a href="mailto:bonanto18@protonmail.com">Contact</a></nav></div></footer>');

var hd=document.getElementById('hd'),bg=document.getElementById('bg');
function tog(o){hd.classList.toggle('open',o);bg.setAttribute('aria-expanded',o)}
bg.onclick=function(){tog(!hd.classList.contains('open'))};
hd.querySelectorAll('.menu a').forEach(function(a){a.onclick=function(){tog(false)}});
document.addEventListener('keydown',function(e){if(e.key==='Escape')tog(false)});
document.addEventListener('click',function(e){if(hd.classList.contains('open')&&!e.target.closest('.bar,.menu'))tog(false)});

function cached(url,ttl,headers){
  var k='c:'+url,c=null;
  try{c=JSON.parse(localStorage.getItem(k))}catch(e){}
  if(c&&Date.now()-c.t<ttl)return Promise.resolve(c.v);
  return fetch(url,{headers:headers||{}}).then(function(r){return r.ok?r.json():Promise.reject()}).then(function(v){
    try{localStorage.setItem(k,JSON.stringify({t:Date.now(),v:v}))}catch(e){}
    return v;
  });
}
window.BQ={
  apps:fetch('/apps.json').then(function(r){return r.json()}).then(function(j){return j.apps}),
  cached:cached,
  fmt:function(n){return n>=1000?(n/1000).toFixed(n>=10000?0:1)+'k':String(n)},
  esc:function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})},
  icon:function(a,c){return '<span class="ico '+(c||'')+'"><img src="/assets/'+a.icon+'" alt="" onload="this.parentNode.classList.add(\'has\')"><span class="fb">'+BQ.esc(a.mark)+'</span></span>'},
  stats:function(repo){
    return Promise.all([
      cached('https://api.github.com/repos/'+repo,216e5),
      cached('https://api.github.com/repos/'+repo+'/releases?per_page=100',216e5).catch(function(){return[]})
    ]).then(function(a){
      var d=0;a[1].forEach(function(r){(r.assets||[]).forEach(function(x){d+=x.download_count||0})});
      return{stars:a[0].stargazers_count,downloads:d};
    });
  }
};
})();
