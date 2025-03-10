const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });
const messages = []; // In-memory storage for messages

server.on('connection', (ws) => {
    console.log('Client connected');

    // Send existing messages to the newly connected client
    ws.send(JSON.stringify({ type: 'initial', data: messages }));

    ws.on('message', (message) => {
        console.log('Received:', message);

        // Store the message
        messages.push(message.toString());
        // Broadcast to all connected clients
        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'new', data: message.toString() }));
            }
        });
    });

    ws.on('close', () => console.log('Client disconnected'));
});

console.log("WebSocket server running on ws://localhost:8080");