// import WebSocket from 'ws';
import { createServer } from 'http';
import { parse } from 'url';
import { WebSocketServer } from 'ws';
import express from 'express';
import cors from 'cors';
import url from 'node:url';

import LeftyAI from './LeftyAI.js';
import RightyAI from './RightyAI.js';

const app = express();

// app.use(cors({
//   origin: ['https://studio.asyncapi.com', 
//            'https://pushy-ai.glitch.me', 
//            'https://pushy-ai-dev.glitch.me', 
//            'https://pushy-karts.glitch.me', 
//            'https://pushy-karts-dev.glitch.me']
// }));

app.use(express.static("public"));

const server = app.listen(process.env.PORT, () => {
  console.log("Listening on port " + server.address().port);
});

function broadcast(server, data) {
  server.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

// Test client server

// const wsServer = new WebSocketServer({ server });

const wsServer = new WebSocketServer({ noServer: true });

wsServer.on("connection", ws => {
  ws.id = Date.now();
  console.log('Client connected:', ws.id);
  const message = { cid: ws.id, message: 'Connected!' };
  broadcast(wsServer, message);
  
  ws.on("message", data => {
    console.log("Message received from connection Id:", ws.id);
    const message = JSON.parse(data);
    console.log(message);
    message.cid = ws.id; 
    broadcast(wsServer, message);
  });

  ws.on("close", () => {
    console.log("Client disconnected:", ws.id);
    const message = { cid: ws.id, message: 'Disconnected!' };
    broadcast(wsServer, message);
  });
});


// AI socket servers

const wss1 = new WebSocketServer({ noServer: true });
const wss2 = new WebSocketServer({ noServer: true });

wss1.on('connection', function connection(ws) {
  const lefty = new LeftyAI();
  
  ws.on('error', console.error);
  
  ws.on('message', data => {
    const message = JSON.parse(data);
    broadcast(wss1, lefty.getActions());
  });
});

wss2.on('connection', function connection(ws) {
  const righty = new RightyAI();
  
  ws.on('error', console.error);

  ws.on('message', data => {
    const message = JSON.parse(data);
    broadcast(wss2, righty.getActions());
  });
});

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = url.parse(request.url);

  if (pathname === '/Lefty') {
    console.log('Go lefty!');
    wss1.handleUpgrade(request, socket, head, function done(ws) {
      wss1.emit('connection', ws, request);
    });
  } 
  else if (pathname === '/Righty') {
    console.log('Go righty!');
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });
  }
  else {
    console.log('Conection!');
    wsServer.handleUpgrade(request, socket, head, function done(ws) {
      wsServer.emit('connection', ws, request);
    });
  }
});