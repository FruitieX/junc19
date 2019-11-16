import Phaser, { NONE } from 'phaser';
import { Player } from '../gameObjects/Player';
import PlayerSprite from '../assets/sprites/player.png';
import BulletSprite from '../assets/bullet.png';
import DesertTileMap from '../assets/Desert_Tilemap_800x800.json';
import DesertTileSet from '../assets/desert.png';
import Mozart from '../assets/audio/mozart_einekleine.mp3';

export class GameScene extends Phaser.Scene {
  gameObjects: Phaser.GameObjects.GameObject[] = [];
  music?: Phaser.Sound.BaseSound;
  minimap?: Phaser.Cameras.Scene2D.CameraManager;
  game: Phaser.Game;
  mousePosition?: Phaser.Math.Vector2;
  barriers?: Phaser.Tilemaps.StaticTilemapLayer;

  constructor(game: Phaser.Game) {
    super(game);
    this.game = game;
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
    map.createStaticLayer('Terrain Base', tileset, 0, 0).setScale(MAP_SCALE);
    this.barriers = map
      .createStaticLayer('Barriers', tileset, 0, 0)
      .setScale(MAP_SCALE);

    this.barriers.setCollisionByProperty({ collides: true });

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

    const player = new Player(this);
    this.physics.add.collider(player, this.barriers);
    this.gameObjects.push(player);

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
      bounds: {
        x: 0,
        y: 0,
        width: map.widthInPixels * MAP_SCALE,
        height: map.heightInPixels * MAP_SCALE,
      },
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
  }

  public update() {
    this.gameObjects.forEach(o => o.update());
  }
}
