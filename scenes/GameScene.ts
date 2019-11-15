import Phaser from 'phaser';
import { Player } from '../Player';

import PlayerSprite from '../assets/player.png';

import DesertTileMap from '../assets/Desert_Tilemap_800x800.json';
import DesertTileSet from '../assets/desert.png';

export class GameScene extends Phaser.Scene {
  players: Player[] = [];

  constructor() {
    super({});
  }

  public preload() {
    this.load.spritesheet('player', PlayerSprite, {
      frameWidth: 128,
      frameHeight: 128,
    });

    this.load.tilemapTiledJSON('map', DesertTileMap);
    this.load.image('tileset', DesertTileSet);
  }

  public create() {
    this.cameras.main.setBackgroundColor('#fff');

    const map = this.make.tilemap({
      key: 'map',
      tileWidth: 16,
      tileHeight: 16,
    });
    const tileset = map.addTilesetImage('desert', 'tileset');
    map.createStaticLayer('Terrain Base', tileset, 0, 0).setScale(2);
    map.createStaticLayer('Barriers', tileset, 0, 0).setScale(2);

    this.players = [new Player(this)];
  }

  public update() {
    this.players.forEach(player => player.update());
  }
}
