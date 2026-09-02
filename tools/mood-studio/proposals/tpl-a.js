/* ===== 1 · العمود الزجاجي (الحالي) ===== */
function T1(r,I,D){
  cover(I[0],0,0,W,H,.5);
  vgrad(0,0,W,H*.62,"rgba(8,6,4,.62)","rgba(8,6,4,0)");
  vgrad(0,H*.66,W,H*.34,"rgba(8,6,4,0)","rgba(8,6,4,.74)");
  const R=W-72, COL=700; let y=SAFE_T+180+44;
  rtl();ctx.font='500 34px Tajawal';sh(14,.72,3);ctx.fillStyle="rgba(255,255,255,.7)";
  ctx.fillText("اليوم ٥٠",R,y);nosh();y+=54;
  ltr();ctx.textAlign="right";ctx.font='600 30px "Readex Pro"';ctx.letterSpacing="5px";
  sh(14,.7,3);ctx.fillStyle="rgba(255,255,255,.68)";ctx.fillText(r.b.toUpperCase(),R,y);nosh();
  ctx.letterSpacing="0px";y+=56;
  let s=92;const f=n=>"600 "+n+"px Caveat";ctx.font=f(s);
  while(s>44&&ctx.measureText(r.n).width>COL){s-=2;ctx.font=f(s);}
  sh(22,.8,4);ctx.fillStyle="#fff";ctx.fillText(r.n,R,y);nosh();y+=s*.4+34;
  sig(R,y,"r");y+=52;
  ctx.strokeStyle="#E8B451";ctx.lineWidth=4;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(R,y);ctx.lineTo(R-132,y);ctx.stroke();y+=102;
  const v=score6(r);
  ctx.font='400 54px Tajawal';const lw=ctx.measureText("الأداء:").width;
  sh(22,.82,4);rtl();ctx.fillStyle="rgba(255,255,255,.92)";ctx.fillText("الأداء:",R,y);
  ctx.font='500 106px Tajawal';ltr();ctx.textAlign="right";ctx.fillStyle="#fff";
  ctx.fillText(v.toFixed(2),R-lw-22,y);nosh();y+=30;
  const bw=COL*.6;ctx.fillStyle="rgba(255,255,255,.24)";rr(R-bw,y,bw,8,4);ctx.fill();
  ctx.fillStyle="#E8B451";rr(R-bw*v/10,y,bw*v/10,8,4);ctx.fill();y+=62;
  rtl();ctx.font='400 46px Tajawal';sh(18,.8,3);ctx.fillStyle="#fff";
  wrap("الاحساس: واحد داخل المجلس متأخر والكل قام له",'400 46px Tajawal',COL)
    .forEach((l,i)=>ctx.fillText(l,R,y+i*64));nosh();y+=2*64+22;
  // panel
  const P=30,X=R-COL,IW=COL-P*2;let ph=P;const ops=[];
  [["المقدمة","t","#E8C86A"],["القلب","m","#D98A9A"],["القاعدة","z","#8A6244"]].forEach(([lab,k,c],i,a)=>{
    const nn=notes(r,k);if(!nn.length)return;
    ops.push({k:"tl",y:ph,t:a.filter(x=>notes(r,x[1]).length).length===1?"النوتات":lab,c});ph+=37;
    wrap(nn.slice(0,4).join("  ·  "),'400 31px Tajawal',IW-32).forEach(l=>{ops.push({k:"tn",y:ph,t:l});ph+=40;});ph+=10;});
  ph+=10;ops.push({k:"rule",y:ph});ph+=26;
  ops.push({k:"src",y:ph,t:"تقييم مجتمع فراغرانتيكا"});ph+=34;
  ops.push({k:"hl",y:ph,v:r.c});ph+=50;
  ops.push({k:"bar",y:ph,l:"الثبات",v:r.l,w:IW});ph+=58;
  ops.push({k:"bar",y:ph,l:"الفوحان",v:r.p,w:IW});ph+=50;
  ph+=10;ops.push({k:"rule",y:ph});ph+=26;
  ops.push({k:"meta",y:ph,t:[dv(D,"g",r.g),dv(D,"e",r.e),dv(D,"w",r.w)].filter(Boolean).join("   ·   "),s:1});ph+=38;
  ops.push({k:"meta",y:ph,t:[r.u,dv(D,"f",r.f),r.y].filter(Boolean).join("   ·   "),s:0});ph+=34+P;
  ctx.fillStyle="rgba(14,11,8,.67)";rr(X,y,COL,ph,28);ctx.fill();
  ctx.strokeStyle="rgba(255,255,255,.17)";ctx.lineWidth=1.5;rr(X,y,COL,ph,28);ctx.stroke();
  const RI=X+COL-P;
  ops.forEach(o=>{const oy=y+o.y;
    if(o.k==="tl"){ctx.fillStyle=o.c;ctx.beginPath();ctx.arc(RI-7,oy+14,7,0,7);ctx.fill();
      ctx.font='500 29px Tajawal';rtl();ctx.fillText(o.t,RI-26,oy+24);}
    else if(o.k==="tn"){ctx.font='400 31px Tajawal';rtl();ctx.fillStyle="rgba(255,255,255,.94)";ctx.fillText(o.t,RI-32,oy+29);}
    else if(o.k==="rule"){ctx.strokeStyle="rgba(255,255,255,.14)";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(X+P,oy);ctx.lineTo(RI,oy);ctx.stroke();}
    else if(o.k==="src"){ctx.font='400 25px Tajawal';rtl();ctx.fillStyle="rgba(255,255,255,.56)";ctx.fillText(o.t,RI,oy+22);}
    else if(o.k==="hl"){const c=ramp(o.v/5);ltr();ctx.textAlign="right";ctx.font='400 26px Tajawal';
      ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillText("/ 5",RI,oy+34);const sw=ctx.measureText("/ 5").width+10;
      ctx.font='500 44px Tajawal';ctx.fillStyle=rgb(c);ctx.fillText(o.v.toFixed(1),RI-sw,oy+34);}
    else if(o.k==="bar"){const c=ramp(o.v/5);ctx.font='400 30px Tajawal';rtl();
      ctx.fillStyle="rgba(255,255,255,.72)";ctx.fillText(o.l,RI,oy+24);
      ctx.font='500 29px Tajawal';ltr();ctx.fillStyle=rgb(c);ctx.fillText(o.v.toFixed(1)+" / 5",X+P,oy+24);
      const by=oy+38;ctx.fillStyle="rgba(255,255,255,.18)";rr(X+P,by,o.w,9,4.5);ctx.fill();
      const fw=Math.max(9,o.w*clamp(o.v/5,0,1));const g=ctx.createLinearGradient(RI-fw,0,RI,0);
      g.addColorStop(0,rgb(c.map(x=>Math.round(x*.74))));g.addColorStop(1,rgb(c));ctx.fillStyle=g;
      rr(RI-fw,by,fw,9,4.5);ctx.fill();}
    else if(o.k==="meta"){ctx.font=(o.s?"500 ":"300 ")+'29px Tajawal';ctx.direction=o.s?"rtl":"ltr";
      ctx.textAlign="right";ctx.fillStyle=o.s?"rgba(255,255,255,.86)":"rgba(255,255,255,.58)";ctx.fillText(o.t,RI,oy+26);}
  });
}

