import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { Bullet } from '../gameObjects/Bullet';

interface InputState {
  fire: boolean;
}

const initInputState: InputState = {
  fire: false,
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  scene: GameScene = this.scene;
  game = this.scene.game;
  keys = this.scene.input.keyboard.createCursorKeys();

  playerVelocity = 500;

  prevInputState = initInputState;

  constructor(scene: Phaser.Scene) {
    super(scene, 100, 100, 'player');
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }

  public update() {
    this.handleInput();
  }

  private handleInput() {
    const gamepad: Phaser.Input.Gamepad.Gamepad | undefined = this.scene.input
      .gamepad?.pad1;

    if (this.keys.up?.isDown || gamepad?.up) {
      this.setVelocityY(-this.playerVelocity);
    } else if (this.keys.down?.isDown || gamepad?.down) {
      this.setVelocityY(this.playerVelocity);
    } else {
      this.setVelocityY(0);
    }

    if (this.keys.left?.isDown || gamepad?.left) {
      this.setVelocityX(-this.playerVelocity);
    } else if (this.keys.right?.isDown || gamepad?.right) {
      this.setVelocityX(this.playerVelocity);
    } else {
      this.setVelocityX(0);
    }

    const fireDown = this.keys.space?.isDown || gamepad?.A;

    if (fireDown && !this.prevInputState.fire) {
      this.shoot();
    }

    this.prevInputState = {
      fire: fireDown,
    };
  }

  private shoot() {
    const direction = new Phaser.Math.Vector2(1, 0);

    this.scene.gameObjects.push(
      new Bullet(this.scene, this.x, this.y, direction),
    );
  }
}
