import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import {
  InitMsg,
  WsMessage,
  isPlayerPosUpdateMsg,
  AllPlayerPosUpdateMsg,
  isBulletSpawnMsg,
  teamType,
} from '../typings/ws-messages';

export interface trackablePlayerData {
  x: number;
  y: number;
  rotation: number;
}
export interface Connection {
  id: string;
  socket: WebSocket;
  teamId: teamType;
}
export type trackableObjects = { [id: string]: trackablePlayerData };

const app = express();
let trackableObjects: trackableObjects = {};
//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

var connections: Connection[] = [];

wss.on('connection', (ws: WebSocket) => {
  //connection is up, let's add a simple simple

  const playerId = genPlayerId();
  const team = getTeam();
  connections.push({ id: playerId, socket: ws, teamId: team });
  console.log('Number of connected devices: ' + connections.length);

  const message: InitMsg = { kind: 'Init', data: { playerId: playerId, team } };
  ws.send(JSON.stringify(message));

  ws.on('message', (data: string) => {
    //log the received message and send it back to the client
    //check if there are other connections

    let message = JSON.parse(data) as WsMessage;
    if (isPlayerPosUpdateMsg(message)) {
      trackableObjects[message.data.id] = {
        x: message.data.pos.x,
        y: message.data.pos.y,
        rotation: message.data.rot,
      };
    }
    if (isBulletSpawnMsg(message)) {
      let it = connections.find(it => it.socket === ws);
      if (it) {
        broadcast(message, it.id);
      }
    }
  });
  ws.on('close', function(reasonCode, description) {
    let it = connections.find(it => it.socket === ws);
    connections = connections.filter(otherConn => otherConn.socket !== ws);
    if (it !== undefined && it.id !== undefined) {
      delete trackableObjects[it.id];
      connections.forEach(item => {
        if (it !== undefined) {
          item.socket.send(JSON.stringify({ dissconnected: it.id }));
        }
      });
      console.log('Number of connected devices: ' + connections.length);
    }
  });
});
setInterval(() => {
  connections.forEach(it => {
    const message: AllPlayerPosUpdateMsg = {
      kind: 'AllPlayerPosUpdate',
      data: {
        pos: trackableObjects,
      },
    };
    it.socket.send(JSON.stringify(message));
  });
}, 1000 / 20);

const broadcast = (message: WsMessage, sender: string) => {
  connections
    .filter(c => c.id !== sender)
    .forEach(c => {
      c.socket.send(JSON.stringify(message));
    });
};

const genPlayerId = () => {
  let id: string = '';
  do {
    id = genId();
  } while (connections.map(it => it.id).indexOf(id) !== -1);
  return id;
};
const genId = (): string => {
  return Math.random()
    .toString(36)
    .substring(7);
};
const getTeam = (): teamType => {
  const teamGretaTeamSize = connections.filter(
    c => c.teamId === 'Greta Thunberg',
  ).length;
  const teamTrumpTeamSize = connections.filter(c => c.teamId === 'Donald Trump')
    .length;
  return teamGretaTeamSize <= teamTrumpTeamSize
    ? 'Greta Thunberg'
    : 'Donald Trump';
};
//start our server
server.listen(9000, () => {
  console.log(
    `Server started on port: ${
      (server.address() as WebSocket.AddressInfo).port
    }`,
  );
});
