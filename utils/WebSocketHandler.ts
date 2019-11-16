import Phaser from 'phaser';
import {
  WsMessage,
  PlayerPosUpdateMsg,
  TeamType,
} from '../typings/ws-messages';
import { GameScene } from '../scenes/GameScene';
import { handleWsMsg } from './handleWsMsg';

export class WebSocketHandler extends Phaser.GameObjects.GameObject {
  wsc: WebSocket;
  playerId?: string;
  team?: TeamType;
  gameScene: GameScene;

  constructor(scene: GameScene, connectIp: string) {
    super(scene, 'ws');
    this.gameScene = scene;

    this.wsc = new WebSocket(connectIp);

    this.wsc.addEventListener('open', () => console.log('conneted'));
    this.wsc.addEventListener('message', handleWsMsg(scene));

    this.on('destroy', () => {
      console.log('destroying websocket connection');
      this.wsc.close();
    });
  }

  public setPlayerData(playerId: string, team: TeamType) {
    this.playerId = playerId;
    this.team = team;
  }

  public emitMsg(msg: WsMessage) {
    if (msg.kind !== 'AllPlayerPosUpdate' && msg.kind !== 'PlayerPosUpdate') {
      console.log('sending msg: ', msg);
    }
    this.wsc.send(JSON.stringify(msg));
  }

  public startServerUpdateLoop() {
    setInterval(() => {
      const player = this.gameScene.player;
      if (!player) return;

      const pos = player.getPosition();
      const vel = player.body.velocity;

      if (this.playerId !== undefined && this.wsc !== undefined) {
        const msg: PlayerPosUpdateMsg = {
          kind: 'PlayerPosUpdate',
          data: {
            id: this.playerId,
            pos,
            vel,
            rot: player.rotation,
          },
        };

        this.emitMsg(msg);
      }
    }, 1000 / 100);
  }
}
