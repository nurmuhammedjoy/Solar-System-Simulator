import"./modulepreload-polyfill-B5Qt9EMX.js";import{C as F,g as U,f as L,S as Z,P as ee,W as te,O as ne,A as oe,D as ae,R as ie,T as re,I as se,M,c as u,V as x,G as H,h as le,B as D,F as b,L as ce,i as de,a as me,b as fe,d as pe}from"./OrbitControls-B6hLOxaa.js";import{C as ue,a as we}from"./CSS2DRenderer-KcqUgwHa.js";function he({rimHex:e=35071,facingHex:n=0}={}){const o={color1:{value:new F(e)},color2:{value:new F(n)},fresnelBias:{value:.1},fresnelScale:{value:1},fresnelPower:{value:4}},t=`
  uniform float fresnelBias;
  uniform float fresnelScale;
  uniform float fresnelPower;
  
  varying float vReflectionFactor;
  
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  
    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  
    vec3 I = worldPosition.xyz - cameraPosition;
  
    vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
  
    gl_Position = projectionMatrix * mvPosition;
  }
  `,s=`
  uniform vec3 color1;
  uniform vec3 color2;
  
  varying float vReflectionFactor;
  
  void main() {
    float f = clamp( vReflectionFactor, 0.0, 1.0 );
    gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
  }
  `;return new U({uniforms:o,vertexShader:t,fragmentShader:s,transparent:!0,blending:L})}const c=new Z,a=new ee(60,window.innerWidth/window.innerHeight,.1,1e4);a.position.set(0,0,300);const w=new te({antialias:!0});w.setSize(window.innerWidth,window.innerHeight);document.body.appendChild(w.domElement);const r=new ue;r.setSize(window.innerWidth,window.innerHeight);r.domElement.style.position="absolute";r.domElement.style.top="0";r.domElement.style.pointerEvents="none";document.body.appendChild(r.domElement);const S=new ne(a,w.domElement);S.enableDamping=!0;S.dampingFactor=.05;c.add(new oe(16777215,.03));const _=new ae(16777215,.7);_.position.set(500,0,67);c.add(_);const i=document.createElement("div");i.style.position="absolute";i.style.top="0";i.style.left="0";i.style.color="lime";i.style.fontFamily="monospace";i.style.background="rgba(0,0,0,0.5)";i.style.padding="5px";document.body.appendChild(i);let G=performance.now(),P=0;const v=document.createElement("div");v.id="info-panel";v.innerHTML=`
  <h2 id="info-title" style="margin:0; font-size: 18px;"></h2>
  <p id="info-description" style="font-size: 14px;"></p>
`;v.style.cssText=`
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: white;
  background: rgba(0,0,0,0.6);
  padding: 10px;
  max-width: 300px;
  font-family: sans-serif;
  display: none;
`;document.body.appendChild(v);const f={earth:"/Solar-System-Simulator/texture/8081_earthmap4k.jpg",earthNight:"/Solar-System-Simulator/texture/8081_earthlights4k.jpg",earthCloud:"/Solar-System-Simulator/texture/8081_earthhiresclouds4K.png",moon:"/Solar-System-Simulator/texture/moonmap4k.jpg",moonBump:"/Solar-System-Simulator/texture/07_moonbump4k.jpg"},ye=new Map([["Earth",{title:"Earth",description:"Earth is the third planet from the Sun and the only astronomical object known to harbor life..."}],["Moon",{title:"Moon",description:"The Moon is Earth’s only natural satellite. It orbits Earth at an average distance of 384,399 km..."}]]);function ge({count:e=8e3,range:n=2e3,size:o=.7,sizeVariation:t=.5,colors:s=[16777215,16775620,13621468],twinkle:l=!0,animate:Y=!0}={}){const y=new D,I=[],T=[],W=[],g=new F;for(let m=0;m<e;m++){const $=(Math.random()-.5)*n,J=(Math.random()-.5)*n,Q=(Math.random()-.5)*n;I.push($,J,Q),T.push(o+Math.random()*t),g.setHex(s[Math.floor(Math.random()*s.length)]),W.push(g.r,g.g,g.b)}y.setAttribute("position",new b(I,3)),y.setAttribute("size",new b(T,1)),y.setAttribute("color",new b(W,3));const K=new me({vertexColors:!0,size:o,transparent:!0,opacity:.9,depthWrite:!1}),A=new fe(y,K);if(c.add(A),l&&Y){let m=function(){A.material.opacity=.7+Math.sin(Date.now()*.001)*.3,requestAnimationFrame(m)};m()}}ge();const R=new ie,B=[],p=new re,E=new se(7,16),be=new M({map:p.load(f.earth)}),xe=new M({map:p.load(f.earthNight),blending:L,transparent:!0}),Me=new M({map:p.load(f.earthCloud),blending:L,transparent:!0}),C=new u(E,be);C.name="Earth";B.push(C);const Se=new u(E.clone(),xe),ve=new u(E.clone(),Me),O=new u(E.clone(),he());O.scale.setScalar(1.01);function V(e,n){const o=document.createElement("div");o.textContent=e,o.style.color="white";const t=new we(o);return t.position.copy(n),t}C.add(V("Earth",new x(-5,11,0)));const h=new H;h.rotation.z=-23.4*Math.PI/180;h.add(C,Se,ve,O);c.add(h);const k=new H;h.add(k);const d=new u(new le(2,32,32),new M({map:p.load(f.moon),bumpMap:p.load(f.moonBump),bumpScale:.5}));d.name="Moon";d.position.set(50,0,0);d.add(V("Moon",new x(0,3,0)));k.add(d);B.push(d);const q=[],Ee=100,Ce=100,j=200;for(let e=0;e<=j;e++){const n=e/j*Math.PI*2;q.push(Ee*Math.cos(n),0,Ce*Math.sin(n))}const Pe=new D().setAttribute("position",new b(q,3));k.add(new ce(Pe,new de({color:16777215,linewidth:3,opacity:.1,transparent:!0})));let z=null;function N(e,n){const o=new pe(e/window.innerWidth*2-1,-(n/window.innerHeight)*2+1);R.setFromCamera(o,a);const[t]=R.intersectObjects(B,!0);t?(ze(t.object),clearTimeout(z)):(clearTimeout(z),z=setTimeout(()=>{document.getElementById("info-panel").style.display="none"},1e4))}function ze(e){const n=e.name||e.parent?.name,o=ye.get(n);if(!o)return;const t=new x;e.getWorldPosition(t);const s=new x().subVectors(a.position,t).normalize();a.position.copy(t.clone().add(s.multiplyScalar(40))),S.target.copy(t);const l=document.getElementById("info-panel");l.querySelector("#info-title").textContent=o.title,l.querySelector("#info-description").textContent=o.description,l.style.display="block"}window.addEventListener("resize",()=>{a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),w.setSize(window.innerWidth,window.innerHeight),r.setSize(window.innerWidth,window.innerHeight)});window.addEventListener("click",e=>N(e.clientX,e.clientY));window.addEventListener("touchstart",e=>N(e.touches[0].clientX,e.touches[0].clientY));function X(){requestAnimationFrame(X),h.rotation.y+=5e-4;const e=Date.now()*5e-7;d.position.set(100*Math.cos(e),0,100*Math.sin(e)),S.update(),w.render(c,a),r.render(c,a);const t=performance.now();P++,t-G>=1e3&&(i.textContent=`FPS: ${P}`,P=0,G=t)}X();
