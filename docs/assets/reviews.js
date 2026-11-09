(function(){
var C=window.BQ_CONFIG||{},B=(C.contactEndpoint||'').replace(/\/$/,''),K='bq_token';
function tok(){try{return localStorage.getItem(K)||''}catch(e){return ''}}
function clear(){try{localStorage.removeItem(K)}catch(e){}}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function str(n){return '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(n)}
function api(p,o){
  o=o||{};var h={},tk=tok();
  if(tk)h.Authorization='Bearer '+tk;
  if(o.body){h['Content-Type']='application/json';o.body=JSON.stringify(o.body)}
  return fetch(B+p,{method:o.method||'GET',headers:h,body:o.body}).then(function(r){
    return r.json().catch(function(){return{ok:false}}).then(function(j){if(r.status===401)clear();return j});
  }).catch(function(){return{ok:false,error:'Network error.'}});
}
function stars(host,v0,cb){
  var val=v0||0,bs=[];
  host.className='stars';host.innerHTML='';
  function paint(n){bs.forEach(function(b,i){b.classList.toggle('on',i<n)})}
  for(var i=1;i<=5;i++)(function(n){
    var b=el('button','','★');b.type='button';b.setAttribute('aria-label',n+(n>1?' stars':' star'));
    b.onmouseenter=function(){paint(n)};b.onfocus=function(){paint(n)};
    b.onclick=function(){val=n;paint(n);if(cb)cb(n)};
    bs.push(b);host.appendChild(b);
  })(i);
  host.onmouseleave=function(){paint(val)};
  paint(val);
  return{get:function(){return val}};
}
function modal(){
  var m=el('div','mod'),b=el('div','box');
  m.appendChild(b);
  function close(){m.remove();document.removeEventListener('keydown',onKey)}
  function onKey(e){if(e.key==='Escape')close()}
  m.onclick=function(e){if(e.target===m)close()};
  document.addEventListener('keydown',onKey);
  document.body.appendChild(m);
  b.close=close;
  return b;
}
function loginButtons(app,rating){
  var g=el('div','oauth');
  api('/api/providers').then(function(pr){
  var list=[['google','Continue with Google'],['github','Continue with GitHub']].filter(function(x){return pr&&pr[x[0]]});
  if(!list.length)g.appendChild(el('p','sub','Sign-in is not available yet. Please check back soon.'));
  list.forEach(function(p){
    var a=el('button','btn',p[1]);a.type='button';
    a.onclick=function(){
      try{sessionStorage.setItem('bq_intent',JSON.stringify({app:app||'',rating:rating||0}))}catch(e){}
      location.href=B+'/auth/'+p[0]+'?return='+encodeURIComponent(location.origin+location.pathname+location.search);
    };
    g.appendChild(a);
  });
  });
  return g;
}
function signin(b,app,rating){
  b.innerHTML='';
  b.appendChild(el('h3','','Sign in to continue'));
  b.appendChild(el('p','sub','Signing in only confirms you are a real person, so each person can leave one review per app. Your email is never shown, and it is not kept unless you choose the newsletter.'));
  b.appendChild(loginButtons(app,rating));
  var c=el('button','btn sm','Cancel');c.type='button';c.style.marginTop='14px';c.onclick=b.close;
  b.appendChild(c);
}
function form(b,app,rating,mine,me,done){
  b.innerHTML='';
  b.appendChild(el('h3','',mine?'Edit your public review':'Add a Public Review'));
  b.appendChild(el('p','fine','This is a public review. Your name and profile picture may be seen by other visitors. We never publish your email address. It is used only for the newsletter, if you opt in.'));
  var sh=el('div');b.appendChild(sh);
  var st=stars(sh,rating||(mine&&mine.rating)||0);
  var f1=el('div','fld');f1.style.marginTop='14px';
  var l1=el('label','','Your review (optional)');l1.htmlFor='rv-t';
  var ta=el('textarea');ta.id='rv-t';ta.maxLength=900;ta.value=mine&&mine.text||'';
  var cn=el('small','',ta.value.length+' / 900');
  ta.oninput=function(){cn.textContent=ta.value.length+' / 900'};
  f1.appendChild(l1);f1.appendChild(ta);f1.appendChild(cn);b.appendChild(f1);
  var f2=el('div','fld');
  var l2=el('label','','Display name');l2.htmlFor='rv-n';
  var nm=el('input');nm.id='rv-n';nm.maxLength=40;nm.value=mine?(mine.name||''):(me.name||'');
  f2.appendChild(l2);f2.appendChild(nm);b.appendChild(f2);
  var pc=null;
  if(me.avatar){
    var pl=el('label','chkl');pc=el('input');pc.type='checkbox';pc.checked=mine?!!mine.showPhoto:true;
    var im=el('img','av');im.src=me.avatar;im.alt='';im.referrerPolicy='no-referrer';
    pl.appendChild(pc);pl.appendChild(im);pl.appendChild(el('span','','Show my profile picture'));
    pl.style.alignItems='center';pl.style.marginBottom='10px';b.appendChild(pl);
  }
  var lab=el('label','chkl'),cb=el('input');cb.type='checkbox';cb.checked=!!me.subscribed;
  lab.appendChild(cb);
  lab.appendChild(el('span','','Send me news and updates by email. Optional. You can change this any time on your Account page.'));
  b.appendChild(lab);
  var msg=el('div','note');msg.hidden=true;b.appendChild(msg);
  var row=el('div','btns');row.style.marginTop='16px';
  var go=el('button','btn primary','Submit');go.type='button';
  go.onclick=function(){
    if(!st.get()){msg.className='note err';msg.textContent='Please choose a star rating.';msg.hidden=false;return}
    go.disabled=true;go.textContent='Sending...';
    api('/api/review',{method:'POST',body:{app:app,rating:st.get(),text:ta.value,name:nm.value,newsletter:cb.checked,photo:pc?pc.checked:false}}).then(function(j){
      if(j.ok){
        b.innerHTML='';
        b.appendChild(el('h3','','Thank you'));
        b.appendChild(el('p','sub','Your review has been submitted.'));
        var c=el('button','btn primary','Close');c.onclick=b.close;b.appendChild(c);
        if(done)done();
      }else{
        go.disabled=false;go.textContent='Submit';
        msg.className='note err';msg.textContent=j.error||'Could not save. Please try again.';msg.hidden=false;
        if(!tok())signin(b,app,st.get());
      }
    });
  };
  row.appendChild(go);
  if(mine){
    var del=el('button','btn dng','Delete review');del.type='button';
    del.onclick=function(){
      if(!confirm('Delete your review?'))return;
      api('/api/review?app='+app,{method:'DELETE'}).then(function(j){if(j.ok){b.close();if(done)done()}});
    };
    row.appendChild(del);
  }
  var cx=el('button','btn','Cancel');cx.type='button';cx.onclick=b.close;row.appendChild(cx);
  b.appendChild(row);
}
function open(app,rating,done){
  if(!B)return;
  var b=modal();
  if(!tok()){signin(b,app,rating);return}
  b.textContent='Loading...';
  Promise.all([api('/api/reviews?app='+app),api('/api/me')]).then(function(r){
    if(!tok()||!r[1].ok){signin(b,app,rating);return}
    form(b,app,rating,r[0].mine,r[1],done);
  });
}
function takeIntent(){
  if(!tok())return null;
  try{var v=JSON.parse(sessionStorage.getItem('bq_intent')||'null');sessionStorage.removeItem('bq_intent');return v}catch(e){return null}
}
function mount(a){
  var rate=document.getElementById('rate'),rv=document.getElementById('rv');
  if(!B||!rate||!rv)return;
  function draw(){
    api('/api/reviews?app='+a.id).then(function(j){
      if(!j||!j.ok)return;
      rate.innerHTML='';
      var s=el('span');stars(s,j.mine?j.mine.rating:0,function(n){open(a.id,n,draw)});
      rate.appendChild(s);
      rate.appendChild(el('span','rt',j.count?'★ '+j.avg+' · '+j.count+(j.count>1?' reviews':' review'):'No reviews yet'));
      var b=el('button','btn sm',j.mine?'Edit':'Review');
      b.onclick=function(){open(a.id,j.mine?j.mine.rating:0,draw)};
      rate.appendChild(b);
      rv.hidden=false;rv.innerHTML='';
      rv.appendChild(el('h2','','Reviews'));
      if(!j.reviews.length)rv.appendChild(el('p','sub','No reviews yet. Be the first to share what you think.'));
      var g=el('div','rvgrid');
      j.reviews.forEach(function(r){
        var c=el('div','rvc'),h=el('div','h');
        if(r.avatar){var im=el('img','av');im.src=r.avatar;im.alt='';im.referrerPolicy='no-referrer';im.loading='lazy';h.appendChild(im)}
        var w=el('div','who');w.appendChild(el('b','',r.name||'Anonymous'));w.appendChild(el('span','s',str(r.rating)));
        h.appendChild(w);h.appendChild(el('time','',BQ.date(r.updated*1000)));
        c.appendChild(h);
        if(r.text){c.appendChild(el('p','',r.text));c.title='Click to read more';c.onclick=function(){c.classList.toggle('open')}}
        g.appendChild(c);
      });
      if(j.reviews.length)rv.appendChild(g);
      var it=takeIntent();
      if(it&&it.app===a.id)open(a.id,it.rating,draw);
      else if(location.hash==='#review'){history.replaceState(null,'',location.pathname+location.search);open(a.id,j.mine?j.mine.rating:0,draw)}
    });
  }
  draw();
}
window.BQR={B:B,tok:tok,clear:clear,api:api,el:el,str:str,stars:stars,open:open,mount:mount,takeIntent:takeIntent,loginButtons:loginButtons};
})();
