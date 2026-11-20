// Shared clay-style 3D helpers: themes, materials, object makers.
import * as THREE from 'three';

export const THEMES = {
  A: { // HARDWARE: graphite, anodised metal, brushed aluminium, studio-lit. One signal accent (red) for state only.
    name:'A', hw:true, bg:'#0A0B0D', ground:'#13151A', zone:'#1C1F25', ink:'#E9ECEF', cream:'#D5D9DE', creamDark:'#8A9097', door:'#2B2F35',
    rough:.4, pipeOpacity:.9, shadow:.5,
    sky:'#8d9bb0', gnd:'#05060a', hemi:.22, sun:'#ffffff', sunI:2.1,
    stress:{warn:'#E0A030', stress:'#E5483A', broken:'#FF2A1F'},
    hue:{green:'#2FBF8A',amber:'#EBA82E',blue:'#4C8DFF',credit:'#6C95FF',gold:'#EBA82E',orange:'#F7931A',purple:'#A78BFA',slate:'#8A939D',cyan:'#34D1E6',red:'#E5586A',teal:'#2FBFB0'}
  },
  B: { // cool airy pastel / glass
    name:'B', bg:'#E8F1FB', ground:'#DCE9F8', zone:'#EBF3FC', ink:'#13233A', cream:'#FFFFFF', creamDark:'#D6E3F3', door:'#5A7396',
    rough:.38, pipeOpacity:.42, shadow:.14,
    sky:'#F4FAFF', gnd:'#9DB6D6', hemi:1.95, sun:'#FFFFFF', sunI:1.45,
    stress:{warn:'#F0B04A', stress:'#EE6F7B', broken:'#C23B5B'},
    hue:{green:'#6CCFB0',amber:'#F3B66B',blue:'#5B9BE8',credit:'#7AB4F5',gold:'#F2CE6B',orange:'#F59A78',purple:'#9C8CF0',slate:'#9FB1C8',cyan:'#62D1DE',red:'#F27F8B',teal:'#4FC9B2'}
  }
};
export const LEGACY_HUE = {'#00e5a0':'green','#f5a623':'amber','#4db8ff':'blue','#60a5fa':'credit','#fbbf24':'gold','#ff7043':'orange','#c084fc':'purple','#94a3b8':'slate','#67e8f9':'cyan','#f87171':'red','#34d399':'teal'};
export const hueOf = (T,legacy)=>T.hue[LEGACY_HUE[legacy.toLowerCase()]||'blue'];

/* Material registry so we can re-tint/dim/emit per object */
/* mute(): cap saturation + clamp lightness so every scene reads tonal (paper / stone / ink) with only a few accents. Idempotent. */
const mixHex=(a,b,t)=>'#'+new THREE.Color(a).lerp(new THREE.Color(b),t).getHexString();
const DONE=new Map();   // colours already converted by mute(): hwMat must not convert them twice
/* hardware material ramp: lightness of the requested tone picks the material family */
export function hwSpec(hex){
  const c=new THREE.Color(hex), hsl={}; c.getHSL(hsl); const l=hsl.l;
  let col,metal,r,ei=1.0,em=null,emI=0;
  if(hsl.s>.32 && l>.12){                                           // chromatic accent: deep anodised colour + a little emitted light
    const light=l>.72, hl={}; c.getHSL(hl,THREE.SRGBColorSpace);
    const cc=new THREE.Color().setHSL(hsl.h,Math.min(.44,hsl.s*.7),light?.58:Math.min(.38,Math.max(.27,hl.l*.62)),THREE.SRGBColorSpace);
    col='#'+cc.getHexString(); metal=light?.55:.9; r=light?.3:.28; em=col; emI=light?.3:.12; ei=1.1;
  }
  else if(l>=.78){ col='#A9AFB7'; metal=.95; r=.32; ei=.95; }
  else if(l>=.5){ col=mixHex('#5E656D',hex,.1); metal=.92; r=.4; ei=.95; }
  else if(l>=.3){ col=mixHex('#2E3238',hex,.12); metal=.85; r=.34; ei=1.0; }
  else if(l>=.14){ col='#17191D'; metal=.6; r=.42; ei=.9; }
  else { col='#0F1114'; metal=.55; r=.28; ei=.9; }
  return {col,metal,r,ei,em,emI};
}
export function hwMat(hex,rough){
  const q=DONE.get(String(hex).toLowerCase())||hwSpec(hex);
  const m=new THREE.MeshStandardMaterial({color:q.col,roughness:rough??q.r,metalness:q.metal,envMapIntensity:q.ei});
  if(q.em){ m.emissive=new THREE.Color(q.em); m.emissiveIntensity=q.emI; m.userData.emBase=new THREE.Color(q.em); m.userData.emI=q.emI; }
  return m;
}
/* mute(): in the hardware theme, maps a paint colour to its metal/anodised equivalent (for raw colours set per frame). */
export function mute(hex){ const q=hwSpec(hex); DONE.set(q.col.toLowerCase(),q); return q.col; }
export class Mats {
  constructor(T){ this.T=T; this.list=[]; }
  clay(hex,{rough,metal=0,emissive=0}={}){
    let m;
    if(this.T.hw){ m=hwMat(hex,rough); }
    else { hex=mute(hex); m=new THREE.MeshStandardMaterial({color:hex, roughness:rough??this.T.rough, metalness:metal}); }
    m.userData.base = m.color.clone();
    this.list.push(m); return m;
  }
}
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
/* studio(): filmic tone-mapping, image-based reflections and two cool rim lights behind the subject */
export function studio(renderer,scene,mobile,rims){
  rims=rims||['#cfe0ff','#ffffff'];
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.9;
  const pm=new THREE.PMREMGenerator(renderer); const env=new RoomEnvironment(renderer);
  scene.environment=pm.fromScene(env,.03).texture; pm.dispose();
  const r1=new THREE.DirectionalLight(rims[0],3.0); r1.position.set(-9,6,-10);
  const r2=new THREE.DirectionalLight(rims[1],2.0); r2.position.set(10,5,-8);
  scene.add(r1,r2);
}
const G = {}; // geometry cache
const geo = (k,f)=> G[k] || (G[k]=f());
const lighten=(hex,a)=>'#'+new THREE.Color(hex).lerp(new THREE.Color('#ffffff'),a).getHexString();
const darken =(hex,a)=>'#'+new THREE.Color(hex).lerp(new THREE.Color('#2a2118'),a).getHexString();

