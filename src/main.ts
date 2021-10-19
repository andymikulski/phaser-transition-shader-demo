import Phaser from 'phaser';
import { WipeTransitionPipeline } from './fx/WipeTransitionPipeline';
import MainScene from './MainScene';

new Phaser.Game({
  width: 1024,
  height: 768,
  backgroundColor: 0xA1E064,
  scale: {
    mode: Phaser.Scale.FIT,
  },

  // Pipelines are registered here
  pipeline: {
    'wipeTransition': WipeTransitionPipeline,
  } as any /* weird typing requires 'any' here */,

  // Entry point
  scene: MainScene
})