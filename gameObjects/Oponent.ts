import Phaser from 'phaser';
import { spawnBulletType } from './Player';
import { GameScene } from '../scenes/GameScene';

export class Oponent extends Phaser.Physics.Arcade.Sprite {
  game = this.scene.game;
  spawnBullet?: spawnBulletType;
  id: string;

  constructor(scene: Phaser.Scene, spawnBullet: spawnBulletType, id: string) {
    super(scene, 100, 100, 'player');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.spawnBullet = spawnBullet;
    this.id = id;
  }
  public update() {
    const pos = (this.scene as GameScene).opponentMap[this.id];
    if (pos !== undefined) this.setPosition(pos.x, pos.y);
  }
}