function mesh(g,m,{x=0,y=0,z=0,rx=0,ry=0,rz=0,cast=true}={}){ const o=new THREE.Mesh(g,m); o.position.set(x,y,z); o.rotation.set(rx,ry,rz); o.castShadow=cast; o.receiveShadow=true; return o; }
const box=(w,h,d)=>geo(`b${w},${h},${d}`,()=>roundBox(w,h,d));
function roundBox(w,h,d){ // chunky bevel look via slightly rounded extrude
  const r=Math.min(w,h,d)*0.035, s=new THREE.Shape();
  const x0=-w/2,x1=w/2,y0=-d/2,y1=d/2;
  s.moveTo(x0+r,y0); s.lineTo(x1-r,y0); s.quadraticCurveTo(x1,y0,x1,y0+r); s.lineTo(x1,y1-r); s.quadraticCurveTo(x1,y1,x1-r,y1); s.lineTo(x0+r,y1); s.quadraticCurveTo(x0,y1,x0,y1-r); s.lineTo(x0,y0+r); s.quadraticCurveTo(x0,y0,x0+r,y0);
  const bev=Math.min(.02,h*.1);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(h-2*bev,0.001),bevelEnabled:true,bevelThickness:bev,bevelSize:bev*.9,bevelSegments:1,curveSegments:2});
  g.rotateX(-Math.PI/2); g.translate(0,bev,0); // sits on y=0
  // extrude goes +z -> after rotateX(-90) goes +y? (z->y). ok; shape y -> -z
  g.computeVertexNormals(); return g;
}
const cyl=(rt,rb,h,seg=18)=>geo(`c${rt},${rb},${h},${seg}`,()=>{const g=new THREE.CylinderGeometry(rt,rb,h,seg); g.translate(0,h/2,0); return g;});
const sph=(r,ws=18,hs=12)=>geo(`s${r},${ws},${hs}`,()=>new THREE.SphereGeometry(r,ws,hs));
const tor=(R,r,seg=24,tub=10,arc=Math.PI*2)=>geo(`t${R},${r},${seg},${tub},${arc}`,()=>new THREE.TorusGeometry(R,r,tub,seg,arc));

function textTexture(txt,{bg,fg,font='700 150px Georgia, serif',size=256}={}){
  const c=document.createElement('canvas'); c.width=c.height=size; const x=c.getContext('2d');
  x.fillStyle=bg; x.fillRect(0,0,size,size); x.strokeStyle=fg; x.lineWidth=10; x.beginPath(); x.arc(size/2,size/2,size*.38,0,7); x.stroke();
  x.fillStyle=fg; x.font=font; x.textAlign='center'; x.textBaseline='middle'; x.fillText(txt,size/2,size/2+size*.04);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t;
}

