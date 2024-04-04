// server.js

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });


// Define initial player positions
const initialPlayerPositions = [
    { id: 1, x: 0, y: 1 },  /* "Prof. Plum" */ 
    { id: 2, x: 3, y: 0 },  /* "Miss Scarlet"*/
    { id: 3, x: 4, y: 1 },  /* "Col Mustard"*/ 
    { id: 4, x: 3, y: 4 },  /* "Mrs White" */
    { id: 5, x: 1, y: 4 },  /* "Mr. Green"*/
    { id: 6, x: 0, y: 3 }   /* "Mrs Peacock"*/
];



class Player {
    constructor(id, x, y) {
        this.id = id;
        this.position = { x, y };
        this.cardsInHand = [];
        this.ws = null; // WebSocket connection
    }

    addCard(card) {
        this.cardsInHand.push(card);
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
}


class Card {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
}


const allCards = {
    suspects: [
        new Card('Miss Scarlet', 'suspect'),
        new Card('Colonel Mustard', 'suspect'),
        new Card('Mrs. White', 'suspect'),
        new Card('Mr. Green', 'suspect'),
        new Card('Mrs. Peacock', 'suspect'),
        new Card('Professor Plum', 'suspect'),
    ],
    weapons: [
        new Card('Candlestick', 'weapon'),
        new Card('Dagger', 'weapon'),
        new Card('Lead Pipe', 'weapon'),
        new Card('Revolver', 'weapon'),
        new Card('Rope', 'weapon'),
        new Card('Wrench', 'weapon'),
    ],
    rooms: [
        new Card('Hall', 'room'),
        new Card('Study', 'room'),
        new Card('Ballroom', 'room'),
        new Card('Billiard Room', 'room'),
        new Card('Dining Room', 'room'),
        new Card('Kitchen', 'room'),
        new Card('Lounge', 'room'),
        new Card('Conservatory', 'room'),
        new Card('Library', 'room'),
    ]
};



let winningCards = {};



function setupWinningCards() {
    winningCards = {
        suspect: allCards.suspects[Math.floor(Math.random() * allCards.suspects.length)],
        weapon: allCards.weapons[Math.floor(Math.random() * allCards.weapons.length)],
        room: allCards.rooms[Math.floor(Math.random() * allCards.rooms.length)]
    };

    console.log("Winning cards: ", winningCards);
    allCards.suspects = allCards.suspects.filter(suspect => suspect !== winningCards.suspect);
    allCards.weapons = allCards.weapons.filter(weapon => weapon !== winningCards.weapon);
    allCards.rooms = allCards.rooms.filter(room => room !== winningCards.room);
}





function distributeCards() {
    setupWinningCards();
    const combinedCards = [...allCards.suspects, ...allCards.weapons, ...allCards.rooms];
    const shuffledCards = combinedCards.sort(() => 0.5 - Math.random());

    const numCardsPerPlayer = Math.floor(shuffledCards.length / players.length);
    players.forEach((player, index) => {
        const startIndex = index * numCardsPerPlayer;
        const cardsForPlayer = shuffledCards.slice(startIndex, startIndex + numCardsPerPlayer);
        cardsForPlayer.forEach(card => player.addCard(card));
        player.send({
            type: 'yourCards',
            cards: player.cardsInHand.map(card => card.name)
        });

        // Log distributed cards for each player
        console.log(`Player ${player.id} cards:`, player.cardsInHand.map(card => card.name));
    });
}



// Define a GameBoard class to encapsulate board logic
class GameBoard {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.board = this.createInitialBoard(width, height);
    }

    createInitialBoard(width, height) {
        const board = Array.from({ length: height }, () => Array.from({ length: width }, () => ({ name: '', blocked: false })));
        


        return board;
    }

   
    getRoomName(x, y) {
        // Define your room layout here, for example:
        if (x === 0 && y === 0) return 'Study';
        if (x === 0 && y === 1) return 'Hallway';
        if (x === 0 && y === 2) return 'library';
        if (x === 0 && y === 3) return 'Hallway';
        if (x === 0 && y === 4) return 'Conservatory'; 
    
        if (x === 1 && y === 0) return 'Hallway';
        if (x === 1 && y === 1) return 'Blocked'; // 
        if (x === 1 && y === 2) return 'Hallway';
        if (x === 1 && y === 3) return 'Blocked'; // 
        if (x === 1 && y === 4) return 'Hallway';  
        
        if (x === 2 && y === 0) return 'Hall';
        if (x === 2 && y === 1) return 'Hallway';
        if (x === 2 && y === 2) return 'Billiard Room';
        if (x === 2 && y === 3) return 'Hallway';
        if (x === 2 && y === 4) return 'Ball Room'; 
    
        if (x === 3 && y === 0) return 'Hallway';
        if (x === 3 && y === 1) return 'Blocked'; //
        if (x === 3 && y === 2) return 'Hallway';
        if (x === 3 && y === 3) return 'Blocked'; //
        if (x === 3 && y === 4) return 'Hallway';  
    
        if (x === 4 && y === 0) return 'Lounge';
        if (x === 4 && y === 1) return 'Hallway';
        if (x === 4 && y === 2) return 'Dining Room';
        if (x === 4 && y === 3) return 'Hallway';
        if (x === 4 && y === 4) return 'Kitchen'; 
    
        // Add more conditions for other rooms
        return ''; // Return empty string if it's not a special room
    }

