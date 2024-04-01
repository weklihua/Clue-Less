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



// function setupWinningCards() {
//     winningCards = {
//         suspect: allCards.suspects[Math.floor(Math.random() * allCards.suspects.length)],
//         weapon: allCards.weapons[Math.floor(Math.random() * allCards.weapons.length)],
//         room: allCards.rooms[Math.floor(Math.random() * allCards.rooms.length)]
//     };

//     console.log("Winning cards: ", winningCards);
//     // Filter out the winning cards
//     allCards.suspects = allCards.suspects.filter(card => card !== winningCards.suspect);
//     allCards.weapons = allCards.weapons.filter(card => card !== winningCards.weapon);
//     allCards.rooms = allCards.rooms.filter(card => card !== winningCards.room);
// }

function setupWinningCards() {
    // Randomly select one card from each category
    winningCards = {
        suspect: allCards.suspects[Math.floor(Math.random() * allCards.suspects.length)],
        weapon: allCards.weapons[Math.floor(Math.random() * allCards.weapons.length)],
        room: allCards.rooms[Math.floor(Math.random() * allCards.rooms.length)]
    };

    console.log("Winning cards: ", winningCards);
    // Remove the winning cards from the distribution pool
    allCards.suspects = allCards.suspects.filter(suspect => suspect !== winningCards.suspect);
    allCards.weapons = allCards.weapons.filter(weapon => weapon !== winningCards.weapon);
    allCards.rooms = allCards.rooms.filter(room => room !== winningCards.room);
}


// function distributeCards() {
//     setupWinningCards(); // Ensure winning cards are selected and removed first
//     let playerCards = {};
//     // Combine all remaining cards into a single pool
//     const combinedCards = [...allCards.suspects, ...allCards.weapons, ...allCards.rooms];
//     const shuffledCombinedCards = combinedCards.sort(() => 0.5 - Math.random()); // Shuffle combined cards

//     // players.forEach((player, index) => {
//     //     // Assign three random cards from the combined pool to each player
//     //     playerCards[player.playerId] = shuffledCombinedCards.slice(index * 3, (index * 3) + 3);
//     // });
//     players.forEach((player, index) => {

//         const numPlayers = players.length;
//         const numCardsPerPlayer = Math.floor(shuffledCombinedCards.length / numPlayers);

//         const startIndex = index * numCardsPerPlayer;
//         const endIndex = startIndex + numCardsPerPlayer;
//         playerCards[player.playerId] = shuffledCombinedCards.slice(startIndex, endIndex);
//     });




//     return playerCards;
// }

function distributeCards() {
    setupWinningCards(); // Ensure winning cards are selected and removed first
    let playerCards = {};
    // Combine all remaining cards into a single pool
    const combinedCards = [...allCards.suspects, ...allCards.weapons, ...allCards.rooms];
    const shuffledCombinedCards = combinedCards.sort(() => 0.5 - Math.random()); // Shuffle combined cards

    players.forEach((player, index) => {
        const numPlayers = players.length;
        const numCardsPerPlayer = Math.floor(shuffledCombinedCards.length / numPlayers);
        const startIndex = index * numCardsPerPlayer;
        const endIndex = startIndex + numCardsPerPlayer;
        playerCards[player.playerId] = shuffledCombinedCards.slice(startIndex, endIndex);
    });

    return playerCards;
}










function getNextMove(playerId,i,j) {
    const lastPos = gameState.players[playerId];
    // Example move: one step to the right; ensure you add boundary checks
    // return { x: (lastPos.x + i+5) % 5, y:(lastPos.y + j+5) % 5};
    return { x: (lastPos.x + i) , y:(lastPos.y + j)};
}


function getRoomName_Server(x, y) {
    // Define your room layout here, for example:
    if (x === 0 && y === 0) return 'Study';
    if (x === 0 && y === 1) return 'Hallway';
    if (x === 0 && y === 2) return 'library';
    if (x === 0 && y === 3) return 'Hallway';
    if (x === 0 && y === 4) return 'Conservatory'; 

    if (x === 1 && y === 0) return 'Hallway';
    // if (x === 1 && y === 1) return 'Blocked';
    if (x === 1 && y === 2) return 'Hallway';
    // if (x === 1 && y === 3) return 'Blocked'; 
    if (x === 1 && y === 4) return 'Hallway';  
    
    if (x === 2 && y === 0) return 'Hall';
    if (x === 2 && y === 1) return 'Hallway';
    if (x === 2 && y === 2) return 'Billiard Room';
    if (x === 2 && y === 3) return 'Hallway';
    if (x === 2 && y === 4) return 'Ball Room'; 

    if (x === 3 && y === 0) return 'Hallway';
    // if (x === 3 && y === 1) return 'Blocked';
    if (x === 3 && y === 2) return 'Hallway';
    // if (x === 3 && y === 3) return 'Blocked'; 
    if (x === 3 && y === 4) return 'Hallway';  

    if (x === 4 && y === 0) return 'Lounge';
    if (x === 4 && y === 1) return 'Hallway';
    if (x === 4 && y === 2) return 'Dining Room';
    if (x === 4 && y === 3) return 'Hallway';
    if (x === 4 && y === 4) return 'Kitchen'; 

    // Add more conditions for other rooms
    return ''; // Return empty string if it's not a special room
}

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
        board: gameState.board,
        currentTurn: gameState.currentTurn,
        lastPositions: gameState.lastPositions
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




