import Phaser from 'phaser';

export type spawnBulletType = (
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
  public getPosition() {
    return { x: this.x, y: this.y };
  }
  private handleInput() {
    const gamepad: Phaser.Input.Gamepad.Gamepad | undefined = this.scene.input
      .gamepad?.pad1;

    if (this.keys.up?.isDown || gamepad?.up) {
      this.setVelocityY(-this.playerVelocity);
    } else if (this.keys.down?.isDown || gamepad?.down) {
      this.setVelocityY(this.playerVelocity);
    } else {
      this.setVelocityY(0);
    }

    if (this.keys.left?.isDown || gamepad?.left) {
      this.setVelocityX(-this.playerVelocity);
    } else if (this.keys.right?.isDown || gamepad?.right) {
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
