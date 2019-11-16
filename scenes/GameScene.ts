import Phaser from 'phaser';
import { Player } from '../gameObjects/Player';
import PlayerSprite from '../assets/sprites/player.png';
import BulletSprite from '../assets/bullet.png';
import DesertTileMap from '../assets/Dust2.json';
import DesertTileSet from '../assets/desert.png';
import { Oponent } from '../gameObjects/Oponent';
import { trackableObjects } from '../server/Server';
import Mozart from '../assets/audio/mozart_einekleine.mp3';
import { Rectangle } from '../2d-visibility/rectangle';
import { loadMap } from '../2d-visibility/load-map';
import { calculateVisibility } from '../2d-visibility/visibility';

type OpponentPostion = {
  x: number;
  y: number;
};

type message = {
  id?: string;
  update?: trackableObjects;
  dissconnected?: string;
};

export class GameScene extends Phaser.Scene {
  gameObjects: Phaser.GameObjects.GameObject[] = [];
  id: string | undefined;
  public opponentMap: { [id: string]: OpponentPostion } = {};
  wsc?: WebSocket;
  player?: Phaser.GameObjects.GameObject;
  music?: Phaser.Sound.BaseSound;
  minimap?: Phaser.Cameras.Scene2D.CameraManager;
  mousePosition?: Phaser.Math.Vector2;
  barriers?: Phaser.Tilemaps.StaticTilemapLayer;
  boundaries?: Phaser.Tilemaps.StaticTilemapLayer;
  graphics?: Phaser.GameObjects.Graphics;
  blocks?: Rectangle[];
  mapBounds?: Rectangle;
  visibilityOverlay?: Phaser.GameObjects.Graphics;
  visibilityMask?: Phaser.GameObjects.Graphics;
  gameObjectContainer?: Phaser.GameObjects.Container;
  water?: Phaser.Tilemaps.StaticTilemapLayer;

  constructor() {
    super({ key: 'gameScene' });
  }
  public preload() {
    this.load.spritesheet('player', PlayerSprite, {
      frameWidth: 78,
      frameHeight: 51,
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
    const MAP_SCALE = 2;
    this.cameras.main.setBackgroundColor('#f7d6a3');

    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('desert', 'tileset');
    const bg = map
      .createStaticLayer('Terrain Base', tileset, 0, 0)
      .setScale(MAP_SCALE);
    this.barriers = map
      .createStaticLayer('Barriers', tileset, 0, 0)
      .setScale(MAP_SCALE);
    this.boundaries = map
      .createStaticLayer('Boundaries', tileset, 0, 0)
      .setScale(MAP_SCALE);
    this.water = map
      .createStaticLayer('Water', tileset, 0, 0)
      .setScale(MAP_SCALE);

    this.barriers.setCollisionByProperty({ collides: true });
    this.boundaries.setCollisionByProperty({ collides: true });
    this.water.setCollisionByProperty({ collides: true });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 19,
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.anims.create({
      key: 'move',
      frames: this.anims.generateFrameNumbers('player', {
        start: 20,
        end: 39,
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.anims.create({
      key: 'shoot',
      frames: this.anims.generateFrameNumbers('player', {
        start: 40,
        end: 42,
      }),
      frameRate: 15,
      repeat: 0,
    });

    this.visibilityOverlay = this.make.graphics({});
    this.visibilityMask = this.make.graphics({});
    this.gameObjectContainer = this.add.container(0, 0);

    const player = new Player(this);
    this.player = player;
    this.physics.add.collider(player, this.barriers);
    this.physics.add.collider(player, this.boundaries);
    this.physics.add.collider(player, this.water);
    this.gameObjects.push(player);

    // initialize players
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
    // background music
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

    // set player follow on camera
    this.cameras.main.setBounds(
      0,
      0,
      map.widthInPixels * MAP_SCALE,
      map.heightInPixels * MAP_SCALE,
    );
    this.cameras.main.startFollow(player);

    this.mapBounds = new Rectangle(
      0,
      0,
      map.widthInPixels * MAP_SCALE,
      map.heightInPixels * MAP_SCALE,
    );

    //add minimap
    this.minimap = this.cameras.fromJSON({
      name: 'minimap',
      x: 10,
      y: 10,
      width: map.widthInPixels * MAP_SCALE * 0.1,
      height: map.heightInPixels * MAP_SCALE * 0.1,
      zoom: 0.1,
      rotation: 0,
      scrollX: map.widthInPixels * MAP_SCALE * 2,
      scrollY: map.heightInPixels * MAP_SCALE * 2,
      roundPixels: false,
      backgroundColor: false,
      bounds: this.mapBounds,
    });
    this.minimap.getCamera('minimap').startFollow(player);

    // Locks pointer on mousedown
    this.game.canvas.addEventListener('mousedown', () => {
      this.game.input.mouse.requestPointerLock();
    });

    // Move reticle upon locked pointer move
    this.input.on(
      'pointermove',
      (pointer: PointerEvent) => {
        if (this.input.mouse.locked) {
          this.mousePosition = new Phaser.Math.Vector2(
            pointer.movementX,
            pointer.movementY,
          );
        }
      },
      this,
    );

    // TODO: this is not all tiles
    const tiles = this.barriers?.getTilesWithinWorldXY(0, 0, 10000, 10000);
    const wallTiles = tiles.filter(tile => tile.properties.wall);
    const tileSize = 16 * MAP_SCALE;
    this.blocks = wallTiles.map(
      tile =>
        new Rectangle(
          tile.x * tileSize,
          tile.y * tileSize,
          tile.width * MAP_SCALE,
          tile.height * MAP_SCALE,
        ),
    );

    const mask = this.visibilityMask.createGeometryMask();
    const invertedMask = this.visibilityMask.createGeometryMask();
    invertedMask.setInvertAlpha(true);
    this.visibilityOverlay.fillStyle(0, 0.5);
    this.visibilityOverlay.fillRect(0, 0, 10000, 10000);
    this.visibilityOverlay.setMask(invertedMask);
    this.add.existing(this.visibilityOverlay);

    this.gameObjectContainer.setMask(mask);
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

    if (this.mapBounds && this.blocks && this.visibilityMask) {
      this.visibilityOverlay!.x = -this.cameras.main.scrollX;
      this.visibilityOverlay!.y = -this.cameras.main.scrollY;

      const playerPoint = {
        x: this.player?.body.x + 32,
        y: this.player?.body.y + 20,
      };

      const endpoints = loadMap(this.mapBounds, this.blocks, [], playerPoint);
      const visibility = calculateVisibility(playerPoint, endpoints);

      this.visibilityMask.clear();

      visibility.forEach(points => {
        this.visibilityMask?.fillStyle(0).fillPoints([playerPoint, ...points]);
      });
    }
  }
}
