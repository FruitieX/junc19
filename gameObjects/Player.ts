import Phaser from 'phaser';

type spawnBulletType = (
  x: number,
  y: number,
  direction: Phaser.Math.Vector2,
) => void;

export class Player extends Phaser.Physics.Arcade.Sprite {
  game = this.scene.game;
  keys = this.scene.input.keyboard.createCursorKeys();
  playerVelocity = 500;
  spawnBullet?: spawnBulletType;

  constructor(scene: Phaser.Scene, spawnBullet: spawnBulletType) {
    super(scene, 100, 100, 'player');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.spawnBullet = spawnBullet;
  }

  public update() {
    this.handleInput();
  }

  private handleInput() {
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

    if (Phaser.Input.Keyboard.JustDown(this.keys.space!)) {
      this.shoot();
    }
  }

  private shoot() {
    this.spawnBullet(this.x, this.y, new Phaser.Math.Vector2(1, 0));
  }
}
