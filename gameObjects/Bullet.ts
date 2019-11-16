import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { Opponent } from './Opponent';

const bulletVelocity = 1000;

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  gameScene?: GameScene;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    direction: Phaser.Math.Vector2,
  ) {
    super(scene, x, y, 'bullet');

    this.scene = scene;
    this.gameScene = scene;

    scene.gameObjectContainer!.add(this);
    this.scene.physics.add.existing(this);
    this.scene.physics.add.collider(this, scene.barriers!, this.onCollide);
    this.scene.physics.add.collider(this, scene.boundaries!, this.onCollide);
    scene.opponents.forEach(obj =>
      this.scene.physics.add.collider(this, obj, this.onCollide),
    );
    this.setScale(0.5);
    this.setVelocity(
      direction.x * bulletVelocity,
      direction.y * bulletVelocity,
    );
  }

  private onCollide: ArcadePhysicsCallback = (object1, object2) => {
    if (object2 instanceof Opponent) {
      this.gameScene!.ws!.emitMsg({
        kind: 'Hit',
        data: {
          dmg: 20,
          playerId: object2.id,
        },
      });
    }

    this.destroy();
  };
}
