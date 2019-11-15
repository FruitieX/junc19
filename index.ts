import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

window.onload = () => {
  const game = new Phaser.Game({
    width: 1280,
    height: 720,
    scene: [GameScene],
    type: Phaser.AUTO,
    physics: {
      default: 'arcade',
      arcade: {
        // debug: true,
      },
    },
    input: {
      gamepad: true,
      keyboard: true,
    },
  });
};
