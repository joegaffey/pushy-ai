import { WebSocketServer } from 'ws';

const turkWsServer = new WebSocketServer({ noServer: true });
export default turkWsServer;

function broadcast(server, data) {
  server.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

turkWsServer.on("connection", ws => {
  ws.id = Date.now();
  console.log('Turk' + turkWsServer.clients.size +' connected:', ws.id);
  const message = { cid: ws.id, message: 'Connected!' };
  broadcast(turkWsServer, message);
  
  ws.on("message", data => {
    console.log("Message received from connection Id:", ws.id);
    const message = JSON.parse(data);
    console.log(message);
    message.cid = ws.id; 
    broadcast(turkWsServer, message);
  });

  ws.on("close", () => {
    console.log("Client disconnected:", ws.id);
    const message = { cid: ws.id, message: 'Disconnected!' };
    broadcast(turkWsServer, message);
  });
});