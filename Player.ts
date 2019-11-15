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

  public create() {
    //this.scene.physics.add.sprite(100, 100, 'player');
    //this.scene.add.sprite(100, 100, 'player');
    //this.body.
  }

  public update() {
    if (this.keys.up.isDown) {
      this.setVelocityY(-this.playerVelocity);
    } else if (this.keys.down.isDown) {
      this.setVelocityY(this.playerVelocity);
    } else {
      this.setVelocityY(0);
    }

    if (this.keys.left.isDown) {
      this.setVelocityX(-this.playerVelocity);
    } else if (this.keys.right.isDown) {
      this.setVelocityX(this.playerVelocity);
    } else {
      this.setVelocityX(0);
    }
  }
}
