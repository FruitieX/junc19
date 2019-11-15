import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

class SimpleGame {
  constructor() {
    new Phaser.Game({
      width: 1280,
      height: 720,
      scene: [GameScene],
      type: Phaser.AUTO,
      physics: {
        default: 'arcade',
        arcade: {},
      },
      input: {
        gamepad: true,
        keyboard: true,
      },
    });
  }
}

window.onload = () => {
  new SimpleGame();
};
