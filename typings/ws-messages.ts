import { TrackableObjects } from '../server/Server';

export type OpponentPostion = {
  pos: {
    x: number;
    y: number;
  };
  vel: {
    x: number;
    y: number;
  };
  rot: number;
};

export interface InitMsg {
  kind: 'Init';
  data: {
    playerId: string;
    team: TeamType;
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

export interface AllPlayerPosUpdateMsg {
  kind: 'AllPlayerPosUpdate';
  data: {
    pos: TrackableObjects;
  };
}
export const isAllPlayerPosUpdateMsg = (
  msg: WsMessage,
): msg is AllPlayerPosUpdateMsg =>
  (msg as AllPlayerPosUpdateMsg).kind === 'AllPlayerPosUpdate';

export interface PlayerPosUpdateMsg {
  kind: 'PlayerPosUpdate';
  data: {
    id: string;
    pos: { x: number; y: number };
    vel: { x: number; y: number };
    rot: number;
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
    ownerId: string;
  };
}

export const isBulletSpawnMsg = (msg: WsMessage): msg is BulletSpawnMsg =>
  (msg as BulletSpawnMsg).kind === 'SpawnBullet';

export type FlagStateMsgEvent = 'Capture' | 'Return' | 'PickUp' | 'Drop';
export interface FlagStateMsg {
  kind: 'FlagState';
  data: {
    flagTeam: 1 | 2;
    event: FlagStateMsgEvent;
    playerId: string;
  };
}

export const isFlagStateMsg = (msg: WsMessage): msg is FlagStateMsg =>
  (msg as FlagStateMsg).kind === 'FlagState';

export interface GameStateMsg {
  kind: 'GameState';
  data: {
    team1Score: number;
    team2Score: number;
    gameActive: boolean;
  };
}

export const isGameStateMsg = (msg: WsMessage): msg is GameStateMsg =>
  (msg as GameStateMsg).kind === 'GameState';

export type WsMessage =
  | InitMsg
  | DisconnectMsg
  | PlayerPosUpdateMsg
  | HitMsg
  | AllPlayerPosUpdateMsg
  | BulletSpawnMsg
  | FlagStateMsg
  | GameStateMsg;

export type TeamType = typeof team1Name | typeof team2Name;

export const team1Name = 'Team Old';
export const team2Name = 'Team New';
