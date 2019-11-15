import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
var connections: WebSocket[] = [];
wss.on('connection', (ws: WebSocket) => {
  //connection is up, let's add a simple simple
  console.log('Number of connected devices: ' + connections.length);
  connections.push(ws);
  ws.on('message', (message: string) => {
    //log the received message and send it back to the client
    //check if there are other connections
    if (connections.length !== 1) {
      //if there are, broadcast the message to them
      connections.forEach(otherWs => {
        if (otherWs !== ws) {
          otherWs.send(message);
        }
      });
    }
  });
  ws.on('close', function(reasonCode, description) {
    connections = connections.filter(it => it !== ws);
    console.log(new Date() + ' Peer disconnected.');
    console.log('Number of connected devices: ' + connections.length);
  });
});

//start our server
server.listen(9000, () => {
  console.log(
    `Server started on port: ${
      (server.address() as WebSocket.AddressInfo).port
    }`,
  );
});
