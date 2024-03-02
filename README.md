Step 1: Install Node.js
Ensure you have Node.js installed on your system. This will also install npm (Node Package Manager), which you'll use to install packages.

Step 2: Create Your Project
Create a new directory for your project and navigate into it.
Initialize a new Node.js project: Run npm init -y in your terminal. This creates a package.json file.
Install WebSocket: Run npm install ws to install the WebSocket library.
Step 3: Set Up the WebSocket Server

Create a file named server.js in your project directory and add the following code:

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 8080 });

let players = [];

wss.on('connection', function connection(ws) {
    players.push(ws);
    console.log('A new player has connected.');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        // Broadcast the message to all other players
        players.forEach(function each(player) {
            if (player !== ws && player.readyState === WebSocket.OPEN) {
                player.send(message);
            }
        });
    });

    ws.on('close', function close() {
        console.log('A player has disconnected.');
        players = players.filter(player => player !== ws);
    });
});
console.log('WebSocket server started on ws://localhost:8080');



This server listens for connections on port 8080 and broadcasts any received messages from one client (browser) to all other connected clients.

Step 4: Create the Client HTML
For the client-side, you can modify the HTML from the single-player game to connect to the WebSocket server and communicate with the other player. You'll need to adjust your game logic to handle multiplayer aspects.

Here’s a simplified example of how you might set up the client-side HTML and JavaScript to interact with the WebSocket server. Add this to your index.html:


<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Two Player Guessing Game</title>
</head>
<body>
<script>
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = function() {
        console.log('Connected to the server');
    };

    ws.onmessage = function(event) {
        console.log('Message from server: ', event.data);
    };

    // Example function to send a message
    function sendMessage(message) {
        ws.send(message);
    }
</script>
</body>
</html>


Step 5: Run Your Server
Open your terminal, navigate to your project directory, and run node server.js to start the WebSocket server.
Open two browser windows and navigate to your index.html file to act as the two players. Depending on your setup, you might need to serve your HTML through a web server. For a simple server, you can install http-server via npm and run it in your project directory.
Note:
This example provides a very basic structure for a two-player game. The actual game logic for handling guesses, determining turns, and declaring a winner needs to be implemented within the WebSocket message handling in both the server and client scripts.

For a real game, you would also need to consider security implications, such as sanitizing inputs and handling disconnects gracefully.

