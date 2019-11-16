import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { Bullet } from '../gameObjects/Bullet';
import { BulletSpawnMsg, teamType as TeamType } from '../typings/ws-messages';

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
  isAddedToMap: boolean;

  hp = 100;

  respawnAtTime?: number;

  playerVelocity = 250;

  prevInputState = initInputState;
  gameScene: GameScene;
  team?: TeamType;

  constructor(scene: GameScene) {
    super(scene, 100, 100, 'player');
    this.isAddedToMap = false;
    scene.gameObjectContainer!.add(this);
    this.gameScene = scene;
    this.scene.physics.add.existing(this);
    this.anims.play('idle');
  }

  public update() {
    this.handleInput();
    this.updateAnimations();
    this.handleRespawn();
  }

  private handleRespawn() {
    const respawnBlockTime = (this.respawnAtTime || 0) - new Date().getTime();

    if (this.respawnAtTime && respawnBlockTime <= 0) {
      this.spawn(this.team!);
    }

    if (this.isDead() && this.gameScene.deadText) {
      const secondsLeft = Math.ceil(respawnBlockTime / 1000);
      this.gameScene.deadText.setText(
        `You died! Respawn in ${secondsLeft} second(s).`,
      );
      this.gameScene.deadText.setVisible(true);
    } else if (this.gameScene.deadText) {
      this.gameScene.deadText.setVisible(false);
    }
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
    return { x: this.x, y: this.y, rotation: this.rotation };
  }
  public spawn(team: TeamType) {
    console.log(
      `You are joining ${team} (playerId: ${this.scene.ws?.playerId})`,
    );

    this.hp = 100;
    this.team = team;

    if (team === 'Team New') {
      this.setPosition(10 * 32, 50 * 32);
    } else {
      this.setPosition(83 * 32, 50 * 32);
    }

    this.isAddedToMap = true;
    this.respawnAtTime = undefined;
  }

  public isDead() {
    return this.hp <= 0;
  }
  private handleInput() {
    // ignore inputs if player is dead
    if (this.isDead() || !this.isAddedToMap) {
      this.setVelocity(0, 0);
      return;
    }

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
    const vectorX = Math.cos(rotation);
    const vectorY = Math.sin(rotation);

    const direction = new Phaser.Math.Vector2(vectorX, vectorY);

    const offsetVector = new Phaser.Math.Vector2(
      vectorX * Math.cos(30) + vectorY * Math.sin(30),
      -vectorX * Math.sin(30) + vectorY * Math.cos(30),
    );

    const bulletInitPositionX = this.x + offsetVector.x * 15;
    const bulletInitPositionY = this.y + offsetVector.y * 15;

    this.scene.gameObjects.push(
      new Bullet(
        this.scene,
        bulletInitPositionX,
        bulletInitPositionY,
        direction,
        true,
        this.scene.ws?.playerId!,
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

    const spawnBulletMessage: BulletSpawnMsg = {
      kind: 'SpawnBullet',
      data: {
        x: bulletInitPositionX,
        y: bulletInitPositionY,
        direction: {
          x: direction.x,
          y: direction.y,
        },
        ownerId: this.scene.ws?.playerId!,
      },
    };

    this.scene.ws!.emitMsg(spawnBulletMessage);
  }

  public takeDamage(dmg: number) {
    if (this.isDead()) return;

    this.hp -= dmg;
    if (this.isDead()) {
      console.log('you died :(');
      this.respawnAtTime = new Date().getTime() + 5000;
    }
  }
}
