const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
let currentTurn = 1; // Start with player 1
let players = [];
let gameState = {
    board: createInitialBoard(10, 10), // Initialize a 10x10 board
    players: {}, // Stores current positions
    lastPositions: {}, // Stores last positions for each player
    currentTurn: 1
};

// Function to create an initial game board
function createInitialBoard(width, height) {
    return Array.from({ length: height }, () => Array.from({ length: width }, () => 0));
}

// Function to generate a random move within board dimensions
// function getRandomMove() {
//     return { x: Math.floor(Math.random() * 10), y: Math.floor(Math.random() * 10) };
// }


function getNextMove(playerId) {
    const lastPos = gameState.players[playerId];
    // Example move: one step to the right; ensure you add boundary checks
    return { x: (lastPos.x + 1) % 10, y: lastPos.y };
}


// Function to clear the previous move of a player on the board
function clearPlayerPreviousMove(playerId) {
    const lastPos = gameState.lastPositions[playerId];
    if (lastPos) {
        if (gameState.board[lastPos.y] && gameState.board[lastPos.y][lastPos.x] !== undefined) {
            gameState.board[lastPos.y][lastPos.x] = null; // Clear the last position from the board
        }
    }
}


// Function to broadcast the current game state to all connected clients
function broadcastGameState() {
    const message = JSON.stringify({
        type: 'update',
        board: gameState.board,
        currentTurn: gameState.currentTurn
    });
    players.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function broadcastChat(message, playerId) {
    const chatMessage = JSON.stringify({ type: 'chat', message, sender: `Player ${playerId}` });
    players.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(chatMessage);
        }
    });
}


// WebSocket connection setup
wss.on('connection', function connection(ws) {
    const playerId = players.length + 1; // Assign player ID based on the order of connection
    console.log(`A new player has connected with ID: ${playerId}.`);
    ws.playerId = playerId;
    players.push(ws);

    const player1Position = { x: 0, y: 0 };
    const player2Position = { x: 0, y: 1 };
    const player3Position = { x: 0, y: 2 };
    gameState.players[1] = { ...player1Position };
    gameState.players[2] = { ...player2Position };
    gameState.players[3] = { ...player3Position };
    // Send initial state to the player
    ws.send(JSON.stringify({ type: 'init', playerId: playerId, board: gameState.board }));

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);

        if (data.type === 'move' && data.playerId === currentTurn) {
            // Validate and process the move here
            // This example uses a random move for simplicity; replace with actual move logic
            // const nextMove = getRandomMove();

            const nextMove = getNextMove(data.playerId);

            clearPlayerPreviousMove(currentTurn); // Clear the current player's last position
            gameState.lastPositions[currentTurn] = { x: nextMove.x, y: nextMove.y }; // Update last position

            console.log('player',playerId,'x move:', nextMove.x,'y move:',nextMove.y );

            gameState.players[currentTurn] = { x: nextMove.x, y: nextMove.y }; // Update current position
            gameState.board[nextMove.y][nextMove.x] = currentTurn; // Set new position on the board

            const moveInfo = `Player ${ws.playerId} moved to (${nextMove.x}, ${nextMove.y}).`;
            broadcastChat(moveInfo, ws.playerId); // Use this to broadcast move

            currentTurn = (currentTurn % players.length) + 1; // Move to the next player
            gameState.currentTurn = currentTurn;
            broadcastGameState(); // Broadcast updated game state
        }

        if (data.type === 'chat') {
            broadcastChat(data.message, ws.playerId);
            console.log('player',playerId,'said:', data.message);
        }

        if (data.type === 'suggestion') {
            const suggestionInfo = `Player ${ws.playerId} suggests: ${data.suspect} with the ${data.weapon} at position (x: ${gameState.lastPositions[ws.playerId].x} y: ${gameState.lastPositions[ws.playerId].y}).`;
            broadcastChat(suggestionInfo, ws.playerId); // Broadcast suggestion

            console.log('player',playerId,'suspect:', data.suspect,'weapon:',data.weapon );
        }
        

    });

    ws.on('close', function() {
        console.log(`Player ${ws.playerId} has disconnected.`);
        // Remove player from the game
        players = players.filter(player => player !== ws);
        if (players.length < 2) {
            // Reset the game if necessary
        }
    });

    broadcastGameState(); // Send the current game state to the new player
});

console.log('WebSocket server started on ws://localhost:8080');
console.log('Board dimensions:', gameState.board.length, gameState.board[0].length); // Show board size