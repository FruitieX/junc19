import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

export interface trackablePlayerData {
  x: number;
  y: number;
  rotation: number;
}
export type trackableObjects = { [id: string]: trackablePlayerData };

const app = express();
let trackableObjects: trackableObjects = {};
//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

var connections: { id: string; socket: WebSocket }[] = [];

wss.on('connection', (ws: WebSocket) => {
  //connection is up, let's add a simple simple

  const playerId = genPlayerId();
  connections.push({ id: playerId, socket: ws });
  console.log('Number of connected devices: ' + connections.length);

  ws.send(JSON.stringify({ id: playerId }));

  ws.on('message', (data: string) => {
    //log the received message and send it back to the client
    //check if there are other connections
    let message = JSON.parse(data) as {
      playerUpdate: { id: string; pos: trackablePlayerData };
    };
    console.log(message.playerUpdate.id);
    if (message.playerUpdate !== undefined) {
      trackableObjects[message.playerUpdate.id] = message.playerUpdate.pos;
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
    for (let it in trackableObjects) {
      let pos = trackableObjects[it];
    }
    it.socket.send(
      JSON.stringify({
        update: trackableObjects,
      }),
    );
  });
}, 1000 / 20);

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
//start our server
server.listen(9000, () => {
  console.log(
    `Server started on port: ${
      (server.address() as WebSocket.AddressInfo).port
    }`,
  );
});
