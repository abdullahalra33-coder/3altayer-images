/* ===== 11 · مقارنة — هذا ولا هذا؟ ===== */
function C1(rs,I,D){
  const [a,b]=rs,mid=H/2;
  cover(I[0],0,0,W,mid,.45);
  cover(I[1],0,mid,W,H-mid,.45);
  vgrad(0,0,W,mid,"rgba(8,6,4,.72)","rgba(8,6,4,.42)");
  vgrad(0,mid,W,H-mid,"rgba(8,6,4,.42)","rgba(8,6,4,.78)");
  ctx.fillStyle="#E8B451";ctx.fillRect(0,mid-3,W,6);
  const R=W-72;
  [[a,SAFE_T+150,1],[b,mid+130,2]].forEach(([r,y0])=>{
    let y=y0;
    ltr();ctx.textAlign="right";ctx.font='600 26px "Readex Pro"';ctx.letterSpacing="5px";
    sh(14,.7,3);ctx.fillStyle="rgba(255,255,255,.66)";ctx.fillText(r.b.toUpperCase(),R,y);
    ctx.letterSpacing="0px";y+=74;
    ctx.font='600 82px Caveat';ctx.fillStyle="#fff";ctx.fillText(r.n,R,y);nosh();y+=60;
    rtl();ctx.font='400 32px Tajawal';sh(12,.7,2);ctx.fillStyle="rgba(255,255,255,.8)";
    ctx.fillText(notes(r,"t").concat(notes(r,"m"),notes(r,"z")).slice(0,3).join(" · "),R,y);nosh();
    const v=score6(r);
    ltr();ctx.textAlign="left";ctx.font='500 132px Tajawal';sh(18,.7,4);
    ctx.fillStyle=rgb(ramp(v/10));ctx.fillText(v.toFixed(2),72,y0+120);nosh();
    ctx.font='400 25px Tajawal';ctx.fillStyle="rgba(255,255,255,.55)";ctx.fillText("الأداء",72,y0+158);
    ctx.font='400 27px Tajawal';ctx.fillStyle="rgba(255,255,255,.7)";
    ctx.fillText("ثبات "+r.l.toFixed(1)+" · فوحان "+r.p.toFixed(1),72,y0+204);
    ltr();ctx.textAlign="left";ctx.font='500 30px Tajawal';ctx.fillStyle="#E8B451";
    ctx.fillText((r.r||"—")+" ر.س",72,y0+250);
  });
  // VS badge
  ctx.fillStyle="#E8B451";ctx.beginPath();ctx.arc(W/2,mid,72,0,7);ctx.fill();
  ltr();ctx.textAlign="center";ctx.font='600 46px "Readex Pro"';ctx.fillStyle="#1A1409";
  ctx.fillText("VS",W/2,mid+16);
  rtl();ctx.textAlign="center";ctx.font='500 44px Tajawal';sh(16,.75,3);
  ctx.fillStyle="#fff";ctx.fillText("أيهم تختار؟ صوّت بالرد",W/2,H-SAFE_B-56);nosh();
  sig(W/2+56,H-SAFE_B-4,"r",null,24);
}

/* ===== 12 · توب ٥ ===== */
function C2(rs,I,D){
  ctx.fillStyle="#14110C";ctx.fillRect(0,0,W,H);
  cover(I[0],0,0,W,520,.4);
  vgrad(0,120,W,400,"rgba(20,17,12,.25)","rgba(20,17,12,1)");
  const R=W-84;let y=SAFE_T+140;
  rtl();ctx.font='500 34px Tajawal';ctx.fillStyle="#E8B451";ctx.fillText("توب ٥ · هذا الأسبوع",R,y);y+=92;
  ctx.font='700 84px Tajawal';ctx.fillStyle="#fff";ctx.fillText("أقوى عطور العود",R,y);y+=54;
  ctx.font='300 30px Tajawal';ctx.fillStyle="rgba(255,255,255,.55)";
  ctx.fillText("مرتّبة بالأداء · كلها متوفرة عندنا",R,y);y+=96;
  rs.slice(0,5).forEach((r,i)=>{
    const v=score6(r),c=ramp(v/10);
    ctx.fillStyle=i===0?"rgba(232,180,81,.13)":"rgba(255,255,255,.045)";
    rr(84,y-52,W-168,140,20);ctx.fill();
    if(i===0){ctx.strokeStyle="rgba(232,180,81,.45)";ctx.lineWidth=2;rr(84,y-52,W-168,140,20);ctx.stroke();}
    ltr();ctx.textAlign="center";ctx.font='700 60px Tajawal';
    ctx.fillStyle=i===0?"#E8B451":"rgba(255,255,255,.22)";ctx.fillText(String(i+1),W-152,y+22);
    ltr();ctx.textAlign="right";ctx.font='600 44px Caveat';ctx.fillStyle="#fff";
    ctx.fillText(r.n,W-230,y+2);
    rtl();ctx.font='300 25px Tajawal';ctx.fillStyle="rgba(255,255,255,.5)";
    ctx.fillText(r.b+"  ·  "+(r.r||"—")+" ر.س",W-230,y+42);
    ltr();ctx.textAlign="left";ctx.font='500 52px Tajawal';ctx.fillStyle=rgb(c);
    ctx.fillText(v.toFixed(2),124,y+16);
    ctx.fillStyle="rgba(255,255,255,.14)";rr(124,y+34,150,7,4);ctx.fill();
    ctx.fillStyle=rgb(c);rr(124,y+34,150*v/10,7,4);ctx.fill();
    y+=164;});
  sig(W-84,H-SAFE_B-30,"r",null,26);
}

