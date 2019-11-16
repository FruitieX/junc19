import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  game = this.scene.game;
  keys = this.scene.input.keyboard.createCursorKeys();

  playerVelocity = 500;

  constructor(scene: Phaser.Scene) {
    super(scene, 100, 100, 'player');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }

  public update() {
    const gamepad: Phaser.Input.Gamepad.Gamepad | undefined = this.scene.input
      .gamepad?.pad1;

    if (this.keys.up?.isDown || gamepad?.up) {
      this.setVelocityY(-this.playerVelocity);
    } else if (this.keys.down?.isDown || gamepad?.down) {
      this.setVelocityY(this.playerVelocity);
    } else {
      this.setVelocityY(0);
    }

    if (this.input.left?.isDown || gamepad?.left) {
      this.setVelocityX(-this.playerVelocity);
    } else if (this.keys.right?.isDown || gamepad?.right) {
      this.setVelocityX(this.playerVelocity);
    } else {
      this.setVelocityX(0);
    }
  }
}
