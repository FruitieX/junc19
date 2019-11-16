import Phaser, { Tilemaps } from 'phaser';
import joinButtonImg from '../assets/menu/join_game.png';
import exitButtonImg from '../assets/menu/exit.png';
import localButtonImg from '../assets/menu/local_game.png';
import joinButtonImgSel from '../assets/menu/join_game_selected.png';
import exitButtonImgSel from '../assets/menu/exit_selected.png';
import localButtonImgSel from '../assets/menu/local_game_selected.png';

export class StartScene extends Phaser.Scene {
  mousePosition?: Phaser.Math.Vector2;
  joinButton?: Phaser.GameObjects.Image;
  exitButton?: Phaser.GameObjects.Image;
  localButton?: Phaser.GameObjects.Image;
  start: boolean = false;
  menuVal: number = 1;
  throttler: boolean = false;

  constructor() {
    super({ key: 'startScene' });
  }
  public preload() {
    this.load.image('exitButton', exitButtonImg);
    this.load.image('joinButton', joinButtonImg);
    this.load.image('localButton', localButtonImg);
    this.load.image('exitButtonSel', exitButtonImgSel);
    this.load.image('joinButtonSel', joinButtonImgSel);
    this.load.image('localButtonSel', localButtonImgSel);
  }

  public create() {
    let start = false;

    this.cameras.main.setBackgroundColor('#f7d6a3');

    this.joinButton = this.add
      .image(620, 100, 'joinButton')
      .setScale(0.5)
      .setInteractive();

    this.localButton = this.add
      .image(620, 200, 'localButton')
      .setScale(0.5)
      .setInteractive();

    this.exitButton = this.add
      .image(620, 300, 'exitButton')
      .setScale(0.5)
      .setInteractive();

    this.joinButton.on('pointerup', () => {
      //joinButton.setInteractive(false);
      //exitButton.setInteractive(false);
      this.scene.start('gameScene', new Boolean(true));
    });

    this.localButton.on('pointerup', () => {
      //joinButton.setInteractive(false);
      //exitButton.setInteractive(false);
      this.scene.start('gameScene', new Boolean(false));
    });

    this.exitButton.on('pointerup', () => {
      this.add.text(100, 420, 'You can now turn off your computer', {
        fontSize: '48px',
        color: '#000',
      });
    });
  }

  public update() {
    const gamepad: Phaser.Input.Gamepad.Gamepad | undefined = this.input.gamepad
      ?.pad1;
    const upkey: Phaser.Input.Keyboard.Key = this.input.keyboard.addKey('up');
    const downkey: Phaser.Input.Keyboard.Key = this.input.keyboard.addKey(
      'down',
    );
    const spacekey: Phaser.Input.Keyboard.Key = this.input.keyboard.addKey(
      'space',
    );
    const enterkey: Phaser.Input.Keyboard.Key = this.input.keyboard.addKey(
      'enter',
    );

    const confirm: boolean =
      spacekey.isDown ||
      enterkey.isDown ||
      gamepad?.A ||
      gamepad?.B ||
      !!gamepad?.R2;

    if (upkey.isDown || gamepad?.up) {
      if (!this.throttler) {
        this.menuVal = this.menuVal - 1;
      }
      this.throttler = true;
    } else if (downkey.isDown || gamepad?.down) {
      if (!this.throttler) {
        this.menuVal = this.menuVal + 1;
      }
      this.throttler = true;
    } else {
      this.throttler = false;
    }

    if (this.menuVal > 3) {
      this.menuVal = 3;
    } else if (this.menuVal < 1) {
      this.menuVal = 1;
    }

    switch (this.menuVal) {
      case 1:
        this.exitButton?.setTexture('exitButton');
        this.localButton?.setTexture('localButton');
        this.joinButton?.setTexture('joinButtonSel');
        break;
      case 2:
        this.exitButton?.setTexture('exitButton');
        this.joinButton?.setTexture('joinButton');
        this.localButton?.setTexture('localButtonSel');
        break;
      case 3:
        this.joinButton?.setTexture('joinButton');
        this.localButton?.setTexture('localButton');
        this.exitButton?.setTexture('exitButtonSel');
        break;
    }

    if (confirm) {
      switch (this.menuVal) {
        case 1:
          this.scene.start('gameScene', new Boolean(true));
          break;
        case 2:
          this.scene.start('gameScene', new Boolean(false));
          break;
        case 3:
          this.add.text(100, 420, 'You can now turn off your computer', {
            fontSize: '48px',
            color: '#000',
          });
          break;
      }
    }
  }
}