/* ---------- 12 chamber illustrations (each ~1 unit tall, footprint ≤ 0.8) ---------- */
export function makeChamber(key, color, T, mats){
  const g = new THREE.Group(); g.userData.spin=[]; g.userData.bob=[];
  const C=(h,o)=>mats.clay(h,o);
  const cream=C(T.cream), creamD=C(T.creamDark), acc=C(color), accL=C(lighten(color,.4)), accD=C(darken(color,.25)), door=C(T.door);
  const add=(o)=>{g.add(o);return o;};
  const col=(x,z,h=.36,r=.045)=>add(mesh(cyl(r,r,h,10),cream,{x,z,y:.12}));
  switch(key){
    case 'households':{
      add(mesh(box(.62,.4,.5),cream,{y:.12}));
      add(mesh(geo('roof4',()=>{const gg=new THREE.ConeGeometry(.5,.32,4); gg.rotateY(Math.PI/4); gg.translate(0,.16,0); return gg;}),acc,{y:.52}));
      add(mesh(box(.12,.2,.04),door,{y:.12,z:.26}));
      add(mesh(box(.1,.22,.1),accD,{x:.2,z:-.1,y:.6}));
      break;}
    case 'firms':{
      add(mesh(box(.86,.36,.5),cream,{y:.12}));
      for(let i=0;i<3;i++) add(mesh(geo('prism',()=>{const gg=new THREE.CylinderGeometry(.14,.14,.5,3); gg.rotateX(-Math.PI/2); return gg;}),acc,{x:-.27+i*.27,y:.58,rz:0}));
      add(mesh(cyl(.07,.08,.5,10),accD,{x:.32,z:-.12,y:.46}));
      add(mesh(sph(.09),creamD,{x:.34,y:1.05,z:-.12}));
      break;}
    case 'banks':{
      add(mesh(box(.84,.07,.58),creamD,{y:.1}));
      [-.3,-.1,.1,.3].forEach(x=>col(x,.12,.34));
      [-.3,-.1,.1,.3].forEach(x=>col(x,-.12,.34));
      add(mesh(box(.84,.07,.58),cream,{y:.46}));
      add(mesh(geo('ped',()=>{const gg=new THREE.CylinderGeometry(.3,.3,.58,3); gg.rotateX(-Math.PI/2); gg.scale(1.6,.45,1); gg.translate(0,.0675,0); return gg;}),acc,{y:.53}));
      // deposit tank (visible level) placed by caller via group.userData
      break;}
    case 'fed':{
      add(mesh(box(.84,.07,.58),creamD,{y:.1}));
      [-.3,-.1,.1,.3].forEach(x=>col(x,.12,.3));
      [-.3,-.1,.1,.3].forEach(x=>col(x,-.12,.3));
      add(mesh(box(.84,.07,.58),cream,{y:.42}));
      add(mesh(geo('dome',()=>new THREE.SphereGeometry(.3,20,10,0,Math.PI*2,0,Math.PI/2)),acc,{y:.48}));
      add(mesh(cyl(.035,.035,.14,8),accD,{y:.78}));
      // rate dial (rotates with slider)
      const dial=new THREE.Group(); dial.position.set(.5,.2,.55);
      dial.add(mesh(geo('dialc',()=>{const gg=new THREE.CylinderGeometry(.2,.2,.07,28); gg.rotateX(Math.PI/2); return gg;}),cream));
      const hand=mesh(box(.05,.17,.05),accD,{y:.08,z:.05}); hand.position.set(0,0,.06); hand.geometry=geo('hand',()=>{const gg=new THREE.BoxGeometry(.045,.17,.04); gg.translate(0,.085,0); return gg;});
      dial.add(hand); g.add(dial); g.userData.dial=hand;
      break;}
    case 'treasury':{ // vault
      add(mesh(cyl(.4,.42,.56,26),cream,{y:.1}));
      add(mesh(tor(.24,.05,28,10),accD,{y:.4,z:.4,cast:false}));
      add(mesh(geo('vd',()=>{const gg=new THREE.CylinderGeometry(.2,.2,.05,24); gg.rotateX(Math.PI/2); return gg;}),acc,{y:.4,z:.4}));
      for(let i=0;i<3;i++){ const a=i*Math.PI*2/3; add(mesh(box(.05,.26,.05),creamD,{y:.4,z:.43,rz:a})); }
      add(mesh(cyl(.33,.33,.06,26),accL,{y:.66}));
      break;}
    case 'government':{ // clipboard
      const b=new THREE.Group(); b.rotation.x=-.28; b.position.set(0,.5,0);
      b.add(mesh(box(.58,.08,.76),creamD,{}));
      const sheet=mesh(box(.5,.06,.68),cream,{y:.06}); b.add(sheet);
      b.add(mesh(box(.28,.08,.1),accD,{y:.1,z:-.36}));
      for(let i=0;i<4;i++) b.add(mesh(box(.34-i*.03,.03,.04),i==3?acc:accL,{y:.1,z:-.2+i*.15}));
      g.add(b); add(mesh(box(.24,.2,.2),acc,{y:.12,z:.25,cast:true}));
      break;}
    case 'repo':{ // cycling ring
      const ring=new THREE.Group(); ring.position.y=.5;
      const t=mesh(tor(.33,.07,40,12),acc,{rx:Math.PI/2}); ring.add(t);
      ring.add(mesh(geo('cone8',()=>new THREE.ConeGeometry(.12,.24,10)),accD,{x:.33,rz:-Math.PI/2})); // arrow
      ring.add(mesh(geo('cone8',()=>new THREE.ConeGeometry(.12,.24,10)),accD,{x:-.33,rz:Math.PI/2}));
      g.add(ring); g.userData.spin.push([ring,.9]);
      add(mesh(cyl(.06,.1,.3,10),creamD,{y:.1}));
      break;}
    case 'moneymkt':{ // coin stacks
      [[-.18,-.05,6],[.14,.1,4],[.1,-.2,3]].forEach(([x,z,n],j)=>{
        for(let i=0;i<n;i++) add(mesh(cyl(.2,.2,.07,24),i%2?acc:accL,{x,z,y:.1+i*.075}));
      });
      break;}
    case 'oil':{ // barrel + drop
      add(mesh(cyl(.26,.26,.6,22),acc,{y:.1}));
      [.26,.52].forEach(y=>add(mesh(tor(.262,.025,26,8),accD,{rx:Math.PI/2,y:.1+y})));
      add(mesh(cyl(.2,.2,.04,20),creamD,{y:.7}));
      const drop=new THREE.Group(); drop.position.set(0,1.0,0);
      drop.add(mesh(sph(.11),accD,{y:0})); drop.add(mesh(geo('cone9',()=>new THREE.ConeGeometry(.1,.2,14)),accD,{y:.14}));
      g.add(drop); g.userData.bob.push([drop,.05]);
      break;}
    case 'fx':{ // $ coin
      const tex=textTexture('$',{bg:lighten(color,.45),fg:darken(color,.45)});
      const face=new THREE.MeshStandardMaterial({map:tex,roughness:T.rough}); mats.list.push(face); face.userData.base=new THREE.Color('#ffffff');
      const coin=mesh(geo('coin',()=>new THREE.CylinderGeometry(.38,.38,.1,36)),[acc,face,face]);
      coin.rotation.x=Math.PI/2; const holder=new THREE.Group(); holder.position.y=.62; holder.add(coin); g.add(holder); g.userData.spin.push([holder,.7]);
      add(mesh(cyl(.07,.1,.3,10),creamD,{y:.1}));
      break;}
    case 'foreign':{ // globe
      const globe=new THREE.Group(); globe.position.y=.6; 
      globe.add(mesh(sph(.34,24,16),accL));
      globe.add(mesh(tor(.35,.022,40,6),accD,{rx:Math.PI/2}));
      globe.add(mesh(tor(.35,.022,40,6),accD,{ry:Math.PI/2}));
      globe.add(mesh(sph(.12,10,8),acc,{x:.22,y:.18,z:.2}));
      globe.add(mesh(sph(.09,10,8),acc,{x:-.2,y:-.1,z:.25}));
      g.add(globe); g.userData.spin.push([globe,.5]);
      add(mesh(cyl(.07,.1,.18,10),creamD,{y:.1}));
      break;}
    case 'consumers_credit':{ // card
      const card=new THREE.Group(); card.position.y=.55; card.rotation.set(-.5,.3,.12);
      card.add(mesh(box(.7,.05,.44),acc,{}));
      card.add(mesh(box(.7,.052,.08),accD,{z:-.08}));
      card.add(mesh(box(.14,.06,.1),cream,{x:-.2,z:.1}));
      card.add(mesh(box(.2,.055,.035),accL,{x:.15,z:.16}));
      g.add(card); g.userData.bob.push([card,.04]);
      add(mesh(cyl(.05,.08,.32,10),creamD,{y:.1}));
      break;}
    default:{ add(mesh(sph(.3),acc,{y:.5})); }
  }
  return g;
}

