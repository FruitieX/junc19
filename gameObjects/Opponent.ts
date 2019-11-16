import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';

export class Opponent extends Phaser.Physics.Arcade.Sprite {
  game = this.scene.game;
  id: string;

  constructor(scene: GameScene, id: string) {
    super(scene, 100, 100, 'player');
    scene.gameObjectContainer!.add(this);
    this.scene.physics.add.existing(this);
    this.id = id;

    scene.opponents.push(this);
  }
  public update() {
    const opponentServerData = (this.scene as GameScene).opponentMap[this.id];
    if (opponentServerData !== undefined) {
      this.setPosition(opponentServerData.pos.x, opponentServerData.pos.y);
      this.setRotation(opponentServerData.rot);
      this.setVelocity(opponentServerData.vel.x, opponentServerData.vel.y);
    }
  }
}
