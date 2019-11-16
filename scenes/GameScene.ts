import Phaser, { FacebookInstantGamesLeaderboard } from 'phaser';
import { Player } from '../gameObjects/Player';
import PlayerSprite from '../assets/player.png';
import BulletSprite from '../assets/bullet.png';
import { Bullet } from '../gameObjects/Bullet';

import DesertTileMap from '../assets/Desert_Tilemap_800x800.json';
import DesertTileSet from '../assets/desert.png';
import * as Websocket from 'ws';
import { Oponent } from '../gameObjects/Oponent';
import { json } from '../server/node_modules/@types/express';
import { trackableObjects } from '../server/Server';

type OpponentPostion = {
  x: number;
  y: number;
};

type message = {
  id?: string;
  update?: trackableObjects;
  dissconnected?: string;
};

type OpponentPostionMap = { [id: string]: OpponentPostion };
export class GameScene extends Phaser.Scene {
  gameObjects: Phaser.GameObjects.GameObject[] = [];
  id: string | undefined;
  public opponentMap: { [id: string]: OpponentPostion } = {};
  wsc?: WebSocket;

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
    this.wsc = new WebSocket('ws://localhost:9000');

    this.wsc.addEventListener('open', ev => {
      console.log('conneted');
    });
    this.wsc.addEventListener('message', ev => {
      var message = JSON.parse(ev.data) as message;
      if (message.id !== undefined) {
        this.id = message.id;
        this.startUpdating();
      }
      if (message.dissconnected !== undefined) {
        let op = this.gameObjects.find(
          go =>
            go instanceof Oponent &&
            (go as Oponent).id === message.dissconnected,
        );
        if (op !== undefined) {
          this.gameObjects = this.gameObjects.filter(it => it !== op);
          delete this.opponentMap[message.dissconnected];
          op.destroy;
        }
      }
      if (this.id !== undefined && message.update !== undefined) {
        for (let key in message.update) {
          if (key !== this.id) {
            if (this.opponentMap[key] === undefined) {
              this.gameObjects.push(new Oponent(this, this.spawnBullet, key));
            }
            this.opponentMap[key] = message.update[key];
          }
        }
      }
    });
  }

  private startUpdating() {
    setInterval(() => {
      let player = this.gameObjects.filter(
        it => it instanceof Player,
      )[0] as Player;
      let pos = player.getPosition();
      if (this.id !== undefined && this.wsc !== undefined) {
        this.wsc.send(
          JSON.stringify({ playerUpdate: { id: this.id, pos: pos } }),
        );
      }
    }, 1000 / 20);
  }
  public update() {
    this.gameObjects.forEach(o => o.update());
  }

  spawnBullet = (x: number, y: number, direction: Phaser.Math.Vector2) => {
    this.gameObjects.push(new Bullet(this, x, y, direction));
  };
}
