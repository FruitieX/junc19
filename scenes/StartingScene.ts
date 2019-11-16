import Phaser, { NONE } from 'phaser';
import { Player } from '../gameObjects/Player';
import joinButtonImg from '../assets/menu/join_game.png';
import exitButtonImg from '../assets/menu/exit.png';
import joinButtonImgSel from '../assets/menu/join_game_selected.png';
import exitButtonImgSel from '../assets/menu/exit_selected.png';

import { GameScene } from './GameScene';

export class StartScene extends Phaser.Scene {
  gameObjects: Phaser.GameObjects.GameObject[] = [];
  mousePosition?: Phaser.Math.Vector2;
  joinButton?: Phaser.GameObjects.Image;
  exitButton?: Phaser.GameObjects.Image;

  start: boolean = false;

  constructor() {
    super({ key: 'startScene' });
  }
  public preload() {
    this.load.image('exitButton', exitButtonImg);
    this.load.image('joinButton', joinButtonImg);
    this.load.image('exitButtonSel', exitButtonImgSel);
    this.load.image('joinButtonSel', joinButtonImgSel);
  }

  public create() {
    let start = false;

    this.cameras.main.setBackgroundColor('#f7d6a3');
    this.joinButton = this.add
      .image(600, 100, 'joinButton')
      .setScale(0.5)
      .setInteractive();
    this.exitButton = this.add
      .image(600, 200, 'exitButton')
      .setScale(0.5)
      .setInteractive();

    this.joinButton.on('pointerup', () => {
      //joinButton.setInteractive(false);
      //exitButton.setInteractive(false);
      this.scene.start('gameScene');
    });

    this.joinButton.on('', () => {
      //joinButton.setInteractive(false);
      //exitButton.setInteractive(false);
      this.scene.start('gameScene');
    });

    this.exitButton.on('pointerup', () => {
      this.add.text(600, 360, 'Håll käft', { fontSize: '64px', color: '#000' });
    });
  }

  public update() {
    const gamepad: Phaser.Input.Gamepad.Gamepad | undefined = this.input.gamepad
      ?.pad1;

    const upkey: Phaser.Input.Keyboard.Key = this.input.keyboard.addKey('up');
    const downkey: Phaser.Input.Keyboard.Key = this.input.keyboard.addKey(
      'down',
    );

    this.gameObjects.forEach(o => o.update());

    if (upkey.isDown || gamepad?.up) {
      this.joinButton?.setTexture('joinButtonSel');
      this.exitButton?.setTexture('exitButton');
    } else if (downkey.isDown || gamepad?.down) {
      this.exitButton?.setTexture('exitButtonSel');
      this.joinButton?.setTexture('joinButton');
    }
  }
}