/* ===== 2 · الشريط السفلي — الصورة هي البطل ===== */
function T2(r,I,D){
  cover(I[0],0,0,W,H,.42);
  vgrad(0,H*.55,W,H*.45,"rgba(6,5,4,0)","rgba(6,5,4,.92)");
  const y=H-SAFE_B-40;
  rtl();ctx.font='400 30px "Readex Pro"';ctx.letterSpacing="4px";ctx.direction="ltr";ctx.textAlign="right";
  ctx.fillStyle="rgba(255,255,255,.6)";ctx.fillText(r.b.toUpperCase(),W-72,y-176);ctx.letterSpacing="0px";
  ctx.font='600 84px Caveat';ctx.fillStyle="#fff";ctx.fillText(r.n,W-72,y-96);
  const v=score6(r);
  ltr();ctx.textAlign="left";ctx.font='500 110px Tajawal';ctx.fillStyle="#E8B451";ctx.fillText(v.toFixed(2),72,y-92);
  ctx.font='400 28px Tajawal';ctx.fillStyle="rgba(255,255,255,.55)";ctx.fillText("الأداء",72,y-150);
  // accord dots row
  const dots=[["#E8C86A",notes(r,"t")[0]],["#D98A9A",notes(r,"m")[0]],["#8A6244",notes(r,"z")[0]]].filter(x=>x[1]);
  let dx=W-72;rtl();
  dots.forEach(([c,t])=>{ctx.font='400 30px Tajawal';const tw=ctx.measureText(t).width;
    ctx.fillStyle="rgba(255,255,255,.85)";ctx.fillText(t,dx,y-16);
    ctx.fillStyle=c;ctx.beginPath();ctx.arc(dx-tw-16,y-25,8,0,7);ctx.fill();dx-=tw+44;});
  sig(72,y-16,"l","rgba(255,255,255,.8)",26);
}

