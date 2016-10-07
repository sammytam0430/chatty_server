'use strict'

// Connect to the socket server
var socket = new WebSocket("ws://localhost:4000/socketserver");

socket.onopen = function(event) {
  console.log("Connected to websocket server");
};
