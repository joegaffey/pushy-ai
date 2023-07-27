const express = require("express");
const app = express();

const cors = require('cors');
app.use(cors({
  origin: ['https://studio.asyncapi.com', 'https://pushy-ai.glitch.me/', 'https://pushy-karts.glitch.me/']
}));

app.use(express.static("public"));

const server = app.listen(process.env.PORT, () => {
  console.log("Listening on port " + server.address().port);
});


const WebSocket = require("ws");
const wsServer = new WebSocket.Server({ server });

function broadcast(data) {
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wsServer.on("connection", ws => {
  ws.id = Date.now();
  console.log('Client connected:', ws.id);
  // broadcast("Client disconnected:" + ws.id);
  
  ws.on("message", data => {
    console.log("Message received from connection Id:", ws.id);
    const message = JSON.parse(data);
    console.log(message);
    message.cid = ws.id; 
    broadcast(message);
  });

  ws.on("close", () => {
    console.log("Client disconnected:", ws.id);
    // broadcast("Client disconnected:" + ws.id);
  });
});