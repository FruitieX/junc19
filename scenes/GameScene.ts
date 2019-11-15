import Phaser from 'phaser';
import { Player } from '../Player';
import PlayerSprite from '../assets/player.png';

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
  }

  public create() {
    this.cameras.main.setBackgroundColor('#fff');

    this.players = [new Player(this)];
  }

  public update() {
    this.players.forEach(player => player.update());
  }
}
