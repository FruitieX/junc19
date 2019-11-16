import Phaser from 'phaser';
import { Player } from '../gameObjects/Player';
import PlayerSprite from '../assets/sprites/player.png';
import BloodSprite from '../assets/sprites/blood.png';
import BulletSprite from '../assets/bullet.png';
import DesertTileMap from '../assets/Dust2.json';
import DesertTileSet from '../assets/extruded_desert.png';
import { Opponent } from '../gameObjects/Opponent';
import Mozart from '../assets/audio/mozart_einekleine.mp3';
import GunShot from '../assets/audio/silencer.wav';
import { Rectangle } from '../2d-visibility/rectangle';
import { loadMap } from '../2d-visibility/load-map';
import { calculateVisibility } from '../2d-visibility/visibility';
import { WebSocketHandler } from '../utils/WebSocketHandler';

type OpponentPostion = {
  pos: {
    x: number;
    y: number;
  };
  vel: {
    x: number;
    y: number;
  };
  rot: number;
};

// type Message = {
//   id?: string;
//   update?: trackableObjects;
//   dissconnected?: string;
// };

export class GameScene extends Phaser.Scene {
  gameObjects: Phaser.GameObjects.GameObject[] = [];
  public opponents: Opponent[] = [];
  public opponentMap: { [id: string]: OpponentPostion } = {};
  player?: Player;
  music?: Phaser.Sound.BaseSound;
  gunShotSound?: Phaser.Sound.BaseSound;
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
  ws?: WebSocketHandler;
  deadText?: Phaser.GameObjects.Text;
  online: Boolean = false;

  constructor() {
    super({ key: 'gameScene' });
  }

  init(online: Boolean) {
    console.log(online);
    this.online = online;
  }

  public preload() {
    this.load.spritesheet('player', PlayerSprite, {
      frameWidth: 78,
      frameHeight: 51,
    });
    this.load.audio('music', Mozart);
    this.load.audio('gunSound', GunShot);
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
      key: 'blood',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 2,
      }),
      frameRate: 15,
      repeat: 0,
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', {
        start: 3,
        end: 22,
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.anims.create({
      key: 'move',
      frames: this.anims.generateFrameNumbers('player', {
        start: 23,
        end: 42,
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.anims.create({
      key: 'shoot',
      frames: this.anims.generateFrameNumbers('player', {
        start: 43,
        end: 45,
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

    // background music
    this.music = this.sound.add('music', {
      mute: false,
      volume: 0.2,
      rate: 1.33,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0,
    });
    this.music.play();

    this.gunShotSound = this.sound.add('gunSound', {
      mute: false,
      volume: 1,
    });

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

    //add minimap RIP
    /*
    this.minimap = this.cameras.fromJSON({
      name: 'minimap',
      x: 10,
      y: 10,
      width: map.widthInPixels * 0.1,
      height: map.heightInPixels  * 0.1,
      zoom: 0.1,
      rotation: 0,
      scrollX: map.widthInPixels,
      scrollY: map.heightInPixels,
      roundPixels: false,
      backgroundColor: false,
      bounds: this.mapBounds,
    });
    this.minimap.getCamera('minimap').startFollow(player);
    this.minimap.getCamera('minimap').setBackgroundColor('rgba(0,0,0,0.8)');
    // Locks pointer on mousedown
    this.game.canvas.addEventListener('mousedown', () => {
      this.game.input.mouse.requestPointerLock();
    });
*/

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

    this.deadText = this.add.text(480, 260, '');
    this.deadText.setColor('#000');
    this.deadText.scrollFactorX = 0;
    this.deadText.scrollFactorY = 0;

    if (this.online.valueOf()) {
      console.log('online');
      this.ws = new WebSocketHandler(this, 'ws://23.101.58.18:9000');
    } else {
      console.log('offline');
      this.ws = new WebSocketHandler(this, 'ws://localhost:9000');
    }
  }

  public update() {
    this.gameObjects.forEach(o => o.update());

    if (
      this.mapBounds &&
      this.blocks &&
      this.visibilityMask &&
      this.visibilityOverlay
    ) {
      this.visibilityOverlay.x = -this.cameras.main.scrollX;
      this.visibilityOverlay.y = -this.cameras.main.scrollY;

      const playerPoint = {
        x: (this.player?.body as Phaser.Physics.Arcade.Body).x + 32,
        y: (this.player?.body as Phaser.Physics.Arcade.Body).y + 20,
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
