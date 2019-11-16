import Phaser from 'phaser';
import { spawnBulletType } from './Player';
import { GameScene } from '../scenes/GameScene';

export class Opponent extends Phaser.Physics.Arcade.Sprite {
  game = this.scene.game;
  spawnBullet?: spawnBulletType;
  id: string;

  constructor(scene: GameScene, spawnBullet: spawnBulletType, id: string) {
    super(scene, 100, 100, 'player');
    scene.gameObjectContainer!.add(this);
    this.scene.physics.add.existing(this);
    this.spawnBullet = spawnBullet;
    this.id = id;
  }
  public update() {
    const pos = (this.scene as GameScene).opponentMap[this.id];
    if (pos !== undefined) {
      this.setPosition(pos.x, pos.y);
      this.setRotation(pos.rotation);
    }
  }
}
