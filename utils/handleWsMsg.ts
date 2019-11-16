import {
  WsMessage,
  isInitMsg,
  isDisconnectMsg,
  isPlayerPosUpdateMsg,
  isHitMsg,
} from '../typings/ws-messages';
import { GameScene } from '../scenes/GameScene';
import { Opponent } from '../gameObjects/Opponent';

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
    const updatedPositions = message.data.pos;
    for (const key in updatedPositions) {
      // ignore our own playerId
      if (key !== gameScene.playerId) {
        if (gameScene.opponentMap[key] === undefined) {
          gameScene.gameObjects.push(
            new Opponent(
              gameScene,
              () => undefined /* TODO this.spawnBullet */,
              key,
            ),
          );
        }
        gameScene.opponentMap[key] = updatedPositions[key];
      }
    }
  }

  if (isHitMsg(message)) {
    console.log('unhandled msg', message);
  }
};