    // Additional methods as needed...
}




function getNextMove(playerId, i, j) {
    const lastPos = gameState.players[playerId];
    const nextX = lastPos.x + i;
    const nextY = lastPos.y + j;

    // Print out the computed next x and y coordinates
    console.log(`Next move for player ${playerId}: x = ${nextX}, y = ${nextY}`);

    return { x: nextX, y: nextY };
}


// function getRoomName_Server(x, y) {
//     // Define your room layout here, for example:
//     if (x === 0 && y === 0) return 'Study';
//     if (x === 0 && y === 1) return 'Hallway';
//     if (x === 0 && y === 2) return 'library';
//     if (x === 0 && y === 3) return 'Hallway';
//     if (x === 0 && y === 4) return 'Conservatory'; 

//     if (x === 1 && y === 0) return 'Hallway';
//     // if (x === 1 && y === 1) return 'Blocked';
//     if (x === 1 && y === 2) return 'Hallway';
//     // if (x === 1 && y === 3) return 'Blocked'; 
//     if (x === 1 && y === 4) return 'Hallway';  
    
//     if (x === 2 && y === 0) return 'Hall';
//     if (x === 2 && y === 1) return 'Hallway';
//     if (x === 2 && y === 2) return 'Billiard Room';
//     if (x === 2 && y === 3) return 'Hallway';
//     if (x === 2 && y === 4) return 'Ball Room'; 

//     if (x === 3 && y === 0) return 'Hallway';
//     // if (x === 3 && y === 1) return 'Blocked';
//     if (x === 3 && y === 2) return 'Hallway';
//     // if (x === 3 && y === 3) return 'Blocked'; 
//     if (x === 3 && y === 4) return 'Hallway';  

//     if (x === 4 && y === 0) return 'Lounge';
//     if (x === 4 && y === 1) return 'Hallway';
//     if (x === 4 && y === 2) return 'Dining Room';
//     if (x === 4 && y === 3) return 'Hallway';
//     if (x === 4 && y === 4) return 'Kitchen'; 

//     // Add more conditions for other rooms
//     return ''; // Return empty string if it's not a special room
// }

// Function to clear the previous move of a player on the board
function clearPlayerPreviousMove(playerId) {
    const lastPos = gameState.lastPositions[playerId];
    if (lastPos) {
        if (gameState.board[lastPos.y] && gameState.board[lastPos.y][lastPos.x] !== undefined) {
            gameState.board[lastPos.y][lastPos.x] = null; // Clear the last position from the board
        }
    }
    else {
    
            // Remove the player from the previous position
            const previousPosition = gameState.players[playerId];
            if (previousPosition) {
                gameState.board[previousPosition.y][previousPosition.x] = null;
            }
        }
    
    }

// Function to broadcast the current game state to all connected clients
function broadcastGameState() {
    const message = JSON.stringify({
        type: 'update',
        board: gameState.board.map(row => row.map(cell => cell || 0)), // Ensure undefined cells are represented as 0 or a similar placeholder
        currentTurn: gameState.currentTurn,
        lastPositions: gameState.lastPositions,
    });
    players.forEach(player => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(message);
        }
    });
}

// function broadcastChat(message, playerId) {
//     const chatMessage = JSON.stringify({ type: 'chat', message, sender: `Player ${playerId}` });
//     players.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(chatMessage);
//         }
//     });
// }

function broadcastChat(message, playerId) {
    const chatMessage = JSON.stringify({ type: 'chat', message, sender: `Player ${playerId}` });
    console.log(`Broadcasting message from Player ${playerId}: ${message}`); // Log the message being sent
    players.forEach(player => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(chatMessage);
            console.log(`Sent to Player ${player.id}`); // Log the recipient of the message
        } else {
            console.log(`Connection not open for Player ${player.id}`); // Log if the connection is not open
        }
    });
}




// function createInitialBoard(width, height) {
//     let board = [];

//     // Initialize the board with empty arrays for each row
//     for (let i = 0; i < height; i++) {
//         board.push(Array.from({ length: width }, () => 0));
//     }

//     // Block positions by setting them to a value that indicates they're blocked.
//     // For example, let's use -1 to indicate a blocked cell.
//     board[1][3] = -1; // Block cell at (1,3)
//     board[1][1] = -1; // Block cell at (1,1)
//     board[3][3] = -1; // Block cell at (3,3)
//     board[3][1] = -1; // Block cell at (3,1)



//     return board;
// }
let gameBoard = new GameBoard(5, 5)
let currentTurn = 1; // Start with player 1
let players = [];
let gameState = {
    board: gameBoard.board, // Initialize a 10x10 board
    players: {}, // Stores current positions
    lastPositions: {}, // Stores last positions for each player
    currentTurn: 1
    
};


