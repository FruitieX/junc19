import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { Bullet } from '../gameObjects/Bullet';
import { BulletSpawnMsg, TeamType, team1Name } from '../typings/ws-messages';
import { Flag } from './Flag';

interface InputState {
  fire: boolean;
  reload: boolean;
}

const initInputState: InputState = {
  fire: false,
  reload: false,
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  scene: GameScene = this.scene;
  game = this.scene.game;
  keys = this.scene.input.keyboard.createCursorKeys();
  isAddedToMap: boolean;
  maxBullets = 20;
  bullets = 20;
  hp = 100;

  respawnAtTime?: number;

  playerVelocity = 250;

  prevInputState = initInputState;
  gameScene: GameScene;
  team?: TeamType;
  healthbar?: Phaser.GameObjects.Rectangle;
  ballsLeft?: Phaser.Cameras.Scene2D.CameraManager;
  isReloading?: boolean;
  reloadBar?: Phaser.GameObjects.Rectangle;
  reloadStartTime: number = 0;
  reloadTime: number = 3 * 1000;

  lastShoot = 0;
  fireRate = 100;

  constructor(scene: GameScene) {
    super(scene, 100, 100, 'playerOrange');
    this.isAddedToMap = false;
    scene.add.existing(this);
    this.gameScene = scene;
    this.scene.physics.add.existing(this);
    this.anims.play('idle_orange');
  }
  private reload() {
    if (this.isReloading || this.bullets === this.maxBullets) return;
    this.isReloading = true;
    this.reloadBar!.setActive(true);

    this.reloadStartTime = new Date().getTime();
    setTimeout(() => {
      this.bullets = this.maxBullets;
      this.isReloading = false;
      this.reloadBar!.setSize(0, 0);
    }, 3 * 1000);
  }
  public update() {
    if (this.healthbar === undefined) {
      this.healthbar = this.scene.add.rectangle(0, 0, 80, 10, 0xff0000);
    }
    if (this.reloadBar === undefined) {
      this.reloadBar = this.scene.add.rectangle(0, 0, 80, 10, 0x00ffff);
      this.reloadBar.setSize(0, 0);
    }
    this.healthbar.setPosition(this.x - 5, this.y - 50);
    this.reloadBar.setPosition(this.x - 5, this.y - 55);
    this.healthbar.setSize((this.hp / 100) * 80, 4);
    if (this.isReloading) {
      this.reloadBar.setSize(
        ((this.reloadTime - (new Date().getTime() - this.reloadStartTime)) /
          this.reloadTime) *
          80,
        4,
      );
    }
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
      this.anims.play('move_orange', true);
    } else if (currentAnim === 'move') {
      this.anims.play('idle_orange', true);
    }
  }
  public getPosition() {
    return { x: this.x, y: this.y, rotation: this.rotation };
  }
  public spawn(team: TeamType) {
    console.log(
      `You are joining ${team} (playerId: ${this.scene.ws?.playerId})`,
    );

    const teamNumber = team === team1Name ? 1 : 2;

    this.hp = 100;
    this.team = team;

    const t1spawns = this.gameScene.team1Spawns!;
    const t2spawns = this.gameScene.team2Spawns!;

    if (teamNumber === 1) {
      const pos = t1spawns[Math.floor(Math.random() * t1spawns.length)];
      this.setPosition(pos.x * 2, pos.y * 2);
    } else {
      const pos = t2spawns[Math.floor(Math.random() * t2spawns.length)];
      this.setPosition(pos.x * 2, pos.y * 2);
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
    const reloadDown =
      this.keys.shift!.isDown || gamepad?.B || !!gamepad?.L1 || !!gamepad?.L2;
    if (reloadDown && !this.prevInputState.fire) {
      this.reload();
    }
    const fireDown =
      this.keys.space?.isDown || gamepad?.A || !!gamepad?.R1 || !!gamepad?.R2;

    if (
      fireDown &&
      !this.isReloading &&
      new Date().getTime() - this.lastShoot >= this.fireRate
    ) {
      this.shoot();
    }

    this.prevInputState = {
      fire: fireDown,
      reload: reloadDown,
    };
  }

  private shoot() {
    this.lastShoot = new Date().getTime();

    if (this.bullets > 0) {
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

      const anim = this.anims.play('shoot_orange');
      anim.on(
        'animationcomplete',
        () => {
          this.anims.play('idle_orange');
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

    this.bullets = this.bullets - 1;
    this.bullets = Math.max(this.bullets, 0);

    if (this.bullets === 0) {
      this.reload();
    }
  }
  public takeDamage(dmg: number) {
    if (this.isDead()) return;
    const anim = this.anims.play('blood_orange');
    anim.on(
      'animationcomplete',
      () => {
        this.anims.play('idle_orange');
        anim.removeListener('animationcomplete');
      },
      this,
    );

    this.hp -= dmg;
    if (this.isDead()) {
      this.die();
    }
  }

  public die() {
    console.log('you died :(');
    this.respawnAtTime = new Date().getTime() + 5000;

    const heldFlag: Flag | undefined = this.gameScene!.gameObjects!.filter(
      obj => obj instanceof Flag,
    ).find((flag: any) => (flag as Flag).heldByLocalPlayer) as any;
    console.log('heldFlag', heldFlag);

    if (heldFlag) {
      heldFlag.dropEnemyFlag();
    }
  }
}
