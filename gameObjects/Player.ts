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

  playerVelocity = 250;

  prevInputState = initInputState;

  constructor(scene: GameScene) {
    super(scene, 100, 100, 'player');
    scene.gameObjectContainer!.add(this);
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
  public getPosition() {
    return { x: this.x, y: this.y };
  }
  private handleInput() {
    const gamepad: Phaser.Input.Gamepad.Gamepad | undefined = this.scene.input
      .gamepad?.pad1;

    const deadThreshold = 0.1;

    if (
      this.keys.up?.isDown ||
      gamepad?.up ||
      gamepad?.leftStick.y < -deadThreshold
    ) {
      this.setVelocityY(-this.playerVelocity);
    } else if (
      this.keys.down?.isDown ||
      gamepad?.down ||
      gamepad?.leftStick.y > deadThreshold
    ) {
      this.setVelocityY(this.playerVelocity);
    } else {
      this.setVelocityY(0);
    }

    if (
      this.keys.left?.isDown ||
      gamepad?.left ||
      gamepad?.leftStick.x < -deadThreshold
    ) {
      this.setVelocityX(-this.playerVelocity);
    } else if (
      this.keys.right?.isDown ||
      gamepad?.right ||
      gamepad?.leftStick.x > deadThreshold
    ) {
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

    const fireDown = this.keys.space?.isDown || gamepad?.A || !!gamepad?.R2;

    if (fireDown && !this.prevInputState.fire) {
      this.shoot();
    }

    this.prevInputState = {
      fire: fireDown,
    };
  }

  private shoot() {
    const rotation = this.rotation;
    const x = Math.cos(rotation);
    const y = Math.sin(rotation);

    const direction = new Phaser.Math.Vector2(x, y);

    const offsetVector = new Phaser.Math.Vector2(
      x * Math.cos(30) + y * Math.sin(30),
      -x * Math.sin(30) + y * Math.cos(30),
    );

    this.scene.gameObjects.push(
      new Bullet(
        this.scene,
        this.x + offsetVector.x * 15,
        this.y + offsetVector.y * 15,
        direction,
      ),
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