/* ===== 3 · الشاشة المقسومة ===== */
function T3(r,I,D){
  const cut=Math.round(H*.54);
  cover(I[0],0,0,W,cut,.45);
  ctx.fillStyle="#17130E";ctx.fillRect(0,cut,W,H-cut);
  ctx.fillStyle="#E8B451";ctx.fillRect(0,cut,W,5);
  let y=cut+90;const R=W-80;
  ltr();ctx.textAlign="right";ctx.font='600 28px "Readex Pro"';ctx.letterSpacing="5px";
  ctx.fillStyle="rgba(232,180,81,.9)";ctx.fillText(r.b.toUpperCase(),R,y);ctx.letterSpacing="0px";y+=76;
  ctx.font='600 84px Caveat';ctx.fillStyle="#fff";ctx.fillText(r.n,R,y);y+=64;
  const v=score6(r);
  ltr();ctx.textAlign="left";ctx.font='500 132px Tajawal';ctx.fillStyle="#E8B451";ctx.fillText(v.toFixed(2),80,y+46);
  ctx.font='400 30px Tajawal';ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillText("الأداء من ١٠",80,y+92);
  rtl();let ny=y+10;
  [["المقدمة","t"],["القلب","m"],["القاعدة","z"]].forEach(([lab,k])=>{
    const nn=notes(r,k);if(!nn.length)return;
    ctx.font='400 25px Tajawal';ctx.fillStyle="rgba(232,180,81,.85)";ctx.fillText(lab,R,ny);ny+=36;
    ctx.font='400 30px Tajawal';ctx.fillStyle="rgba(255,255,255,.9)";
    wrap(nn.slice(0,3).join(" · "),'400 30px Tajawal',420).forEach(l=>{ctx.fillText(l,R,ny);ny+=38;});ny+=8;});
  const by=H-SAFE_B-116;
  [["الثبات",r.l],["الفوحان",r.p]].forEach(([lab,val],i)=>{
    const yy=by+i*54,c=ramp(val/5);
    rtl();ctx.font='400 27px Tajawal';ctx.fillStyle="rgba(255,255,255,.7)";ctx.fillText(lab,R,yy);
    ctx.fillStyle="rgba(255,255,255,.14)";rr(80,yy-14,R-190,8,4);ctx.fill();
    ctx.fillStyle=rgb(c);rr(R-110-(R-190)*val/5,yy-14,(R-190)*val/5,8,4);ctx.fill();});
  sig(80,H-SAFE_B-24,"l","rgba(255,255,255,.75)",26);
}

