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
    this.anims.play('idle');
  }

  public update() {
    this.handleInput();
    this.updateAnimations();
  }

  private updateAnimations() {
    const currentAnim = this.anims.getCurrentKey();
    if (this.body.velocity.length() > 0) {
      this.anims.play('move', true);
    } else if (currentAnim === 'move') {
      this.anims.play('idle', true);
    }
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

    if (gamepad?.rightStick.x || gamepad?.rightStick.y) {
      this.setRotation(
        Math.atan2(gamepad?.rightStick.y, gamepad?.rightStick.x),
      );
    } else if (this.scene.mousePosition) {
      const mouse = this.scene.mousePosition;
      this.setRotation(Math.atan2(mouse.y, mouse.x));
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
    const rotation = this.rotation;
    const direction = new Phaser.Math.Vector2(
      Math.cos(rotation),
      Math.sin(rotation),
    );

    this.scene.gameObjects.push(
      new Bullet(this.scene, this.x, this.y, direction),
    );

    const anim = this.anims.play('shoot');
    anim.on(
      'animationcomplete',
      () => {
        this.anims.play('idle');
        anim.removeListener('animationcomplete');
      },
      this,
    );
  }
}
