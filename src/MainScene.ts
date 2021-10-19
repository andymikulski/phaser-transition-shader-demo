import Phaser from 'phaser';

const NUM_MARIOS = 10;
export default class MainScene extends Phaser.Scene {
  private marios: Phaser.GameObjects.Image[] = [];

  preload = () => {
    this.load.image('mario', 'https://i.imgur.com/nKgMvuj.png');
    this.load.image('background', 'https://i.imgur.com/3cK9sfQ.jpg');

    // Preload image(s) used for the transitions
    this.load.image('transition', 'https://i.imgur.com/H6BF2EO.png');
    // Load the actual shader/GLSL content. (The key here (`my-shaders`) doesn't really matter.)
    this.load.glsl('my-shaders', '/fx/WipeTransition.glsl');
  };
  create = () => {
    // SETUP----------
    this.add.text(0, 0, 'Main Scene - no physics', { color: '#fff', fontSize: '16px' });
    this.add.image(0, 0, 'background')
      .setOrigin(0, 0) // Anchor to top left so (0,0) is flush against the corner
      .setDisplaySize(1024, 768) // Fit background image to window
      .setDepth(-1); // Behind everything
    let mario;
    for (let i = 0; i < NUM_MARIOS; i++) {
      mario = this.add.image(32, 32, 'mario')
        .setData('velocity', { x: Math.random() * 500, y: Math.random() * 500 })
        .setDisplaySize(32, 32);

      this.marios.push(mario);
    }


    // DEMO------------

    /**
     * PIPELINE METHOD
     * - Use `setPipeline` to apply the effect to an object
     * - Use `[obj].pipeline.set1f(..)` to update the uniform used by the pipeline
     * - All objects belonging to this pipeline have the effect applied.
     * - The `uMainSampler` will be set to the object's displayed texture
     */
    // UNCOMMENT TO SEE HOW THIS RUNS:
    // Note how the 'transition' texture itself is used as the `uMainSampler` and hence where
    // the pixel values are derived from when running the transition shader.
    const overlay = this.add.image(0,0,'transition')
      // Stretch the image to fill the screen
      .setDisplaySize(this.scale.width, this.scale.height)
      .setOrigin(0,0)
      .setPipeline('wipeTransition');

    const tmp = {t: 0};
    this.tweens.add({
      targets: tmp,
      props: { t: 1 },
      duration: 3000,
      yoyo: true, // Animate back and forth
      repeat: -1, // Loop
      onUpdate: () => {
        // This calls into our shader and updates `uProgress`, which ultimately changes how
        // many pixels are filtered for any given frame.
        overlay.pipeline.set1f('uProgress', tmp.t);
      }
    });


    /**
     * SHADER METHOD
     * - Little wonky - requires textures to have dimensions of powers of 2, plus some weird Y-flipping on the texture
     * - Use an actual `shader` GameObject instead of applying the shader to an existing object
     * - Use `iChannel0-4` to add textures for the shader to pull from
     * - A single `shader` instance works independently from other instances of that shader
     */
    // UNCOMMENT TO SEE HOW THIS RUNS:
    // const overlay = this.add.shader('WipeTransition', 0, 0, 1024, 768, ['transition']).setOrigin(0, 0);
    // // Notice the `['transition']` param defines which textures are sent into the shader.
    // // Set flush against top left
    // overlay.setOrigin(0,0).setDisplaySize(1024, 768)
    // const tmp = {t: 0};
    // this.tweens.add({
    //   targets: tmp,
    //   props: { t: 1 },
    //   duration: 3000,
    //   yoyo: true, // Animate back and forth
    //   repeat: -1, // Loop
    //   onUpdate: () => {
    //     overlay.setUniform('uProgress.value', tmp.t);
    //   }
    // });
  };

  update = (time: number, delta: number) => {
    // do something every tick here
    let mario;
    let velocity;
    for (let i = 0; i < this.marios.length; i++) {
      mario = this.marios[i];
      velocity = mario.getData('velocity') as { x: number; y: number; };

      // Move the thing
      mario.x += velocity.x * delta * 0.001;
      mario.y += velocity.y * delta * 0.001;

      // Check if we hit a boundary and bounce
      if (mario.x > 1024 || mario.x < 0) {
        velocity.x *= -1;
      }
      if (mario.y > 768 || mario.y < 0) {
        velocity.y *= -1;
      }
      mario.setData('velocity', velocity)
    }
  }
}
