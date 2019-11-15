import Phaser from 'phaser';

const bulletVelocity = 1000;

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  game = this.scene.game;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: Phaser.Math.Vector2,
  ) {
    super(scene, x, y, 'bullet');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setScale(0.5);
    this.setVelocity(
      direction.x * bulletVelocity,
      direction.y * bulletVelocity,
    );
  }

  // TODO: Remove bullet when it is no longer used
}
