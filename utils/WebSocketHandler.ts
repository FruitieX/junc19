import Phaser from 'phaser';
import {
  WsMessage,
  PlayerPosUpdateMsg,
  teamType,
} from '../typings/ws-messages';
import { GameScene } from '../scenes/GameScene';
import { handleWsMsg } from './handleWsMsg';

export class WebSocketHandler extends Phaser.GameObjects.GameObject {
  wsc: WebSocket;
  playerId?: string;
  team?: teamType;
  gameScene: GameScene;

  constructor(scene: GameScene) {
    super(scene, 'ws');
    this.gameScene = scene;

    // initialize players
    this.wsc = new WebSocket('ws://localhost:9000');

    this.wsc.addEventListener('open', () => console.log('conneted'));
    this.wsc.addEventListener('message', handleWsMsg(scene));

    this.on('destroy', () => this.wsc.close());
  }

  public setPlayerData(playerId: string, team: teamType) {
    this.playerId = playerId;
    this.team = team;
  }

  public emitMsg(msg: WsMessage) {
    this.wsc.send(JSON.stringify(msg));
  }

  public startServerUpdateLoop() {
    setInterval(() => {
      const player = this.gameScene.player;
      if (!player) return;

      const pos = player.getPosition();

      if (this.playerId !== undefined && this.wsc !== undefined) {
        const msg: PlayerPosUpdateMsg = {
          kind: 'PlayerPosUpdate',
          data: {
            id: this.playerId,
            pos,
            rot: player.rotation,
          },
        };

        this.emitMsg(msg);
      }
    }, 1000 / 20);
  }
}
