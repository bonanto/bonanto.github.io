(function(){
var BRAND='Bonanto';
var NAV=[['Software','/software.html'],['About','/about.html'],['Me','/me.html'],['Privacy','/privacy.html'],['GitHub','https://github.com/bonanto']];
var links=NAV.map(function(n){return '<a href="'+n[1]+'">'+n[0]+'</a>'}).join('');
document.body.insertAdjacentHTML('afterbegin','<div class="bg" aria-hidden="true"><i></i><i></i><i></i></div><header id="hd"><div class="wrap"><div class="bar"><a class="brand" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M21 3a13 13 0 1 0 8 23A11 11 0 0 1 21 3z"/></svg>'+BRAND+'</a><div class="links">'+links+'</div><button class="burger" id="bg" aria-label="Menu" aria-expanded="false"><span></span></button></div><nav class="menu">'+links+'</nav></div></header><div class="ov"></div>');
document.body.insertAdjacentHTML('beforeend','<footer><div class="wrap foot"><span>© '+new Date().getFullYear()+' '+BRAND+'. All rights reserved.</span><nav><a href="/software.html">Software</a><a href="/about.html">About</a><a href="/me.html">Me</a><a href="/privacy.html">Privacy Policy</a><a href="https://github.com/bonanto">GitHub</a><a href="mailto:bonanto18@protonmail.com">Contact</a></nav></div></footer>');

var hd=document.getElementById('hd'),bg=document.getElementById('bg');
function tog(o){hd.classList.toggle('open',o);bg.setAttribute('aria-expanded',o)}
bg.onclick=function(){tog(!hd.classList.contains('open'))};
hd.querySelectorAll('.menu a').forEach(function(a){a.onclick=function(){tog(false)}});
document.addEventListener('keydown',function(e){if(e.key==='Escape')tog(false)});
document.addEventListener('click',function(e){if(hd.classList.contains('open')&&!e.target.closest('.bar,.menu'))tog(false)});

function cached(url,ttl){
  var k='c:'+url,c=null;
  try{c=JSON.parse(localStorage.getItem(k))}catch(e){}
  if(c&&Date.now()-c.t<ttl)return Promise.resolve(c.v);
  return fetch(url).then(function(r){return r.ok?r.json():Promise.reject()}).then(function(v){
    try{localStorage.setItem(k,JSON.stringify({t:Date.now(),v:v}))}catch(e){}
    return v;
  });
}
function load(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
var libs=null;
function needLibs(){return libs||(libs=load('https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js').then(function(){return load('https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js')}))}
var API='https://api.github.com/repos/';
var ONERR="this.replaceWith(Object.assign(document.createElement('a'),{href:this.src,textContent:'[image]'}))";

function drop(i){var a=i.closest('a');(a&&a.querySelectorAll('img').length===1&&!a.textContent.trim()?a:i).remove()}
function strip(t){
  t.querySelectorAll('img').forEach(function(i){if(/shields\.io|badgen|badge/i.test(i.src))drop(i)});
  var f=t.querySelector('img');
  if(f&&/icon|logo/i.test(f.src+' '+f.alt))drop(f);
  var h=t.querySelector('h1');
  if(h){
    var n=h.nextElementSibling;h.remove();
    if(n&&n.tagName==='P'&&n.children.length===1&&n.firstElementChild.tagName==='STRONG'&&n.textContent.trim().length>20)n.remove();
  }
}
function figs(t){
  t.querySelectorAll('table').forEach(function(tb){
    if(!tb.querySelector('img'))return;
    var cap=[],out=document.createElement('div');out.className='figs';
    tb.querySelectorAll('tr').forEach(function(tr){
      [].forEach.call(tr.children,function(c,ci){
        var im=c.querySelector('img');
        if(!im){var tx=c.textContent.trim();if(tx)cap[ci]=tx;return}
        var f=document.createElement('figure');
        f.appendChild(im.closest('a')&&c.contains(im.closest('a'))?im.closest('a'):im);
        var rest=c.textContent.trim(),title=cap[ci];cap[ci]=null;
        if(title||rest){var fc=document.createElement('figcaption');fc.innerHTML=(title?'<b>'+BQ.esc(title)+'</b>':'')+(title&&rest?'<br>':'')+BQ.esc(rest);f.appendChild(fc)}
        out.appendChild(f);
      });
    });
    tb.replaceWith(out);
  });
}
function clean(t){
  for(var k=0;k<3;k++)t.querySelectorAll('p,div,a,figure,span').forEach(function(e){if(!e.textContent.trim()&&!e.querySelector('img,video,iframe,svg,input'))e.remove()});
}

window.BQ={
  apps:fetch('/apps.json').then(function(r){return r.json()}).then(function(j){return j.apps}),
  cached:cached,
  fmt:function(n){return n>=1000?(n/1000).toFixed(n>=10000?0:1)+'k':String(n)},
  esc:function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})},
  date:function(s){return new Date(s).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})},
  size:function(b){return b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB'},
  ver:function(t){var m=/v(\d+(?:\.\d+)+)/i.exec(t)||/(\d+(?:\.\d+)+)/.exec(t);return m?m[1]:t},
  build:function(t){var m=/[_-](\d{4}\.\d{3,4})\b/.exec(t);return m?m[1]:null},
  u:{
    app:function(id){return '/apps/'+id+'/'},
    ver:function(id){return '/apps/'+id+'/versions/'},
    doc:function(id,d){return '/apps/'+id+'/'+d.split('/').map(encodeURIComponent).join('/')+'/'}
  },
  route:function(){
    var q=new URLSearchParams(location.search),p=location.pathname.split('/').filter(Boolean),r={app:q.get('app'),doc:q.get('doc')};
    if(p[0]==='apps'){r.app=r.app||p[1];if(p[2]&&p[2]!=='versions')r.doc=r.doc||decodeURIComponent(p.slice(2).join('/'))}
    return r;
  },
  icon:function(a,c){return '<span class="ico '+(c||'')+'"><img src="/assets/'+a.icon+'" alt="" onload="this.parentNode.classList.add(\'has\')"><span class="fb">'+BQ.esc(a.mark)+'</span></span>'},
  src:function(a,k){var s=k?(a[k]||{}):(a.src||{});return{repo:a.repo,ref:s.ref||'HEAD',dir:s.dir?s.dir.replace(/\/?$/,'/'):''}},
  raw:function(a,path,k){var s=BQ.src(a,k);return fetch('https://raw.githubusercontent.com/'+s.repo+'/'+s.ref+'/'+s.dir+path).then(function(r){return r.ok?r.text():Promise.reject()})},
  readme:function(a){
    return BQ.raw(a,(a.readme&&a.readme.path)||'README.md','readme').catch(function(){
      return fetch(API+a.repo+'/readme',{headers:{Accept:'application/vnd.github.raw+json'}}).then(function(r){return r.ok?r.text():Promise.reject()});
    });
  },
  fetchDoc:function(a,name){
    var vs=[name+'.md',name,name+'.txt',name.toUpperCase()+'.md',name.toUpperCase(),name.toLowerCase()+'.md',name.toLowerCase()].filter(function(v,i,l){return l.indexOf(v)===i});
    var srcs=[BQ.src(a),BQ.src(a,'readme'),{repo:a.repo,ref:'HEAD',dir:''}],tries=[];
    srcs.forEach(function(s){vs.forEach(function(v){var u='https://raw.githubusercontent.com/'+s.repo+'/'+s.ref+'/'+s.dir+v;if(tries.indexOf(u)<0)tries.push(u)})});
    return tries.reduce(function(p,u){return p.catch(function(){return fetch(u).then(function(r){return r.ok?r.text():Promise.reject()})})},Promise.reject());
  },
  docs:function(a){
    if(a.docs)return Promise.resolve(a.docs);
    var s=BQ.src(a),hide=['readme','index'].concat((a.hideDocs||[]).map(function(x){return x.toLowerCase()}));
    return cached(API+a.repo+'/contents'+(s.dir?'/'+s.dir.replace(/\/$/,''):'')+(s.ref!=='HEAD'?'?ref='+s.ref:''),216e5).then(function(l){
      return l.filter(function(f){return f.type==='file'&&/\.md$/i.test(f.name)}).map(function(f){
        var n=f.name.replace(/\.md$/i,'');
        return{label:n.replace(/[-_]+/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase()}),path:n};
      }).filter(function(d){return hide.indexOf(d.path.toLowerCase())<0});
    });
  },
  render:function(md,a,o){
    o=o||{};
    return needLibs().then(function(){
      md=md.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
      var t=document.createElement('div'),s=BQ.src(a,o.k),raw='https://raw.githubusercontent.com/'+s.repo+'/'+s.ref+'/'+s.dir;
      t.innerHTML=DOMPurify.sanitize(marked.parse(md),{ADD_ATTR:['align']});
      t.querySelectorAll('img').forEach(function(i){
        var u=i.getAttribute('src')||'';
        if(!/^(https?:|data:|\/\/)/.test(u))i.src=raw+u.replace(/^\.?\//,'');
        i.referrerPolicy='no-referrer';i.setAttribute('onerror',ONERR);
      });
      t.querySelectorAll('a').forEach(function(l){
        var h=l.getAttribute('href')||'';
        if(!h||/^(https?:|mailto:|#|\/\/)/.test(h))return;
        var p=h.replace(/^\.?\//,'').split('#')[0].replace(/\.(md|html)$/i,'');
        l.href=/\.[a-z0-9]+$/i.test(p)?'https://github.com/'+s.repo+'/blob/'+s.ref+'/'+s.dir+p:BQ.u.doc(a.id,p);
      });
      if(o.readme)strip(t);
      figs(t);clean(t);
      return t.innerHTML;
    });
  },
  rel:function(repo){return cached(API+repo+'/releases?per_page=100',36e5)},
  stable:function(rs){return rs.filter(function(r){return !r.prerelease&&!r.draft})},
  stats:function(repo){
    return Promise.all([cached(API+repo,216e5),BQ.rel(repo).catch(function(){return[]})]).then(function(a){
      var d=0,st=BQ.stable(a[1]),l=a[0].license&&a[0].license.spdx_id;
      a[1].forEach(function(r){(r.assets||[]).forEach(function(x){d+=x.download_count||0})});
      return{stars:a[0].stargazers_count,downloads:d,updated:st[0]?st[0].published_at:null,version:st[0]?BQ.ver(st[0].tag_name):null,license:l&&l!=='NOASSERTION'?l:null};
    });
  },
  card:function(a){
    var soon=a.status==='soon',tags='';
    if(soon)tags='<span class="tag soon">In development</span>';
    else{
      if(a.price)tags+='<span class="tag k">'+BQ.esc(a.price)+'</span>';
      if(a.license)tags+='<span class="tag">'+BQ.esc(a.license)+'</span>';
      (a.platforms||[]).forEach(function(p){tags+='<span class="tag">'+BQ.esc(p)+'</span>'});
    }
    var href=soon?'':(a.url||BQ.u.app(a.id)),t=href?'a':'div';
    return '<'+t+(href?' href="'+href+'"':'')+' class="card" data-repo="'+(soon?'':BQ.esc(a.repo||''))+'"><div class="top">'+BQ.icon(a)+'<h3>'+BQ.esc(a.name)+'</h3></div><p>'+BQ.esc(a.tagline)+'</p><div class="tags">'+tags+'</div><div class="meta"></div></'+t+'>';
  },
  fill:function(root){
    root.querySelectorAll('.card[data-repo]').forEach(function(c){
      if(!c.dataset.repo)return;
      BQ.stats(c.dataset.repo).then(function(s){
        var m='';
        if(s.stars)m+='<span>★ <b>'+BQ.fmt(s.stars)+'</b></span>';
        if(s.downloads)m+='<span>↓ <b>'+BQ.fmt(s.downloads)+'</b> downloads</span>';
        if(s.version)m+='<span>v<b>'+BQ.esc(s.version)+'</b></span>';
        c.querySelector('.meta').innerHTML=m;
      }).catch(function(){});
    });
  }
};
})();
