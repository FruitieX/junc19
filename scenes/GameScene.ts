import Phaser from 'phaser';
import { Player } from '../gameObjects/Player';
import PlayerSprite from '../assets/player.png';
import BulletSprite from '../assets/bullet.png';
import { Bullet } from '../gameObjects/Bullet';

import DesertTileMap from '../assets/Desert_Tilemap_800x800.json';
import DesertTileSet from '../assets/desert.png';

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

    this.load.tilemapTiledJSON('map', DesertTileMap);
    this.load.image('tileset', DesertTileSet);
  }

  public create() {
    this.cameras.main.setBackgroundColor('#fff');
    this.gameObjects.push(new Player(this, this.spawnBullet));

    const map = this.make.tilemap({
      key: 'map',
      tileWidth: 16,
      tileHeight: 16,
    });
    const tileset = map.addTilesetImage('desert', 'tileset');
    map.createStaticLayer('Terrain Base', tileset, 0, 0).setScale(2);
    map.createStaticLayer('Barriers', tileset, 0, 0).setScale(2);
  }

  public update() {
    this.gameObjects.forEach(o => o.update());
  }

  spawnBullet = (x: number, y: number, direction: Phaser.Math.Vector2) => {
    this.gameObjects.push(new Bullet(this, x, y, direction));
  };
}
