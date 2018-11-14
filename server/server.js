const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();

//initialize a simple http server
//const server = http.createServer(app);

//start our server
// server.listen(process.env.PORT || 4444, () => {
//     console.log(`Server started on port ${server.address().port} :)`);
// });

//initialize the WebSocket server instance
// const wss = new WebSocket.Server({ server });

const wss = new WebSocket.Server({ port: 4444 });


function createMessage(content = "", isBroadcast = false, sender = 'NS')  {
    return JSON.stringify({content: content, isBroadcast: isBroadcast, sender: sender}); 
}


wss.on('connection', (ws) => {
    console.log(wss.clients)

    const extWs = ws ;

    extWs.isAlive = true;

    console.log(extWs)

    ws.on('pong', () => {
        extWs.isAlive = true;
    });

    //connection is up, let's add a simple simple event
    ws.on('message', (msg) => {

        const message = JSON.parse(msg);

        setTimeout(() => {
            if (message.isBroadcast) {

                //send back the message to the other clients
                wss.clients
                    .forEach(client => {
                        if (client != ws) {
                            client.send(createMessage(message.content, true, message.sender));
                        }
                    });

            }

            ws.send(createMessage(`You sent -> ${message.content}`, message.isBroadcast));

        }, 1000);

    });

    //send immediatly a feedback to the incoming connection    
    ws.send(createMessage('Hi there, I am a WebSocket server'));

    ws.on('error', (err) => {
        console.warn(`Client disconnected - reason: ${err}`);
    })
});

setInterval(() => {
    wss.clients.forEach((ws) => {

        const extWs = ws;

        if (!extWs.isAlive) return ws.terminate();

        extWs.isAlive = false;
        ws.ping(null, undefined);
    });
}, 10000);




