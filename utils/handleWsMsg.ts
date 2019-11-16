import {
  WsMessage,
  isInitMsg,
  isDisconnectMsg,
  isPlayerPosUpdateMsg,
  isHitMsg,
} from '../typings/ws-messages';
import { GameScene } from '../scenes/GameScene';

export const handleWsMsg = (gameScene: GameScene) => (ev: MessageEvent) => {
  var message = JSON.parse(ev.data) as WsMessage;

  if (isInitMsg(message)) {
    console.log('unhandled msg', message);
  }

  if (isDisconnectMsg(message)) {
    console.log('unhandled msg', message);
  }

  if (isPlayerPosUpdateMsg(message)) {
    console.log('unhandled msg', message);
  }

  if (isHitMsg(message)) {
    console.log('unhandled msg', message);
  }

  // if (message.id !== undefined) {
  //   this.id = message.id;
  //   this.startUpdating();
  // }
  // if (message.dissconnected !== undefined) {
  //   let op = this.gameObjects.find(
  //     go =>
  //       go instanceof Opponent && (go as Opponent).id === message.dissconnected,
  //   );
  //   if (op !== undefined) {
  //     this.gameObjects = this.gameObjects.filter(it => it !== op);
  //     delete this.opponentMap[message.dissconnected];
  //     op.destroy;
  //   }
  // }
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
