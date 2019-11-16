import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { Opponent } from './Opponent';

const bulletVelocity = 1000;

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  gameScene?: GameScene;
  local: boolean;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    direction: Phaser.Math.Vector2,
    local: boolean, // remote bullets don't emit any events
  ) {
    super(scene, x, y, 'bullet');

    this.scene = scene;
    this.gameScene = scene;

    this.local = local;

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
    const opponent: Opponent | undefined = [object1, object2].find(
      obj => obj instanceof Opponent,
    ) as any;

    if (opponent && this.local) {
      this.gameScene!.ws!.emitMsg({
        kind: 'Hit',
        data: {
          dmg: 20,
          playerId: opponent.id,
        },
      });
    }

    this.destroy();
  };
}
