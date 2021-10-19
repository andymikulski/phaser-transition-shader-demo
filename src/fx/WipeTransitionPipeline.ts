import Phaser from 'phaser';

// The inputs for our shader
const shaderUniforms = [
  // Defaults
  'uResolution', // Canvas size (in pixels)
  'uMainSampler', // Texture for applied object
  'uTime', // Game timestamp (in milliseconds)

  // Shader-specific
  'uProgress',  // Transition progress
];

const fragmentShader = `#ifdef GL_ES
precision mediump float;
#endif

#define SHADER_NAME WIPE_TRANSITION

uniform vec2 uResolution;
uniform float uTime;
uniform float uProgress;
uniform sampler2D uMainSampler;

const float threshold = 0.95;
varying vec2 outTexCoord;

void main() {
  // Select the color of this coordinate from the texture
  gl_FragColor = texture2D(uMainSampler, outTexCoord);

  // Compare the 'blue' RGB value to the current progress percentage.
  // (The texture is black and white, so the use of blue is arbitrary. Any RGB component would work.)
  if (gl_FragColor.b <= uProgress) {
    // If below the threshold, display the pixel as black. We tweak the alpha a little based on the
    // threshold difference for visual effect. (Setting the alpha to 1.0 results in opaque black.)
    gl_FragColor = vec4(0.0, 0.0, 0.0, (uProgress - gl_FragColor.b) * 25.0);
  } else {
    discard;
  }
}
`;

export class WipeTransitionPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline  {
  constructor(game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      shaders: [
        {
          name: 'WipeTransitionPipeline',
          fragShader: fragmentShader,
          uniforms: shaderUniforms
        } as any
      ]
    });
  }

  onPreRender() {
    // Update the `uTime` uniform automatically.
    this.set1f('uTime', this.game.getTime());
  }
}

