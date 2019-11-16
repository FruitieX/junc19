import {
  WsMessage,
  isInitMsg,
  isDisconnectMsg,
  isHitMsg,
  isBulletSpawnMsg,
  isAllPlayerPosUpdateMsg,
  isFlagStateMsg,
} from '../typings/ws-messages';
import { GameScene } from '../scenes/GameScene';
import { Opponent } from '../gameObjects/Opponent';
import { Bullet } from '../gameObjects/Bullet';

export const handleWsMsg = (gameScene: GameScene) => (ev: MessageEvent) => {
  var message = JSON.parse(ev.data) as WsMessage;

  if (isInitMsg(message)) {
    gameScene.ws!.setPlayerData(message.data.playerId, message.data.team);
    gameScene.ws!.startServerUpdateLoop();
    gameScene.player!.spawn(message.data.team);

    return;
  }

  if (isDisconnectMsg(message)) {
    const playerId = message.data.playerId;
    console.log('disconnect', message);

    let op = gameScene.gameObjects.find(
      go => go instanceof Opponent && (go as Opponent).id === playerId,
    );
    if (op !== undefined) {
      gameScene.gameObjects = gameScene.gameObjects.filter(it => it !== op);
      delete gameScene.opponentMap[playerId];
      op.destroy();
    }

    return;
  }

  if (isAllPlayerPosUpdateMsg(message)) {
    const updatedPositions = message.data.pos;
    for (const key in updatedPositions) {
      // ignore our own playerId
      if (key !== gameScene.ws!.playerId) {
        if (gameScene.opponentMap[key] === undefined) {
          gameScene.gameObjects.push(new Opponent(gameScene, key));
        }
        gameScene.opponentMap[key] = updatedPositions[key];
      }
    }

    return;
  }

  if (isHitMsg(message)) {
    console.log('you were hit');
    gameScene.player!.takeDamage(message.data.dmg);

    return;
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
        false,
        message.data.ownerId,
      ),
    );

    return;
  }

  if (isFlagStateMsg(message)) {
    const data = message.data;
    const flag = data.flagTeam === 1 ? gameScene.flag1! : gameScene.flag2!;
    switch (data.event) {
      case 'PickUp': {
        flag.heldByPlayerId = data.playerId;
        break;
      }
      case 'Drop': {
        flag.heldByPlayerId = undefined;
        break;
      }
      case 'Return': {
        flag.setPosition(flag.basePos.x, flag.basePos.y);
        break;
      }
      default: {
        console.log('unhandled flag state msg:', message);
      }
    }
  }

  console.log('unhandled msg', message);
};