/* ---------- chapter-level illustrations for the hero ---------- */
export function makeChapterIcon(key, color, T, mats){
  const g=new THREE.Group(); g.userData.spin=[]; g.userData.bob=[];
  const C=(h,o)=>mats.clay(h,o); const cream=C(T.cream), creamD=C(T.creamDark), acc=C(color), accL=C(lighten(color,.45)), accD=C(darken(color,.25)), ink=C(T.ink);
  const add=(o)=>{g.add(o);return o;};
  switch(key){
    case 'ideas': { // stack of books + column
      add(mesh(box(.9,.16,.6),acc,{y:.1})); add(mesh(box(.8,.15,.54),accL,{y:.26,ry:.12})); add(mesh(box(.72,.14,.5),accD,{y:.41,ry:-.1}));
      add(mesh(box(.6,.13,.42),cream,{y:.55,ry:.2}));
      add(mesh(cyl(.06,.06,.5,12),creamD,{x:-.5,z:-.2,y:.1})); add(mesh(sph(.1),acc,{x:-.5,z:-.2,y:.68}));
      break; }
    case 'machine': { // pipe junction
      add(mesh(cyl(.13,.13,.7,16),acc,{x:-.3,y:.1}));
      add(mesh(geo('hp',()=>{const gg=new THREE.CylinderGeometry(.13,.13,.9,16); gg.rotateZ(Math.PI/2); return gg;}),accL,{x:.1,y:.78}));
      add(mesh(sph(.19,16,12),accD,{x:-.3,y:.78}));
      add(mesh(cyl(.13,.13,.45,16),acc,{x:.5,y:.4,}));
      add(mesh(sph(.16,16,12),accD,{x:.5,y:.78}));
      add(mesh(tor(.17,.04,20,8),creamD,{rx:Math.PI/2,x:-.3,y:.3}));
      add(mesh(tor(.17,.04,20,8),creamD,{rx:Math.PI/2,x:.5,y:.5}));
      break; }
    case 'trap': { // padlock
      add(mesh(box(.7,.5,.34),acc,{y:.1}));
      add(mesh(tor(.2,.055,24,10,Math.PI),creamD,{y:.6,rz:0}));
      add(mesh(cyl(.07,.07,.12,12),accD,{y:.6-.0,x:-.2,z:0,cast:false}));
      add(mesh(geo('kh',()=>{const gg=new THREE.CylinderGeometry(.06,.06,.04,16); gg.rotateX(Math.PI/2); return gg;}),ink,{y:.38,z:.18}));
      add(mesh(box(.035,.14,.04),ink,{y:.27,z:.18}));
      break; }
    case 'exit': { // arch door + coin
      add(mesh(box(.84,.7,.3),cream,{y:.1}));
      add(mesh(geo('archtop',()=>{const gg=new THREE.CylinderGeometry(.42,.42,.3,28,1,false,0,Math.PI); gg.rotateX(Math.PI/2); return gg;}),cream,{y:.8}));
      add(mesh(box(.4,.55,.06),accD,{y:.1,z:.15}));
      add(mesh(geo('archin',()=>{const gg=new THREE.CylinderGeometry(.2,.2,.06,24,1,false,0,Math.PI); gg.rotateX(Math.PI/2); return gg;}),accD,{y:.65,z:.15}));
      const tex=textTexture('₿',{bg:lighten(color,.35),fg:darken(color,.45),font:'700 160px Arial, sans-serif'});
      const face=new THREE.MeshStandardMaterial({map:tex,roughness:T.rough}); mats.list.push(face); face.userData.base=new THREE.Color('#fff');
      const coin=mesh(geo('coin2',()=>new THREE.CylinderGeometry(.24,.24,.07,32)),[acc,face,face]); coin.rotation.x=Math.PI/2; const h=new THREE.Group(); h.position.set(.62,.85,.2); h.add(coin); g.add(h); g.userData.spin.push([h,.8]);
      break; }
    case 'detour': { // diamond on a small plinth
      add(mesh(cyl(.3,.34,.1,6),creamD,{y:.1}));
      const d=new THREE.Group(); d.position.y=.65; d.add(mesh(geo('oct',()=>new THREE.OctahedronGeometry(.3,0)),acc,{})); d.scale.y=1.35;
      g.add(d); g.userData.spin.push([d,.8]); g.userData.bob.push([d,.04]);
      add(mesh(tor(.34,.02,28,6),accL,{rx:Math.PI/2,y:.62}));
      break; }
  }
  return g;
}

export { lighten, darken };
