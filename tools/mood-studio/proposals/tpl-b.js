/* ===== 6 · الملصق — البراند عمودي عملاق ===== */
function T6(r,I,D){
  cover(I[0],0,0,W,H,.5);
  ctx.fillStyle="rgba(12,9,7,.55)";ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(96,H/2);ctx.rotate(-Math.PI/2);
  ltr();ctx.textAlign="center";ctx.font='600 108px "Readex Pro"';ctx.letterSpacing="14px";
  ctx.fillStyle="rgba(255,255,255,.10)";ctx.fillText(r.b.toUpperCase(),0,0);
  ctx.letterSpacing="0px";ctx.restore();
  const R=W-84;let y=SAFE_T+250;
  ltr();ctx.textAlign="right";
  ctx.font='600 132px Caveat';sh(24,.75,5);ctx.fillStyle="#fff";
  wrap(r.n,'600 132px Caveat',W-260).forEach(l=>{ctx.fillText(l,R,y);y+=126;});nosh();
  y+=6;ctx.fillStyle="#E8B451";rr(R-190,y,190,7,4);ctx.fill();y+=94;
  const v=score6(r);
  ltr();ctx.textAlign="right";ctx.font='500 190px Tajawal';sh(22,.7,5);
  ctx.fillStyle="#E8B451";ctx.fillText(v.toFixed(2),R,y+50);nosh();
  rtl();ctx.font='400 34px Tajawal';ctx.fillStyle="rgba(255,255,255,.62)";ctx.fillText("الأداء من ١٠",R,y+108);
  y+=200;
  rtl();ctx.font='400 42px Tajawal';sh(16,.75,3);ctx.fillStyle="rgba(255,255,255,.95)";
  wrap("معرّس بشهر العسل وهو لسه ما سدّد المهر",'400 42px Tajawal',W-200).forEach(l=>{ctx.fillText(l,R,y);y+=56;});nosh();
  const by=H-SAFE_B-150;
  [["الثبات",r.l],["الفوحان",r.p],["المجتمع",r.c]].forEach(([lab,val],i)=>{
    const x=84+i*300;const c=ramp(val/5);
    ltr();ctx.textAlign="left";ctx.font='500 54px Tajawal';ctx.fillStyle=rgb(c);ctx.fillText(val.toFixed(1),x,by);
    ctx.font='400 24px Tajawal';ctx.fillStyle="rgba(255,255,255,.55)";ctx.fillText(lab,x,by+34);
    ctx.fillStyle="rgba(255,255,255,.18)";rr(x,by+50,220,7,4);ctx.fill();
    ctx.fillStyle=rgb(c);rr(x,by+50,220*val/5,7,4);ctx.fill();});
  sig(R,H-SAFE_B-30,"r",null,26);
}

/* ===== 7 · بطاقة السعر — للمتجر ===== */
function T7(r,I,D){
  ctx.fillStyle="#F3EFE7";ctx.fillRect(0,0,W,H);
  cover(I[0],0,0,W,Math.round(H*.5),.42);
  vgrad(0,Math.round(H*.5)-160,W,160,"rgba(243,239,231,0)","rgba(243,239,231,1)");
  let y=Math.round(H*.5)+40;const R=W-84;
  ltr();ctx.textAlign="right";ctx.font='600 26px "Readex Pro"';ctx.letterSpacing="5px";
  ctx.fillStyle="#9A7B3E";ctx.fillText(r.b.toUpperCase(),R,y);ctx.letterSpacing="0px";y+=76;
  ctx.font='600 86px Caveat';ctx.fillStyle="#221B12";ctx.fillText(r.n,R,y);y+=54;
  rtl();ctx.font='300 30px "Readex Pro"';ctx.fillStyle="#6B6155";
  ctx.fillText([dv(D,"g",r.g),dv(D,"e",r.e),r.y].filter(Boolean).join("  ·  "),R,y);y+=80;
  // price block
  ctx.fillStyle="#221B12";rr(84,y,W-168,190,24);ctx.fill();
  ltr();ctx.textAlign="right";ctx.font='500 104px Tajawal';ctx.fillStyle="#E8B451";
  ctx.fillText(String(r.r||0),R-40,y+118);
  const pw=ctx.measureText(String(r.r||0)).width;
  ctx.font='400 34px Tajawal';ctx.fillStyle="rgba(255,255,255,.7)";ctx.fillText("ر.س",R-52-pw,y+118);
  rtl();ctx.font='400 28px Tajawal';ctx.fillStyle="rgba(255,255,255,.55)";ctx.fillText("شامل الضريبة · متوفر الآن",R-40,y+164);
  const v=score6(r);
  ltr();ctx.textAlign="left";ctx.font='500 76px Tajawal';ctx.fillStyle="#fff";ctx.fillText(v.toFixed(2),124,y+110);
  ctx.font='400 25px Tajawal';ctx.fillStyle="rgba(255,255,255,.55)";ctx.fillText("تقييمي",124,y+152);
  y+=240;
  const tn=[...notes(r,"t"),...notes(r,"m"),...notes(r,"z")].slice(0,5);
  let cx=R;rtl();
  tn.forEach(t=>{ctx.font='400 28px Tajawal';const tw=ctx.measureText(t).width+40;
    if(cx-tw<84){cx=R;y+=62;}
    ctx.fillStyle="#E4DCCC";rr(cx-tw,y,tw,50,25);ctx.fill();
    ctx.fillStyle="#4A4136";ctx.fillText(t,cx-20,y+34);cx-=tw+12;});
  y+=100;
  [["الثبات",r.l],["الفوحان",r.p]].forEach(([lab,val],i)=>{
    const yy=y+i*58,c=ramp(val/5);
    rtl();ctx.font='400 28px Tajawal';ctx.fillStyle="#6B6155";ctx.fillText(lab,R,yy);
    ctx.fillStyle="#DED6C6";rr(84,yy-16,W-320,10,5);ctx.fill();
    ctx.fillStyle=rgb(c);rr(R-160-(W-320)*val/5,yy-16,(W-320)*val/5,10,5);ctx.fill();
    ltr();ctx.textAlign="left";ctx.font='500 26px Tajawal';ctx.fillStyle=rgb(c.map(x=>Math.round(x*.8)));
    ctx.fillText(val.toFixed(1),84,yy-24);});
  sig(R,H-SAFE_B-26,"r","#221B12",26);
}

