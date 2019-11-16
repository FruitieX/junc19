import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { Point } from '../2d-visibility/point';
import {
  OpponentPostion as OpponentPosition,
  TeamType,
  team1Name,
  FlagStateMsg,
  FlagStateMsgEvent,
} from '../typings/ws-messages';

export class Flag extends Phaser.Physics.Arcade.Sprite {
  game = this.scene.game;

  gameScene: GameScene;
  team?: TeamType;
  returnCollider?: Phaser.Physics.Arcade.Collider;
  pickupCollider?: Phaser.Physics.Arcade.Collider;
  basePos: Point;
  flagTeam: 1 | 2;
  isEnemyFlag: boolean;
  isHome = true;

  heldByLocalPlayer = false;
  heldByPlayerId?: string;

  constructor(scene: GameScene, team: TeamType, initPos: Point) {
    super(scene, initPos.x, initPos.y, 'flags', team === team1Name ? 0 : 1);

    this.flagTeam = team === team1Name ? 1 : 2;
    this.isEnemyFlag = team === scene.player!.team;
    this.basePos = initPos;

    scene.add.existing(this);
    this.gameScene = scene;
    this.team = team;
    this.setScale(2);

    this.scene.physics.add.existing(this);
    this.scene.physics.add.overlap(this, scene.player!, this.handleOverlap);
  }

  private handleOverlap = () => {
    if (this.isEnemyFlag) {
      if (!this.heldByLocalPlayer && this.heldByPlayerId === undefined) {
        this.pickupEnemyFlag();
      }
    } else {
      if (!this.isHome) {
        this.returnFriendlyFlag();
      }
    }
  };

  private emitFlagMsg(event: FlagStateMsgEvent) {
    const msg: FlagStateMsg = {
      kind: 'FlagState',
      data: {
        event,
        flagTeam: this.flagTeam,
        playerId: this.gameScene.ws?.playerId!,
      },
    };
    this.gameScene.ws!.emitMsg(msg);
  }

  private pickupEnemyFlag() {
    // TODO: why is this.pickupCollider undefined
    // if (this.pickupCollider) {
    //   console.log('destroy');
    //   this.pickupCollider.destroy();
    // }

    console.log('pickup enemy flag');

    this.heldByLocalPlayer = true;

    this.emitFlagMsg('PickUp');
  }

  private returnFriendlyFlag() {
    console.log('return friendly flag');
    // if (this.returnCollider) {
    //   this.returnCollider.destroy();
    // }

    this.setPosition(this.basePos.x, this.basePos.y);

    this.emitFlagMsg('Return');
  }

  private captureEnemyFlag() {
    console.log('capture enemy flag');
    this.emitFlagMsg('Capture');
  }

  public dropEnemyFlag() {
    console.log('drop enemy flag');
    this.heldByLocalPlayer = false;
    this.emitFlagMsg('Drop');
  }

  public update() {
    const playerTeam = this.gameScene.player!.team === team1Name ? 1 : 2;
    this.isEnemyFlag = this.flagTeam !== playerTeam;

    if (this.heldByPlayerId) {
      const opponentPos: OpponentPosition | undefined = this.gameScene
        .opponentMap[this.heldByPlayerId];

      if (opponentPos) {
        this.setPosition(opponentPos.pos.x, opponentPos.pos.y);
        this.setVelocity(opponentPos.vel.x, opponentPos.vel.y);
      }
    } else if (this.heldByLocalPlayer) {
      const player = this.gameScene.player!;
      this.setPosition(player.x, player.y);
      this.setVelocity(player.body.velocity.x, player.body.velocity.y);
    } else {
      this.setVelocity(0, 0);
    }
  }
}
