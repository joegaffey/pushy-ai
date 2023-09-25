import { WebSocketServer } from 'ws';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import url from 'node:url';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';

import turkServer from './TurkServer.js';

const app = express();

app.use(cors({
  origin: ['https://pushy-ai.glitch.me',
           'https://pushy-ai-dev.glitch.me', 
           'https://pushy-karts.glitch.me', 
           'https://pushy-karts-dev.glitch.me'],
  methods: ['POST', 'GET'],
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));

const server = app.listen(process.env.PORT, () => {
  console.log(server.address().port || 8080)
  console.log("Listening on port " + server.address().port);
  updateExternalAI();
});

setInterval(() =>  {
  updateExternalAI();
}, 5000);

let externalAI = [];

function updateExternalAI() {
  externalAI = [];
  config.externalAI.forEach(eAI => {
    getAI(eAI).then((extAIList) => {
      externalAI = externalAI.concat(extAIList);      
      // console.log('Found ' + externalAI.length + ' external AI');
    });
  });
}

async function getAI(eAI) {
  // console.log('Fetching external AI: ' + eAI);
  try {
    const response = await fetch(eAI, {
      mode: 'cors',
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
    });
    return await response.json();
  }
  catch(e) {
    console.log('AI request failed: ' + eAI + '\n', e);
  };
}

app.post('/logs', (req, res) => { 
  console.log(('Client: ' + req.body.message));
  res.json(req.body);
});

app.get('/ai', (req, res) => { 
  const data = readFileSync('./ai.json');
  const ai = JSON.parse(data).concat(externalAI)
  res.json(ai);
});

let aiList = JSON.parse(readFileSync('./ai.json'));
const config = JSON.parse(readFileSync('./config.json'));

// AI socket servers
const wsServers = [];

aiList.filter(ai => ai.type === 'remote').forEach(ai => {
  ai.messageCount = 0;
  import('./' + ai.module).then((module) => {
    ai.module = module;
  }).catch((e) => {
    console.log('Error loading module ' + ai.agent, e);
  });
  
  const wss = new WebSocketServer({ noServer: true });
  ai.wss = wss;
  
  wss.on('connection', function connection(ws) {
    ws.ai = new ai.module.default();  // Instantiate the correct AI based on module
    ws.ai.name = ai.name;
    
    console.log(ws.ai.name + ': Connected');
    
    ws.on('error', console.error);
    
    ws.on('close', () => console.log(ai.name + ': Disconnected'));

    ws.on('message', data => {
      const message = JSON.parse(data);
      if(message.event === 'dynamicState') {        
        ai.messageCount++;
        if(ai.messageCount % 1000 === 0)
          console.log(`${ai.name}: Received ${ ai.messageCount / 1000 }K world updates`);
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
    turkServer.handleUpgrade(request, socket, head, function done(ws) {
      turkServer.emit('connection', ws, request);
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