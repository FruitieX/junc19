import Phaser from 'phaser';
import { Player } from '../gameObjects/Player';
import PlayerPurpleSprite from '../assets/sprites/player_purple.png';
import PlayerOrangeSprite from '../assets/sprites/player_orange.png';
import BulletSprite from '../assets/bullet.png';
import FlagSprite from '../assets/flags.png';
import DesertTileMap from '../assets/Dust2.json';
import DesertTileSet from '../assets/extruded_desert.png';
import { Opponent } from '../gameObjects/Opponent';
import Mozart from '../assets/audio/mozart_einekleine.mp3';
import GunShot from '../assets/audio/silencer.wav';
import { Rectangle } from '../2d-visibility/rectangle';
import { loadMap } from '../2d-visibility/load-map';
import { calculateVisibility } from '../2d-visibility/visibility';
import {
  OpponentPostion,
  team1Name,
  team2Name,
  GameState,
} from '../typings/ws-messages';
import { WebSocketHandler } from '../utils/WebSocketHandler';
import { Flag } from '../gameObjects/Flag';

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

  statusTextTime = new Date().getTime();
  statusText?: Phaser.GameObjects.Text;

  scoreText?: Phaser.GameObjects.Text;

  ammoText?: Phaser.GameObjects.Text;

  online: Boolean = false;
  flag1?: Flag;
  flag2?: Flag;
  gameState: GameState;

  gameWasActive: boolean;
  team1Spawns?: Phaser.GameObjects.Sprite[];
  team2Spawns?: Phaser.GameObjects.Sprite[];

  constructor() {
    super({ key: 'gameScene' });

    this.gameState = {
      gameActive: true,
      team1Score: 0,
      team2Score: 0,
      maxScore: 5,
    };

    this.gameWasActive = true;
  }

  init(online: Boolean) {
    this.online = online;
  }

  public preload() {
    this.load.spritesheet('playerPurple', PlayerPurpleSprite, {
      frameWidth: 78,
      frameHeight: 51,
    });
    this.load.spritesheet('playerOrange', PlayerOrangeSprite, {
      frameWidth: 78,
      frameHeight: 51,
    });
    this.load.audio('music', Mozart);
    this.load.audio('gunSound', GunShot);
    this.load.spritesheet('bullet', BulletSprite, {
      frameWidth: 8,
      frameHeight: 8,
    });

    this.load.spritesheet('flags', FlagSprite, {
      frameWidth: 8,
      frameHeight: 16,
    });

    // TODO: fix tile bleeding https://github.com/sporadic-labs/tile-extruder
    this.load.tilemapTiledJSON('tilemap', DesertTileMap);
    this.load.image('tileset', DesertTileSet);
  }

  public updateGameState(state: GameState) {
    this.gameState = state;

    if (this.gameState.team1Score >= this.gameState.maxScore) {
      if (this.player!.team === team1Name) {
        this.setStatusText('Your team wins!');
      } else {
        this.setStatusText('Enemy team wins!');
      }
    }

    if (this.gameState.team2Score >= this.gameState.maxScore) {
      if (this.player!.team === team2Name) {
        this.setStatusText('Your team wins!');
      } else {
        this.setStatusText('Enemy team wins!');
      }
    }
  }

  public create() {
    // initialize tilemap
    const MAP_SCALE = 2;
    this.cameras.main.setBackgroundColor('#f7d6a3');

    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('desert', 'tileset');
    map.createStaticLayer('Terrain Base', tileset, 0, 0).setScale(MAP_SCALE);
    this.barriers = map
      .createStaticLayer('Barriers', tileset, 0, 0)
      .setScale(MAP_SCALE);
    this.boundaries = map
      .createStaticLayer('Boundaries', tileset, 0, 0)
      .setScale(MAP_SCALE);
    this.water = map
      .createStaticLayer('Water', tileset, 0, 0)
      .setScale(MAP_SCALE);

    this.gameObjectContainer = this.add.container(0, 0);

    this.barriers.setCollisionByProperty({ collides: true });
    this.boundaries.setCollisionByProperty({ collides: true });
    this.water.setCollisionByProperty({ collides: true });

    this.anims.create({
      key: 'blood_purple',
      frames: this.anims.generateFrameNumbers('playerPurple', {
        start: 0,
        end: 2,
      }),
      frameRate: 15,
      repeat: 0,
    });

    this.anims.create({
      key: 'idle_purple',
      frames: this.anims.generateFrameNumbers('playerPurple', {
        start: 3,
        end: 22,
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.anims.create({
      key: 'move_purple',
      frames: this.anims.generateFrameNumbers('playerPurple', {
        start: 23,
        end: 42,
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.anims.create({
      key: 'shoot_purple',
      frames: this.anims.generateFrameNumbers('playerPurple', {
        start: 43,
        end: 45,
      }),
      frameRate: 15,
      repeat: 0,
    });

    this.anims.create({
      key: 'blood_orange',
      frames: this.anims.generateFrameNumbers('playerOrange', {
        start: 0,
        end: 2,
      }),
      frameRate: 15,
      repeat: 0,
    });

    this.anims.create({
      key: 'idle_orange',
      frames: this.anims.generateFrameNumbers('playerOrange', {
        start: 3,
        end: 22,
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.anims.create({
      key: 'move_orange',
      frames: this.anims.generateFrameNumbers('playerOrange', {
        start: 23,
        end: 42,
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.anims.create({
      key: 'shoot_orange',
      frames: this.anims.generateFrameNumbers('playerOrange', {
        start: 43,
        end: 45,
      }),
      frameRate: 15,
      repeat: 0,
    });

    this.visibilityOverlay = this.make.graphics({});
    this.visibilityMask = this.make.graphics({});

    const player = new Player(this);
    this.player = player;
    this.physics.add.collider(player, this.barriers);
    this.physics.add.collider(player, this.boundaries);
    this.physics.add.collider(player, this.water);
    this.gameObjects.push(player);

    const flag1_tile = map.createFromObjects('Flags', 'flag1', {
      visible: false,
    })[0];
    const flag2_tile = map.createFromObjects('Flags', 'flag2', {
      visible: false,
    })[0];

    this.flag1 = new Flag(this, team1Name, {
      x: flag1_tile.x * MAP_SCALE,
      y: flag1_tile.y * MAP_SCALE,
    });
    this.gameObjects.push(this.flag1);
    this.flag2 = new Flag(this, team2Name, {
      x: flag2_tile.x * MAP_SCALE,
      y: flag2_tile.y * MAP_SCALE,
    });
    this.gameObjects.push(this.flag2);

    this.team1Spawns = map.createFromObjects('Spawns', 'team1', {
      visible: false,
    });
    this.team2Spawns = map.createFromObjects('Spawns', 'team2', {
      visible: false,
    });

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

*/
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

    this.deadText = this.add.text(480, 260, '');
    this.deadText.setColor('#000');
    this.deadText.scrollFactorX = 0;
    this.deadText.scrollFactorY = 0;

    this.statusText = this.add.text(480, 160, '');
    this.statusText.setColor('#000');
    this.statusText.setFontSize(30);
    this.statusText.scrollFactorX = 0;
    this.statusText.scrollFactorY = 0;

    this.scoreText = this.add.text(40, 40, '');
    this.scoreText.setColor('#000');
    this.scoreText.setFontSize(30);
    this.scoreText.scrollFactorX = 0;
    this.scoreText.scrollFactorY = 0;

    this.ammoText = this.add.text(1040, 40, '');
    this.ammoText.setColor('#000');
    this.ammoText.setFontSize(30);
    this.ammoText.scrollFactorX = 0;
    this.ammoText.scrollFactorY = 0;

    if (this.online.valueOf()) {
      this.ws = new WebSocketHandler(this, 'ws://23.101.58.18:9000');
    } else {
      this.ws = new WebSocketHandler(this, 'ws://localhost:9000');
    }
  }

  public setStatusText(text: string) {
    this.statusTextTime = new Date().getTime();
    this.statusText?.setText(text);
  }

  public update() {
    if (new Date().getTime() - this.statusTextTime < 3000) {
      this.statusText?.setVisible(true);
    } else {
      this.statusText?.setVisible(false);
    }

    const team1Score = this.gameState.team1Score;
    const team2Score = this.gameState.team2Score;

    this.scoreText?.setText([
      `Your team: ${this.player!.team === team1Name ? team1Score : team2Score}`,
      `Enemy team: ${
        this.player!.team === team1Name ? team2Score : team1Score
      }`,
    ]);

    this.ammoText?.setText(
      `Ammo: ${this.player?.bullets}/${this.player?.maxBullets}`,
    );

    // don't update objects if game is not active
    if (!this.gameState.gameActive) {
      this.gameWasActive = false;

      // zero objects velocities so they don't move
      this.gameObjects.forEach(o => {
        const body: Phaser.Physics.Arcade.Body | undefined = o.body as any;
        if (body) {
          body.setVelocity(0, 0);
        }
      });
      return;
    }

    // if game just got restarted, restart
    if (!this.gameWasActive && this.gameState.gameActive) {
      this.gameWasActive = true;
      // this.gameObjects.forEach(o => o.destroy());
      // this.gameObjects = [];
      this.player?.spawn(this.player!.team!);
    }

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