/* ===== 13 · خمّن العطر ===== */
function C3(r,I,D){
  ctx.fillStyle="#0E0B08";ctx.fillRect(0,0,W,H);
  ctx.save();ctx.filter="blur(26px) brightness(.55)";
  cover(I[0],0,0,W,H,.5);ctx.restore();
  ctx.fillStyle="rgba(12,9,7,.42)";ctx.fillRect(0,0,W,H);
  const R=W-90;let y=SAFE_T+200;
  rtl();ctx.textAlign="center";
  ctx.font='700 110px Tajawal';sh(20,.7,4);ctx.fillStyle="#E8B451";ctx.fillText("خمّن العطر",W/2,y);nosh();y+=64;
  ctx.font='300 32px Tajawal';ctx.fillStyle="rgba(255,255,255,.6)";
  ctx.fillText("الجواب بالستوري الجاي",W/2,y);y+=110;
  const box=(lab,arr,col)=>{
    const lines=wrap(arr.slice(0,4).join("  ·  "),'400 40px Tajawal',W-260);
    const h=96+lines.length*54;
    ctx.fillStyle="rgba(255,255,255,.05)";rr(90,y,W-180,h,22);ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.12)";ctx.lineWidth=1.5;rr(90,y,W-180,h,22);ctx.stroke();
    ctx.fillStyle=col;rr(W-90-6,y+22,6,h-44,3);ctx.fill();
    rtl();ctx.textAlign="right";ctx.font='500 28px Tajawal';ctx.fillStyle=col;ctx.fillText(lab,W-124,y+56);
    ctx.font='400 40px Tajawal';ctx.fillStyle="rgba(255,255,255,.95)";
    lines.forEach((l,i)=>ctx.fillText(l,W-124,y+108+i*54));
    y+=h+26;};
  if(notes(r,"t").length)box("المقدمة",notes(r,"t"),"#E8C86A");
  if(notes(r,"m").length)box("القلب",notes(r,"m"),"#D98A9A");
  if(notes(r,"z").length)box("القاعدة",notes(r,"z"),"#8A6244");
  y+=24;
  rtl();ctx.textAlign="center";ctx.font='400 34px Tajawal';ctx.fillStyle="rgba(255,255,255,.72)";
  ctx.fillText([dv(D,"g",r.g),dv(D,"e",r.e),r.y].filter(Boolean).join("   ·   "),W/2,y);y+=70;
  ctx.font='500 40px Tajawal';ctx.fillStyle="#E8B451";ctx.fillText("ردّ عليّ بالاسم ↩",W/2,y);
  sig(W/2+56,H-SAFE_B-30,"r",null,26);
}

