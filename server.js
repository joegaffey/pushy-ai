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

// Test client ws server
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

const aiList = [
  {
    name: 'Lefty',
    agent: new LeftyAI(),
    messageCount: 0
  },
  {
    name: 'Righty',
    agent: new RightyAI(),
    messageCount: 0
  }
];

// AI socket servers
const wsServers = [];

aiList.forEach(ai => {
  const wss = new WebSocketServer({ noServer: true });
  ai.wss = wss;
  wss.on('connection', function connection(ws) {
    console.log(ai.name + ': Connected');
    
    ws.on('error', console.error);
    
    ws.on('close', () => console.log(ai.name + ': Disconnected'));

    ws.on('message', data => {
      const message = JSON.parse(data);
      if(message.event === 'dynamicState') {
        ai.agent.setDynamicWorldState(message.objects);
        ai.messageCount++;
        if(ai.messageCount % 1000 === 0)
          console.log(`${ai.name}: Received ${ai.messageCount / 1000}K world updates`);
      }
      if(message.event === 'staticState')
        ai.agent.setStaticWorldState(message.objects);
      broadcast(wss, ai.agent.getActions());
    });
  });
  wsServers.push(wss);
});

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = url.parse(request.url);
  
  if(pathname === '/') {
    wsServer.handleUpgrade(request, socket, head, function done(ws) {
      wsServer.emit('connection', ws, request);
    });
  }
  else {
    const aiName = pathname.split('/')[1];

    const result = aiList.filter(ai => {
      return ai.name === aiName;
    });

    const ai = result[0];

    if(ai) {
      console.log(ai.name + ': Upgrading WS connection...');
      ai.wss.handleUpgrade(request, socket, head, function done(ws) {
        ai.wss.emit('connection', ws, request);
      });
    }
  }
});