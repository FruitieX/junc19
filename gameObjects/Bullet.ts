import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { Opponent } from './Opponent';

const bulletVelocity = 1000;

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  gameScene?: GameScene;

  /**
   * Don't let remote bullets emit hit events
   */
  isLocalBullet: boolean;
  ownerId: string;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    direction: Phaser.Math.Vector2,
    isLocalBullet: boolean,
    ownerId: string,
  ) {
    super(scene, x, y, 'bullet');

    this.scene = scene;
    this.gameScene = scene;

    this.isLocalBullet = isLocalBullet;

    this.ownerId = ownerId;
    scene.gunShotSound!.play();

    scene.gameObjectContainer!.add(this);
    this.scene.physics.add.existing(this);
    this.scene.physics.add.collider(this, scene.barriers!, this.onCollide);
    this.scene.physics.add.collider(this, scene.boundaries!, this.onCollide);
    scene.opponents
      // bullets can't hit their owner
      .filter(opponent => opponent.id !== this.ownerId)
      .forEach(obj =>
        this.scene.physics.add.collider(this, obj, this.onCollide),
      );
    this.setScale(0.5);
    this.setVelocity(
      direction.x * bulletVelocity,
      direction.y * bulletVelocity,
    );

    // collide remote bullets against local Player object
    if (!isLocalBullet) {
      this.scene.physics.add.collider(
        this,
        this.gameScene!.player!,
        this.onCollide,
      );
    }
  }

  private onCollide: ArcadePhysicsCallback = (object1, object2) => {
    const opponent: Opponent | undefined = [object1, object2].find(
      obj => obj instanceof Opponent,
    ) as any;

    if (opponent && this.isLocalBullet) {
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
