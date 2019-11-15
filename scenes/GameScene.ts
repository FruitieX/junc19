import Phaser from 'phaser';
import { Player } from '../gameObjects/Player';
import PlayerSprite from '../assets/player.png';
import BulletSprite from '../assets/bullet.png';
import { Bullet } from '../gameObjects/Bullet';

export class GameScene extends Phaser.Scene {
  gameObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({});
  }

  public preload() {
    this.load.spritesheet('player', PlayerSprite, {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet('bullet', BulletSprite, {
      frameWidth: 8,
      frameHeight: 8,
    });
  }

  public create() {
    this.cameras.main.setBackgroundColor('#fff');
    this.gameObjects.push(new Player(this, this.spawnBullet));
  }

  public update() {
    this.gameObjects.forEach(o => o.update());
  }

  spawnBullet = (x: number, y: number, direction: Phaser.Math.Vector2) => {
    this.gameObjects.push(new Bullet(this, x, y, direction));
  };
}
