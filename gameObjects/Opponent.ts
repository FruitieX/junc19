import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { teamType } from '../typings/ws-messages';

export class Opponent extends Phaser.Physics.Arcade.Sprite {
  game = this.scene.game;
  id: string;
  team: teamType;
  gameScene: GameScene;

  constructor(scene: GameScene, id: string, team: teamType) {
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
  private getColor = (team: teamType) => {
    return team === this.gameScene.player!.team ? 'orange' : 'purple';
  };
}
