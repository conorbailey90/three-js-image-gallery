uniform sampler2D uTexture;
uniform float uAlpha;
uniform vec2 uOffset;
varying vec2 vUv;

vec3 rgbShift(sampler2D textureimage, vec2 uv, vec2 offset ){
    float r = texture2D(textureimage, uv + offset).r;
    vec2 gb = texture2D(textureimage, uv).gb;
    return vec3(r, gb);
}

void main(){
   
    vec3 texel = texture2D(uTexture, vUv).rgb;
    // Used to make images black and white
    float luminance = texel.r * 0.299 + texel.g * 0.587 + texel.b * 0.114;
    gl_FragColor = vec4(luminance, luminance, luminance, 1.0);
    // gl_FragColor = vec4(color, 1.0);

}