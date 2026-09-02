const W=1080,H=1920, SAFE_T=132, SAFE_B=210;
let ctx;
const AR="٠١٢٣٤٥٦٧٨٩", toAr=s=>String(s).replace(/[0-9]/g,d=>AR[+d]);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function rr(x,y,w,h,r){const q=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+q,y);
 ctx.arcTo(x+w,y,x+w,y+h,q);ctx.arcTo(x+w,y+h,x,y+h,q);ctx.arcTo(x,y+h,x,y,q);ctx.arcTo(x,y,x+w,y,q);ctx.closePath();}
function sh(b,a,d){ctx.shadowColor="rgba(0,0,0,"+a+")";ctx.shadowBlur=b;ctx.shadowOffsetY=d||0;}
function nosh(){ctx.shadowColor="transparent";ctx.shadowBlur=0;ctx.shadowOffsetY=0;}
const RAMP=[[0,[206,86,62]],[.4,[230,167,46]],[.58,[214,196,63]],[.76,[150,200,98]],[1,[56,166,84]]];
function ramp(t){t=clamp(t,0,1);for(let i=1;i<RAMP.length;i++){if(t<=RAMP[i][0]){const a=RAMP[i-1],b=RAMP[i],
 k=(t-a[0])/((b[0]-a[0])||1);return a[1].map((c,j)=>Math.round(c+(b[1][j]-c)*k));}}return RAMP[4][1];}
const rgb=c=>`rgb(${c[0]},${c[1]},${c[2]})`;
function wrap(t,f,mw){ctx.font=f;const o=[];for(const p of String(t).split("\n")){const w=p.trim().split(/\s+/).filter(Boolean);
 if(!w.length)continue;let l=w[0];for(let i=1;i<w.length;i++){const q=l+" "+w[i];
 if(ctx.measureText(q).width<=mw)l=q;else{o.push(l);l=w[i];}}o.push(l);}return o;}
function cover(img,x,y,w,h,fy){const k=Math.max(w/img.width,h/img.height);const dw=img.width*k,dh=img.height*k;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)*(fy===undefined?.5:fy),dw,dh);ctx.restore();}
function vgrad(x,y,w,h,c0,c1){const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,c0);g.addColorStop(1,c1);
 ctx.fillStyle=g;ctx.fillRect(x,y,w,h);}
const SNAP_P=new Path2D(SNAP_D);
function snapMark(cx,cy,s,col){ctx.save();sh(10,.55,2);const k=s/24;ctx.translate(cx-s/2,cy-s/2);ctx.scale(k,k);
 ctx.fillStyle=col||"#FFFC00";ctx.fill(SNAP_P);nosh();ctx.restore();}
function sig(x,y,side,col,size){const t="ARS.300";ctx.font='600 '+(size||28)+'px "Readex Pro",sans-serif';
 ctx.letterSpacing="1px";ctx.direction="ltr";ctx.textAlign=side==="r"?"right":"left";sh(12,.7,2);
 ctx.fillStyle=col||"rgba(255,255,255,.92)";ctx.fillText(t,x,y);const tw=ctx.measureText(t).width;nosh();
 ctx.letterSpacing="0px";snapMark(side==="r"?x-tw-14-16:x+tw+14+16,y-(size||28)*0.34,(size||28)*1.1);}
function notes(r,k){return String(r[k]||"").split("·").map(s=>s.trim()).filter(Boolean);}
function dv(D,f,i){return (i===null||i===undefined)?"":(D.d[f][i]||"");}
function score6(r){const l=Math.min(10,r.l*2+1),p=Math.min(10,r.p*2+1);
 return (l*25+p*20+8.5*20+8.5*15+8.5*10+8.5*10)/100;}
function rtl(){ctx.direction="rtl";ctx.textAlign="right";}
function ltr(){ctx.direction="ltr";ctx.textAlign="left";}
