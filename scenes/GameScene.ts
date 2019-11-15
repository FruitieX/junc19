import Phaser from 'phaser';
import { Player } from '../gameObjects/Player';
import PlayerSprite from '../assets/player.png';

import BulletSprite from '../assets/bullet.png';

import DesertTileMap from '../assets/Desert_Tilemap_800x800.json';
import DesertTileSet from '../assets/desert.png';
import Mozart from '../assets/audio/mozart_einekleine.mp3';
export class GameScene extends Phaser.Scene {
  gameObjects: Phaser.GameObjects.GameObject[] = [];
  music?: Phaser.Sound.BaseSound;

  public preload() {
    this.load.spritesheet('player', PlayerSprite, {
      frameWidth: 128,
      frameHeight: 128,
    });

    this.load.audio('music', Mozart);
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

    const player = new Player(this);

    this.physics.add.collider(player, barriers);

    this.music = this.sound.add('music', {
      mute: false,
      volume: 1,
      rate: 1.33,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0,
    });

    this.music.play();
    // initialize players
    this.gameObjects.push(player);
  }

  public update() {
    this.gameObjects.forEach(o => o.update());
  }
}
