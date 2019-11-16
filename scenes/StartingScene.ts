import Phaser from 'phaser';
import joinButtonImg from '../assets/menu/join_game.png';
import exitButtonImg from '../assets/menu/exit.png';
import localButtonImg from '../assets/menu/local_game.png';
import joinButtonImgSel from '../assets/menu/join_game_selected.png';
import exitButtonImgSel from '../assets/menu/exit_selected.png';
import localButtonImgSel from '../assets/menu/local_game_selected.png';

export class StartScene extends Phaser.Scene {
  gameObjects: Phaser.GameObjects.GameObject[] = [];
  mousePosition?: Phaser.Math.Vector2;
  joinButton?: Phaser.GameObjects.Image;
  exitButton?: Phaser.GameObjects.Image;
  localButton?: Phaser.GameObjects.Image;
  start: boolean = false;

  constructor() {
    super({ key: 'startScene' });
  }
  public preload() {
    this.load.image('exitButton', exitButtonImg);
    this.load.image('joinButton', joinButtonImg);
    this.load.image('exitButtonSel', exitButtonImgSel);
    this.load.image('joinButtonSel', joinButtonImgSel);
    this.load.image('localButton', localButtonImg);
    this.load.image('localButtonSel', localButtonImgSel);
  }

  public create() {
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
      this.add.text(420, 420, 'Håll käft', { fontSize: '64px', color: '#000' });
    });
  }

  public update() {
    let menuVal = 1;
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

    const confirm: Boolean =
      spacekey.isDown ||
      enterkey.isDown ||
      gamepad?.A ||
      gamepad?.B ||
      !!gamepad?.R2;

    this.gameObjects.forEach(o => o.update());

    if (upkey.isDown || gamepad?.up) {
      this.exitButton?.setTexture('exitButton');
      this.joinButton?.setTexture('joinButton');
      this.localButton?.setTexture('localButton');

      menuVal = menuVal - 1;
    } else if (downkey.isDown || gamepad?.down) {
      this.exitButton?.setTexture('exitButton');
      this.joinButton?.setTexture('joinButton');
      this.localButton?.setTexture('localButton');

      menuVal = menuVal + 1;
    }

    if (menuVal > 3) {
      menuVal = 3;
    } else if (menuVal < 1) {
      menuVal = 1;
    }

    switch (menuVal) {
      case 1:
        this.joinButton?.setTexture('joinButtonSel');
        break;
      case 2:
        this.localButton?.setTexture('localButtonSel');
        break;
      case 3:
        this.exitButton?.setTexture('exitButtonSel');
        break;
    }

    if (confirm) {
      switch (menuVal) {
        case 1:
          this.scene.start('gameScene', new Boolean(true));
          break;
        case 2:
          this.scene.start('gameScene', new Boolean(false));
          break;
        case 3:
          this.add.text(420, 420, 'Håll käft', {
            fontSize: '64px',
            color: '#000',
          });
          break;
      }
    }
  }
}
