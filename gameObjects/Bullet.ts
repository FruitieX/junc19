import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';

const bulletVelocity = 1000;

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  game = this.scene.game;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    direction: Phaser.Math.Vector2,
  ) {
    super(scene, x, y, 'bullet');

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.scene.physics.add.collider(this, scene.barriers!, this.onCollide);
    this.setScale(0.5);
    this.setVelocity(
      direction.x * bulletVelocity,
      direction.y * bulletVelocity,
    );
    this.body.onCollide;
  }

  private onCollide = () => {
    this.destroy();
  };

  // TODO: Remove bullet when it is no longer used
}