/* ===== 14 · بميزانية ===== */
function C4(rs,I,D){
  ctx.fillStyle="#151109";ctx.fillRect(0,0,W,H);
  vgrad(0,0,W,H,"#1E1710","#0F0C07");
  const R=W-84;let y=SAFE_T+150;
  rtl();ctx.font='500 32px Tajawal';ctx.fillStyle="#E8B451";ctx.fillText("دليل الشراء",R,y);y+=104;
  ctx.font='700 96px Tajawal';ctx.fillStyle="#fff";ctx.fillText("تحت ٤٠٠ ريال",R,y);y+=58;
  ctx.font='300 30px Tajawal';ctx.fillStyle="rgba(255,255,255,.55)";
  ctx.fillText("ثلاثة ما راح تندم عليها",R,y);y+=80;
  rs.slice(0,3).forEach((r,i)=>{
    const v=score6(r),c=ramp(v/10),CH=352;
    ctx.fillStyle="rgba(255,255,255,.05)";rr(84,y,W-168,CH,26);ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.1)";ctx.lineWidth=1.5;rr(84,y,W-168,CH,26);ctx.stroke();
    ctx.save();ctx.beginPath();rr(112,y+28,236,CH-56,18);ctx.clip();
    cover(I[i],112,y+28,236,CH-56,.45);ctx.restore();
    const tx=W-118;let ty=y+82;
    ltr();ctx.textAlign="right";ctx.font='600 24px "Readex Pro"';ctx.letterSpacing="4px";
    ctx.fillStyle="rgba(232,180,81,.9)";ctx.fillText(r.b.toUpperCase(),tx,ty);ctx.letterSpacing="0px";ty+=64;
    ctx.font='600 62px Caveat';ctx.fillStyle="#fff";ctx.fillText(r.n,tx,ty);ty+=52;
    rtl();ctx.font='300 26px Tajawal';ctx.fillStyle="rgba(255,255,255,.6)";
    ctx.fillText(notes(r,"t").concat(notes(r,"m"),notes(r,"z")).slice(0,3).join(" · "),tx,ty);ty+=64;
    ltr();ctx.textAlign="right";ctx.font='500 62px Tajawal';ctx.fillStyle="#E8B451";
    ctx.fillText(String(r.r||0),tx,ty);const pw=ctx.measureText(String(r.r||0)).width;
    ctx.font='400 26px Tajawal';ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillText("ر.س",tx-pw-10,ty);
    ctx.textAlign="left";ctx.font='500 46px Tajawal';ctx.fillStyle=rgb(c);ctx.fillText(v.toFixed(2),396,ty);
    ctx.font='400 22px Tajawal';ctx.fillStyle="rgba(255,255,255,.45)";ctx.fillText("الأداء",396,ty+30);
    y+=CH+28;});
  sig(R,H-SAFE_B-26,"r",null,26);
}

/* ===== 15 · نوتة الأسبوع ===== */
function C5(rs,I,D){
  ctx.fillStyle="#120E09";ctx.fillRect(0,0,W,H);
  cover(I[0],0,0,W,H,.5);
  ctx.fillStyle="rgba(14,10,7,.82)";ctx.fillRect(0,0,W,H);
  const R=W-84;let y=SAFE_T+170;
  rtl();ctx.font='500 32px Tajawal';ctx.fillStyle="#8A6244";ctx.fillText("نوتة الأسبوع",R,y);y+=130;
  ctx.font='700 150px Tajawal';sh(24,.6,6);ctx.fillStyle="#E8B451";ctx.fillText("العُود",R,y);nosh();y+=70;
  ctx.font='300 34px Tajawal';ctx.fillStyle="rgba(255,255,255,.62)";
  wrap("دخاني وراتنجي وثقيل. يفتح حاد وبعد ساعة يلين ويصير دفا. أقوى نوتة تعلّم عليك.",'300 34px Tajawal',W-200)
    .forEach(l=>{ctx.fillText(l,R,y);y+=48;});
  y+=40;ctx.strokeStyle="rgba(232,180,81,.3)";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(84,y);ctx.lineTo(R,y);ctx.stroke();y+=70;
  rtl();ctx.font='500 40px Tajawal';ctx.fillStyle="#fff";ctx.fillText("أربعة تلقاه فيها",R,y);y+=76;
  rs.slice(0,4).forEach(r=>{
    const v=score6(r);
    ctx.fillStyle="rgba(232,180,81,.9)";ctx.beginPath();ctx.arc(R-9,y-12,9,0,7);ctx.fill();
    ltr();ctx.textAlign="right";ctx.font='600 52px Caveat';ctx.fillStyle="#fff";ctx.fillText(r.n,R-38,y);
    const nw=ctx.measureText(r.n).width;
    rtl();ctx.font='300 26px Tajawal';ctx.fillStyle="rgba(255,255,255,.48)";ctx.fillText(r.b,R-52-nw,y);
    ltr();ctx.textAlign="left";ctx.font='500 44px Tajawal';ctx.fillStyle=rgb(ramp(v/10));
    ctx.fillText(v.toFixed(2),84,y);
    y+=82;});
  sig(R,H-SAFE_B-30,"r",null,26);
}
