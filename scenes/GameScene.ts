import Phaser from 'phaser';
import { Player } from '../Player';
import PlayerSprite from '../assets/player.png';
import Mozart from '../assets/audio/mozart_einekleine.mp3';

export class GameScene extends Phaser.Scene {
  players: Player[] = [];
  music?: Phaser.Sound.BaseSound;
  constructor() {
    super({});
  }

  public preload() {
    this.load.spritesheet('player', PlayerSprite, {
      frameWidth: 128,
      frameHeight: 128,
    });

    this.load.audio('music', Mozart);
  }

  public create() {
    this.cameras.main.setBackgroundColor('#fff');

    this.players = [new Player(this)];

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
  }

  public update() {
    this.players.forEach(player => player.update());
  }
}
