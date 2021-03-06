import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import {
  InitMsg,
  WsMessage,
  isPlayerPosUpdateMsg,
  AllPlayerPosUpdateMsg,
  isBulletSpawnMsg,
  TeamType,
  isHitMsg,
  DisconnectMsg,
  isFlagStateMsg,
  GameStateMsg,
} from '../typings/ws-messages';

export interface TrackablePlayerData {
  pos: {
    x: number;
    y: number;
  };
  rot: number;
  vel: {
    x: number;
    y: number;
  };
  team: TeamType;
  hp: number;
}
export interface Connection {
  id: string;
  socket: WebSocket;
  teamId: TeamType;
}
export type TrackableObjects = { [id: string]: TrackablePlayerData };

const app = express();
let trackableObjects: TrackableObjects = {};
//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

var connections: Connection[] = [];

const maxScore = 5;
interface GameState {
  team1Score: number;
  team2Score: number;
  gameActive: boolean;
  maxScore: number;
}
const initialState: GameState = {
  team1Score: 0,
  team2Score: 0,
  gameActive: true,
  maxScore,
};

let state = { ...initialState };

const broadcastGameState = () => {
  const msg: GameStateMsg = {
    kind: 'GameState',
    data: state,
  };
  broadcast(msg);
};

const reset = () => {
  state = { ...initialState };
  broadcastGameState();
};

const endGame = (winningTeam: 1 | 2) => {
  state.gameActive = false;
  setTimeout(reset, 5000);
};

wss.on('connection', (ws: WebSocket) => {
  //connection is up, let's add a simple simple

  const playerId = genPlayerId();
  const team = getTeam();
  connections.push({ id: playerId, socket: ws, teamId: team });
  console.log('Number of connected devices: ' + connections.length);

  const initMsg: InitMsg = { kind: 'Init', data: { playerId: playerId, team } };
  ws.send(JSON.stringify(initMsg));
  const msg: GameStateMsg = {
    kind: 'GameState',
    data: state,
  };
  ws.send(JSON.stringify(msg));

  ws.on('message', (data: string) => {
    //log the received message and send it back to the client
    //check if there are other connections

    let sender = connections.find(it => it.socket === ws);

    let message = JSON.parse(data) as WsMessage;

    if (isPlayerPosUpdateMsg(message)) {
      trackableObjects[message.data.id] = {
        ...message.data,
        team: sender!.teamId,
      };
    }

    if (isBulletSpawnMsg(message)) {
      if (sender) {
        broadcast(message, sender.id);
      }
    }

    if (isHitMsg(message)) {
      const hitPlayerId = message.data.playerId;
      let it = connections.find(it => it.id === hitPlayerId);

      if (it) {
        it.socket.send(JSON.stringify(message));
      }
    }

    if (isFlagStateMsg(message)) {
      let it = connections.find(it => it.socket === ws);
      if (it) {
        broadcast(message, it.id);
      }

      if (message.data.event === 'Capture') {
        if (message.data.flagTeam === 1) {
          state.team2Score += 1;

          if (state.team2Score >= maxScore) {
            endGame(2);
          }
        } else {
          state.team1Score += 1;

          if (state.team1Score >= maxScore) {
            endGame(1);
          }
        }

        broadcastGameState();
      }
    }
  });

  ws.on('close', function(reasonCode, description) {
    let it = connections.find(it => it.socket === ws);

    if (it) {
      const dcMessage: DisconnectMsg = {
        kind: 'Disconnect',
        data: {
          playerId: it.id,
        },
      };

      broadcast(dcMessage, it.id);

      connections = connections.filter(otherConn => otherConn.socket !== ws);
      delete trackableObjects[it.id];
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
}, 1000 / 60);

const broadcast = (message: WsMessage, sender?: string) => {
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
const getTeam = (): TeamType => {
  const teamGretaTeamSize = connections.filter(c => c.teamId === 'Team New')
    .length;
  const teamTrumpTeamSize = connections.filter(c => c.teamId === 'Team Old')
    .length;
  return teamGretaTeamSize <= teamTrumpTeamSize ? 'Team New' : 'Team Old';
};
//start our server
server.listen(9000, () => {
  console.log(
    `Server started on port: ${
      (server.address() as WebSocket.AddressInfo).port
    }`,
  );
});
