import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { TeamType } from '../typings/ws-messages';

export class Opponent extends Phaser.Physics.Arcade.Sprite {
  game = this.scene.game;
  id: string;
  team: TeamType;
  gameScene: GameScene;
  isAlive: boolean;

  constructor(scene: GameScene, id: string, team: TeamType) {
    super(
      scene,
      100,
      100,
      `player${team === scene.player!.team ? 'Orange' : 'Purple'}`,
    );
    this.gameScene = scene as GameScene;
    scene.gameObjectContainer!.add(this);
    this.scene.physics.add.existing(this);
    this.id = id;
    this.team = team;
    this.anims.play(`idle_${this.getColor(team)}`);
    this.isAlive = true;

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
  private getColor = (team: TeamType) => {
    return team === this.gameScene.player!.team ? 'orange' : 'purple';
  };
  public kill = () => {
    this.setScale(0.5);
    this.isAlive = false;
  };
  public reset = () => {
    this.setScale(1);
    this.isAlive = true;
  };
}