/* ===== 8 · الإيصال ===== */
function T8(r,I,D){
  cover(I[0],0,0,W,H,.5);
  ctx.fillStyle="rgba(10,8,6,.72)";ctx.fillRect(0,0,W,H);
  const X=110,CW=W-220,TOP=SAFE_T+150;
  const v=score6(r);
  const lines=[["البراند",r.b],["العطر",r.n],["السنة",r.y||"—"],["الفئة",dv(D,"g",r.g)],
    ["الموسم",dv(D,"e",r.e)],["الثبات",r.l.toFixed(1)+" / 5"],["الفوحان",r.p.toFixed(1)+" / 5"],
    ["المجتمع",r.c.toFixed(1)+" / 5"],["السعر",(r.r||"—")+" ر.س"]];
  const CH=TOP+120+lines.length*54+230;
  ctx.fillStyle="#F6F2E9";
  ctx.beginPath();
  const teeth=22,tw=CW/teeth;
  ctx.moveTo(X,TOP);
  for(let i=0;i<teeth;i++)ctx.quadraticCurveTo(X+tw*(i+.5),TOP-14,X+tw*(i+1),TOP);
  ctx.lineTo(X+CW,CH);
  for(let i=teeth;i>0;i--)ctx.quadraticCurveTo(X+tw*(i-.5),CH+14,X+tw*(i-1),CH);
  ctx.closePath();sh(30,.5,10);ctx.fill();nosh();
  let y=TOP+80;
  ltr();ctx.textAlign="center";ctx.font='600 30px "Readex Pro"';ctx.letterSpacing="7px";
  ctx.fillStyle="#221B12";ctx.fillText("3ALTAYER",W/2,y);ctx.letterSpacing="0px";y+=44;
  ctx.font='400 24px Tajawal';ctx.fillStyle="#8A8074";ctx.fillText("تقييم اليوم ٥٠",W/2,y);y+=52;
  ctx.strokeStyle="#CFC6B4";ctx.lineWidth=2;ctx.setLineDash([8,8]);
  ctx.beginPath();ctx.moveTo(X+40,y);ctx.lineTo(X+CW-40,y);ctx.stroke();ctx.setLineDash([]);y+=48;
  lines.forEach(([k,val])=>{
    rtl();ctx.font='400 29px Tajawal';ctx.fillStyle="#6B6155";ctx.fillText(k,X+CW-46,y);
    ltr();ctx.textAlign="left";ctx.font='500 29px Tajawal';ctx.fillStyle="#221B12";ctx.fillText(String(val),X+46,y);
    y+=54;});
  y+=6;ctx.strokeStyle="#CFC6B4";ctx.setLineDash([8,8]);
  ctx.beginPath();ctx.moveTo(X+40,y);ctx.lineTo(X+CW-40,y);ctx.stroke();ctx.setLineDash([]);y+=76;
  rtl();ctx.font='500 40px Tajawal';ctx.fillStyle="#221B12";ctx.fillText("الإجمالي",X+CW-46,y);
  ltr();ctx.textAlign="left";ctx.font='500 76px Tajawal';ctx.fillStyle="#9A7B3E";ctx.fillText(v.toFixed(2),X+46,y+10);
  y+=76;
  ctx.textAlign="center";ctx.font='400 24px Tajawal';ctx.fillStyle="#8A8074";
  ctx.fillText("شكراً لزيارتك · ما فيه استرجاع على الآراء",W/2,y);
  sig(W/2+56,CH+70,"r","rgba(255,255,255,.85)",26);
}

