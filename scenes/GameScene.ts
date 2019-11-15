import Phaser from 'phaser';
import { Player } from '../gameObjects/Player';
import PlayerSprite from '../assets/player.png';
import BulletSprite from '../assets/bullet.png';
import { Bullet } from '../gameObjects/Bullet';

import DesertTileMap from '../assets/Desert_Tilemap_800x800.json';
import DesertTileSet from '../assets/desert.png';

export class GameScene extends Phaser.Scene {
  gameObjects: Phaser.GameObjects.GameObject[] = [];

  public preload() {
    this.load.spritesheet('player', PlayerSprite, {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet('bullet', BulletSprite, {
      frameWidth: 8,
      frameHeight: 8,
    });

    // TODO: fix tile bleeding https://github.com/sporadic-labs/tile-extruder
    this.load.tilemapTiledJSON('tilemap', DesertTileMap);
    this.load.image('tileset', DesertTileSet);
  }

  public create() {
    // initialize tilemap
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('desert', 'tileset');
    map.createStaticLayer('Terrain Base', tileset, 0, 0).setScale(2);
    map.createStaticLayer('Barriers', tileset, 0, 0).setScale(2);

    // initialize players
    this.gameObjects.push(new Player(this, this.spawnBullet));
  }

  public update() {
    this.gameObjects.forEach(o => o.update());
  }

  spawnBullet = (x: number, y: number, direction: Phaser.Math.Vector2) => {
    this.gameObjects.push(new Bullet(this, x, y, direction));
  };
}
