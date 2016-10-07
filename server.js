// server.js
'use strict'

const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('node-uuid');
require('dotenv').config();

// Set the port to 4000
const PORT = process.env.PORT || 4000;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    client.send(data);
  });
};

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.send(JSON.stringify({
    type: 'color',
    color: '#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6)}
  ));
  wss.broadcast(JSON.stringify({
    type: 'onlineUser',
    length: wss.clients.length}
  ));
  wss.broadcast(JSON.stringify({
    type: 'incomingNotification',
    id: uuid.v1(),
    content: 'A new user joined the group chat.'
  }))

  ws.on('message', (rawMessage) => {
    const message = JSON.parse(rawMessage);
    let newMessage;
    switch (message.type) {
      case 'postMessage':
        message.type = 'incomingMessage'
        break;
      case 'postNotification':
        message.type = 'incomingNotification'
        break;
      default:
        throw new Error("Unknown event type " + message.type);
    }
    message.id = uuid.v1();
    newMessage = JSON.stringify(message);
    wss.broadcast(newMessage);
  });

  ws.on('close', () => {
    console.log('Client disconnected')
    wss.broadcast(JSON.stringify({length: wss.clients.length, type: 'onlineUser'}));
  });

});