// WebSocket connection setup
wss.on('connection', function connection(ws) {
    // const playerId = players.length + 1; // Assign player ID based on the order of connection
    // console.log(`A new player has connected with ID: ${playerId}.`);
    // Tell the connected client their player ID
    // ws.send(JSON.stringify({ type: 'playerInfo', playerId: playerId, isPlayerOne: playerId === 1 }));
    // ws.playerId = playerId;
    // players.push(ws);
    // let playerCards = distributeCards();


    const playerId = players.length + 1;
    console.log(`A new player has connected with ID: ${playerId}.`);

    // Find the initial position for the new player
    const initialPosition = initialPlayerPositions.find(pos => pos.id === playerId);

    // Create a new player instance with the initial position
    const player = new Player(playerId, initialPosition?.x || 0, initialPosition?.y || 0);
    player.ws = ws; // Assign the WebSocket connection to the player
    players.push(player); // Add the player to the players array

    // Send player info to the newly connected player
    player.send({
        type: 'playerInfo',
        playerId: playerId,
        isPlayerOne: playerId === 1
    });

    // Distribute cards to all players
    distributeCards();

    // No need to send cards here as distributeCards function already does it

    // Set the initial positions for the players on the game board
    initialPlayerPositions.forEach(position => {
        gameState.players[position.id] = { x: position.x, y: position.y };
        if (playerId === position.id) {
            gameState.board[position.y][position.x] = playerId; // Mark the player's position on the board
        }
    });

    // Send the initial game state to the player
    ws.send(JSON.stringify({
        type: 'init',
        playerId: playerId,
        board: gameState.board,
        initialPositions: initialPlayerPositions
    }));


    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);


        if (data.type === 'setPlayerCount')
        {
            // Assuming you have a variable to store player count
            // gameSettings.playerCount = data.count;
            // console.log('player',gameSettings.playerCount)
            console.log('player',data.count)
            totalplayermsg = `waiting total ${data.count} Player for the game`
            // Logic to wait for the correct number of players before starting
            // break;
            broadcastChat(totalplayermsg, data.playerId);

        }


        if (data.type === 'move' && data.playerId === currentTurn) {

            if (data.direction === "down")      {i=0,j=1 } 
            if (data.direction === "up")        {i=0,j=-1}
            if (data.direction === "left")      {i=-1,j=0} 
            if (data.direction === "right")     {i=1,j=0}

            const nextMove = getNextMove(data.playerId,i,j);



            clearPlayerPreviousMove(currentTurn); // Clear the current player's last position
            gameState.lastPositions[currentTurn] = { x: nextMove.x, y: nextMove.y }; // Update last position

            console.log('player',playerId,'x move:', nextMove.x,'y move:',nextMove.y );

            gameState.players[currentTurn] = { x: nextMove.x, y: nextMove.y }; // Update current position
            gameState.board[nextMove.y][nextMove.x] = currentTurn; // Set new position on the board

                // Get room name based on coordinates
            const roomName = gameBoard.getRoomName(nextMove.x, nextMove.y); // Ensure this function exists and returns the correct room name
            // const moveInfocheck = `Player ${data.playerId} moved to x ${nextMove.x} y ${nextMove.y}.`;
            // for (let x = 0; x < gameBoard.width; x++) {
            //     for (let y = 0; y < gameBoard.height; y++) {
            //         const roomName = gameBoard.getRoomName(x, y);
            //         console.log(`Position (${x}, ${y}): ${roomName}`);
            //     }
            // } 
            const moveInfo = `Player ${data.playerId} moved to ${roomName}.`;

            broadcastChat(moveInfo, data.playerId); // Use this to broadcast move
            // broadcastChat(moveInfocheck, data.playerId); // Use this to broadcast move


            currentTurn = (currentTurn % players.length) + 1; // Move to the next player
            gameState.currentTurn = currentTurn;
            broadcastGameState(); // Broadcast updated game state
        }

        if (data.type === 'chat') {
            broadcastChat(data.message, data.playerId);
            console.log('player',playerId,'said:', data.message);
        }

        if (data.type === 'suggestion') {
            const roomName = gameBoard.getRoomName(gameState.lastPositions[data.playerId].x, gameState.lastPositions[data.playerId].y); // Ensure this function exists and returns the correct room name
            const suggestionInfo = `Player ${data.playerId} suggests: ${data.suspect} with the ${data.weapon} at ${roomName}.`;
            broadcastChat(suggestionInfo, data.playerId); // Broadcast suggestion

            console.log('player',playerId,'suspect:', data.suspect,'weapon:',data.weapon ,'room:',roomName );
        }
        

    });

    ws.on('close', function() {
        // console.log(`Player ${ws.playerId} has disconnected.`);
        // Remove player from the game

        console.log(`Player ${playerId} has disconnected.`);
        players = players.filter(p => p.id !== playerId);
        
        players = players.filter(player => player !== ws);
        if (players.length < 2) {
            // Reset the game if necessary
        }
    });

    broadcastGameState(); // Send the current game state to the new player

});

console.log('WebSocket server started on ws://localhost:8080');
console.log('Board dimensions:', gameBoard.width, gameBoard.height); // Show board size