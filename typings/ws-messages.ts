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

export interface AllPlayerPosUpdateMsg {
  kind: 'AllPlayerPosUpdate';
  data: {
    pos: trackableObjects;
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

export type WsMessage =
  | InitMsg
  | DisconnectMsg
  | PlayerPosUpdateMsg
  | HitMsg
  | AllPlayerPosUpdateMsg;
