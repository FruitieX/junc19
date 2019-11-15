import Phaser from 'phaser';
import { Player } from '../gameObjects/Player';
import PlayerIdleSprite from '../assets/sprites/player_idle.png';
import BulletSprite from '../assets/bullet.png';

import DesertTileMap from '../assets/Desert_Tilemap_800x800.json';
import DesertTileSet from '../assets/desert.png';

export class GameScene extends Phaser.Scene {
  gameObjects: Phaser.GameObjects.GameObject[] = [];

  public preload() {
    this.load.spritesheet('playerIdle', PlayerIdleSprite, {
      frameWidth: 78,
      frameHeight: 51,
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
    const barriers = map
      .createStaticLayer('Barriers', tileset, 0, 0)
      .setScale(2);

    barriers.setCollisionByProperty({ collides: true });

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('playerIdle', {
        start: 0,
        end: 19,
      }),
      frameRate: 15,
      repeat: -1,
    });

    const player = new Player(this);

    this.physics.add.collider(player, barriers);

    // initialize players
    this.gameObjects.push(player);
  }

  public update() {
    this.gameObjects.forEach(o => o.update());
  }
}
