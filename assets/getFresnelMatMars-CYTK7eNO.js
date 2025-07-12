import{C as o,g as i,f as t}from"./OrbitControls-B6hLOxaa.js";function c({rimHex:e=16627340,facingHex:r=0}={}){const l={color1:{value:new o(e)},color2:{value:new o(r)},fresnelBias:{value:.1},fresnelScale:{value:.5},fresnelPower:{value:4}},a=`
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
  `,n=`
  uniform vec3 color1;
  uniform vec3 color2;
  
  varying float vReflectionFactor;
  
  void main() {
    float f = clamp( vReflectionFactor, 0.0, 1.0 );
    gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
  }
  `;return new i({uniforms:l,vertexShader:a,fragmentShader:n,transparent:!0,blending:t})}export{c as g};
