import { createServer } from 'http';
import { parse } from 'url';
import { WebSocketServer } from 'ws';
import express from 'express';
import cors from 'cors';
import url from 'node:url';

import aiList from './aiList.js';
import turkWsServer from './TurkServer.js';
import TurkAI from './TurkAI.js';

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

// AI socket servers
const wsServers = [];

aiList.forEach(ai => {
  import('./' + ai.agent).then((module) => {
    ai.module = module;
  }).catch((e) => {
    console.log('Error loading module ' + ai.agent, e);
  });
  const wss = new WebSocketServer({ noServer: true });
  ai.wss = wss;
  wss.on('connection', function connection(ws) {
    ws.ai = new ai.module.default();
    
    console.log(ai.name + ': Connected');
    
    ws.on('error', console.error);
    
    ws.on('close', () => console.log(ai.name + ': Disconnected'));

    ws.on('message', data => {
      const message = JSON.parse(data);
      if(message.event === 'dynamicState') {        
        ai.messageCount++;
        if(ai.messageCount % 1000 === 0)
          console.log(`${ai.name}: Received ${ai.messageCount / 1000}K world updates`);
        ws.ai.setDynamicWorldState(message.objects);
      }
      if(message.event === 'staticState')
        ws.ai.setStaticWorldState(message.objects);
      ws.send(JSON.stringify(ws.ai.getActions()));
    });
  });
  wsServers.push(wss);
});

server.on('upgrade', function upgrade(request, socket, head) {
  const { pathname } = url.parse(request.url);
  
  if(pathname === '/driver') {
    turkWsServer.handleUpgrade(request, socket, head, function done(ws) {
      ws.ai = new TurkAI();
      const driver = turkWsServer.getDriver();
      if(driver)
        ws.ai.driver = turkWsServer.getDriver();
      else
        console.log('Turk driver unavailable!')
      turkWsServer.emit('connection', ws, request);
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