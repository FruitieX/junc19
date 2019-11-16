import {
  WsMessage,
  isInitMsg,
  isDisconnectMsg,
  isPlayerPosUpdateMsg,
  isHitMsg,
  isBulletSpawnMsg,
} from '../typings/ws-messages';
import { GameScene } from '../scenes/GameScene';
import { Opponent } from '../gameObjects/Opponent';
import { Bullet } from '../gameObjects/Bullet';

export const handleWsMsg = (gameScene: GameScene) => (ev: MessageEvent) => {
  var message = JSON.parse(ev.data) as WsMessage;

  if (isInitMsg(message)) {
    gameScene.setPlayerId(message.data.playerId);
    gameScene.startServerUpdateLoop();
  }

  if (isDisconnectMsg(message)) {
    const playerId = message.data.playerId;

    let op = gameScene.gameObjects.find(
      go => go instanceof Opponent && (go as Opponent).id === playerId,
    );
    if (op !== undefined) {
      gameScene.gameObjects = gameScene.gameObjects.filter(it => it !== op);
      delete gameScene.opponentMap[playerId];
      op.destroy();
    }
  }

  if (isPlayerPosUpdateMsg(message)) {
    console.log('unhandled msg', message);
  }

  if (isHitMsg(message)) {
    console.log('unhandled msg', message);
  }

  if (isBulletSpawnMsg(message)) {
    gameScene.gameObjects.push(
      new Bullet(
        gameScene,
        message.data.x,
        message.data.y,
        new Phaser.Math.Vector2(
          message.data.direction.x,
          message.data.direction.y,
        ),
      ),
    );
  }

  // if (this.id !== undefined && message.update !== undefined) {
  //   for (let key in message.update) {
  //     if (key !== this.id) {
  //       if (this.opponentMap[key] === undefined) {
  //         this.gameObjects.push(new Opponent(this, this.spawnBullet, key));
  //       }
  //       this.opponentMap[key] = message.update[key];
  //     }
  //   }
  // }
};