/* ===== 4 · الدرجة الدائرية ===== */
function T4(r,I,D){
  cover(I[0],0,0,W,H,.5);
  ctx.fillStyle="rgba(8,6,4,.5)";ctx.fillRect(0,0,W,H);
  const v=score6(r),cx=W/2,cy=H*.40,rad=210;
  ctx.lineWidth=26;ctx.lineCap="round";
  ctx.strokeStyle="rgba(255,255,255,.18)";
  ctx.beginPath();ctx.arc(cx,cy,rad,Math.PI*.75,Math.PI*2.25);ctx.stroke();
  const c=ramp(v/10);ctx.strokeStyle=rgb(c);
  ctx.beginPath();ctx.arc(cx,cy,rad,Math.PI*.75,Math.PI*.75+Math.PI*1.5*(v/10));ctx.stroke();
  ltr();ctx.textAlign="center";sh(20,.7,4);
  ctx.font='500 150px Tajawal';ctx.fillStyle="#fff";ctx.fillText(v.toFixed(2),cx,cy+34);
  ctx.font='400 32px Tajawal';ctx.fillStyle="rgba(255,255,255,.6)";ctx.fillText("الأداء من ١٠",cx,cy+92);nosh();
  let y=cy+rad+96;
  ctx.textAlign="center";ctx.font='600 30px "Readex Pro"';ctx.letterSpacing="6px";
  sh(14,.7,3);ctx.fillStyle="rgba(255,255,255,.65)";ctx.fillText(r.b.toUpperCase(),cx,y);ctx.letterSpacing="0px";y+=84;
  ctx.font='600 90px Caveat';ctx.fillStyle="#fff";ctx.fillText(r.n,cx,y);nosh();y+=80;
  const chips=[[r.l,"الثبات"],[r.p,"الفوحان"],[r.c,"المجتمع"]];
  const cw=250,gap=18,tot=chips.length*cw+(chips.length-1)*gap;let x=cx-tot/2;
  chips.forEach(([val,lab])=>{
    ctx.fillStyle="rgba(14,11,8,.6)";rr(x,y,cw,104,20);ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.15)";ctx.lineWidth=1.5;rr(x,y,cw,104,20);ctx.stroke();
    ltr();ctx.textAlign="center";ctx.font='500 42px Tajawal';ctx.fillStyle=rgb(ramp(val/5));
    ctx.fillText(val.toFixed(1),x+cw/2,y+52);
    ctx.font='400 25px Tajawal';ctx.fillStyle="rgba(255,255,255,.6)";ctx.fillText(lab,x+cw/2,y+86);x+=cw+gap;});
  sig(W/2+60,H-SAFE_B-30,"r","rgba(255,255,255,.8)",26);
}

/* ===== 5 · الهرم البطل ===== */
function T5(r,I,D){
  cover(I[0],0,0,W,H,.5);
  ctx.fillStyle="rgba(10,8,6,.72)";ctx.fillRect(0,0,W,H);
  const R=W-84;let y=SAFE_T+230;
  ltr();ctx.textAlign="right";ctx.font='600 28px "Readex Pro"';ctx.letterSpacing="5px";
  ctx.fillStyle="rgba(232,180,81,.85)";ctx.fillText(r.b.toUpperCase(),R,y);ctx.letterSpacing="0px";y+=80;
  ctx.font='600 92px Caveat';ctx.fillStyle="#fff";ctx.fillText(r.n,R,y);y+=110;
  const tiers=[["المقدمة","t","#E8C86A"],["القلب","m","#D98A9A"],["القاعدة","z","#8A6244"]]
    .filter(([,k])=>notes(r,k).length);
  tiers.forEach(([lab,k,c],i)=>{
    ctx.fillStyle=c;rr(R-6,y-34,6,54,3);ctx.fill();
    rtl();ctx.font='500 32px Tajawal';ctx.fillStyle=c;ctx.fillText(lab,R-28,y);y+=58;
    ctx.font='400 46px Tajawal';ctx.fillStyle="rgba(255,255,255,.95)";
    wrap(notes(r,k).slice(0,4).join("  ·  "),'400 46px Tajawal',W-190).forEach(l=>{ctx.fillText(l,R,y);y+=62;});
    y+=34;});
  y+=10;ctx.strokeStyle="rgba(255,255,255,.16)";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(84,y);ctx.lineTo(R,y);ctx.stroke();y+=72;
  const v=score6(r);
  rtl();ctx.font='400 44px Tajawal';ctx.fillStyle="rgba(255,255,255,.75)";ctx.fillText("الأداء",R,y);
  ltr();ctx.textAlign="left";ctx.font='500 96px Tajawal';ctx.fillStyle="#E8B451";ctx.fillText(v.toFixed(2),84,y+8);
  sig(R,H-SAFE_B-30,"r",null,26);
}