/* ===== 9 · الشارة الجانبية ===== */
function T9(r,I,D){
  const railW=300;
  cover(I[0],railW,0,W-railW,H,.5);
  vgrad(railW,0,W-railW,H*.4,"rgba(8,6,4,.55)","rgba(8,6,4,0)");
  ctx.fillStyle="#15110C";ctx.fillRect(0,0,railW,H);
  ctx.fillStyle="#E8B451";ctx.fillRect(railW-4,0,4,H);
  let y=SAFE_T+120;const cx=railW/2;
  const v=score6(r);
  ltr();ctx.textAlign="center";ctx.font='500 96px Tajawal';ctx.fillStyle="#E8B451";ctx.fillText(v.toFixed(2),cx,y);
  ctx.font='400 24px Tajawal';ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillText("الأداء",cx,y+40);y+=110;
  ctx.strokeStyle="rgba(255,255,255,.14)";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(railW-40,y);ctx.stroke();y+=60;
  [["الثبات",r.l],["الفوحان",r.p],["المجتمع",r.c]].forEach(([lab,val])=>{
    const c=ramp(val/5);
    ctx.textAlign="center";ctx.font='500 46px Tajawal';ctx.fillStyle=rgb(c);ctx.fillText(val.toFixed(1),cx,y);
    ctx.font='400 23px Tajawal';ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillText(lab,cx,y+32);
    ctx.fillStyle="rgba(255,255,255,.16)";rr(46,y+50,railW-92,7,4);ctx.fill();
    ctx.fillStyle=rgb(c);rr(railW-46-(railW-92)*val/5,y+50,(railW-92)*val/5,7,4);ctx.fill();
    y+=112;});
  y+=10;ctx.strokeStyle="rgba(255,255,255,.14)";
  ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(railW-40,y);ctx.stroke();y+=56;
  rtl();ctx.textAlign="center";ctx.font='400 26px Tajawal';ctx.fillStyle="rgba(255,255,255,.75)";
  [dv(D,"g",r.g),dv(D,"e",r.e),r.y].filter(Boolean).forEach(t=>{ctx.fillText(t,cx,y);y+=42;});
  const R=W-72;let ty=H-SAFE_B-260;
  ltr();ctx.textAlign="right";ctx.font='600 26px "Readex Pro"';ctx.letterSpacing="5px";
  sh(14,.7,3);ctx.fillStyle="rgba(255,255,255,.68)";ctx.fillText(r.b.toUpperCase(),R,ty);ctx.letterSpacing="0px";ty+=78;
  ctx.font='600 82px Caveat';ctx.fillStyle="#fff";ctx.fillText(r.n,R,ty);nosh();ty+=64;
  rtl();ctx.font='400 34px Tajawal';sh(14,.75,3);ctx.fillStyle="rgba(255,255,255,.9)";
  wrap(notes(r,"t").concat(notes(r,"m"),notes(r,"z")).slice(0,4).join(" · "),'400 34px Tajawal',W-railW-140)
    .forEach(l=>{ctx.fillText(l,R,ty);ty+=46;});nosh();
  sig(R,H-SAFE_B-30,"r",null,26);
}

/* ===== 10 · الرقم الصريح ===== */
function T10(r,I,D){
  cover(I[0],0,0,W,H,.5);
  ctx.fillStyle="rgba(8,6,5,.62)";ctx.fillRect(0,0,W,H);
  const v=score6(r),c=ramp(v/10);
  ltr();ctx.textAlign="center";
  ctx.font='500 420px Tajawal';sh(40,.6,12);ctx.fillStyle=rgb(c);
  ctx.fillText(v.toFixed(1),W/2,H*.46);nosh();
  ctx.font='400 40px Tajawal';ctx.fillStyle="rgba(255,255,255,.55)";ctx.fillText("من ١٠",W/2,H*.46+64);
  let y=H*.46+170;
  ctx.textAlign="center";ctx.font='600 30px "Readex Pro"';ctx.letterSpacing="7px";
  sh(14,.7,3);ctx.fillStyle="rgba(255,255,255,.7)";ctx.fillText(r.b.toUpperCase(),W/2,y);ctx.letterSpacing="0px";y+=92;
  ctx.font='600 104px Caveat';ctx.fillStyle="#fff";ctx.fillText(r.n,W/2,y);nosh();y+=90;
  rtl();ctx.textAlign="center";ctx.font='400 40px Tajawal';sh(14,.75,3);
  ctx.fillStyle="rgba(255,255,255,.86)";ctx.fillText("ثبات "+r.l.toFixed(1)+"  ·  فوحان "+r.p.toFixed(1)+"  ·  مجتمع "+r.c.toFixed(1),W/2,y);
  nosh();
  sig(W/2+58,H-SAFE_B-40,"r",null,26);
}
