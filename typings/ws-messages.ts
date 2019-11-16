import { trackableObjects } from '../server/Server';

export interface InitMsg {
  kind: 'Init';
  data: {
    playerId: string;
  };
}
export const isInitMsg = (msg: WsMessage): msg is InitMsg =>
  (msg as InitMsg).kind === 'Init';

export interface DisconnectMsg {
  kind: 'Disconnect';
  data: {
    playerId: string;
  };
}
export const isDisconnectMsg = (msg: WsMessage): msg is DisconnectMsg =>
  (msg as DisconnectMsg).kind === 'Disconnect';

export interface PlayerPosUpdateMsg {
  kind: 'PlayerPosUpdate';
  data: {
    pos: trackableObjects;
  };
}
export const isPlayerPosUpdateMsg = (
  msg: WsMessage,
): msg is PlayerPosUpdateMsg =>
  (msg as PlayerPosUpdateMsg).kind === 'PlayerPosUpdate';

export interface HitMsg {
  kind: 'Hit';
  data: {
    playerId: string;
    dmg: number;
  };
}
export const isHitMsg = (msg: WsMessage): msg is HitMsg =>
  (msg as HitMsg).kind === 'Hit';

interface Vector {
  x: number;
  y: number;
}

export interface BulletSpawnMsg {
  kind: 'SpawnBullet';
  data: {
    x: number;
    y: number;
    direction: Vector;
  };
}

export const isBulletSpawnMsg = (msg: WsMessage): msg is BulletSpawnMsg =>
  (msg as BulletSpawnMsg).kind === 'SpawnBullet';

export type WsMessage =
  | InitMsg
  | DisconnectMsg
  | PlayerPosUpdateMsg
  | HitMsg
  | BulletSpawnMsg;