function createInitialBoard(width, height) {
    let board = [];

    // Initialize the board with empty arrays for each row
    for (let i = 0; i < height; i++) {
        board.push(Array.from({ length: width }, () => 0));
    }

    // Block positions by setting them to a value that indicates they're blocked.
    // For example, let's use -1 to indicate a blocked cell.
    board[1][3] = -1; // Block cell at (1,3)
    board[1][1] = -1; // Block cell at (1,1)
    board[3][3] = -1; // Block cell at (3,3)
    board[3][1] = -1; // Block cell at (3,1)



    return board;
}

let currentTurn = 1; // Start with player 1
let players = [];
let gameState = {
    board: createInitialBoard(5, 5), // Initialize a 10x10 board
    players: {}, // Stores current positions
    lastPositions: {}, // Stores last positions for each player
    currentTurn: 1
    
};

// Later, when initializing a game or round:




// WebSocket connection setup
wss.on('connection', function connection(ws) {
    const playerId = players.length + 1; // Assign player ID based on the order of connection
    console.log(`A new player has connected with ID: ${playerId}.`);

    // Tell the connected client their player ID
    ws.send(JSON.stringify({ type: 'playerInfo', playerId: playerId, isPlayerOne: playerId === 1 }));

    ws.playerId = playerId;
    players.push(ws);



    let playerCards = distributeCards();

    console.log('Distributed player cards:', playerCards);
    console.log(`Sending cards to player ${ws.playerId}:`, playerCards[ws.playerId]);
 // player == 3/6 logic
    // After assigning player ID and other setup:
    // ws.send(JSON.stringify({
    //     type: 'yourCards',
    //     cards: playerCards[ws.playerId] // Send player-specific cards
    // }));

    ws.send(JSON.stringify({
        type: 'yourCards',
        cards: playerCards[ws.playerId].map(card => card.name) // Send player-specific card names
    }));

    initialPlayerPositions.forEach(position => {
        // Assign player position
        gameState.players[position.id] = { y: position.y, x: position.x };
        
        if (playerId === position.id && (gameState.lastPositions[playerId])=== undefined)
            {gameState.board[position.y][position.x]=playerId}

    

    });



//     // Send initial state to the player
    // ws.send(JSON.stringify({ type: 'init', playerId: playerId, board: gameState.board }));
    ws.send(JSON.stringify({ 
        type: 'init',
        playerId: playerId,
        board: gameState.board,
        initialPositions :initialPlayerPositions 
        
    /*players: gameState.players */}));

    // let gameSettings = {
    //     playerCount: 0
    // };

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
            broadcastChat(totalplayermsg, ws.playerId);

        }





        if (data.type === 'move' && data.playerId === currentTurn) {
            // Validate and process the move here
            // This example uses a random move for simplicity; replace with actual move logic
            // const nextMove = getRandomMove();
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
            const roomName = getRoomName_Server(nextMove.x, nextMove.y); // Ensure this function exists and returns the correct room name

            const moveInfo = `Player ${ws.playerId} moved to ${roomName}.`;

            //const moveInfo = `Player ${ws.playerId} moved to (${nextMove.x}, ${nextMove.y}).`;
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
            // const suggestionInfo = `Player ${ws.playerId} suggests: ${data.suspect} with the ${data.weapon} at position (x: ${gameState.lastPositions[ws.playerId].x} y: ${gameState.lastPositions[ws.playerId].y}).`;
            const roomName = getRoomName_Server(gameState.lastPositions[ws.playerId].x, gameState.lastPositions[ws.playerId].y); // Ensure this function exists and returns the correct room name
            const suggestionInfo = `Player ${ws.playerId} suggests: ${data.suspect} with the ${data.weapon} at ${roomName}.`;
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