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

const characterNames = ["Professor Plum", "Miss Scarlet", "Colonel Mustard", "Mrs. White", "Mr. Green", "Mrs. Peacock"];

class Player {
    constructor(id, x, y, character) {
        this.id = id;
        this.position = { x, y };
        this.cardsInHand = [];
        this.ws = null; // WebSocket connection
        this.hasMoved = false; // Add this line to track if the player has moved this turn
        this.character = character; // Directly assign character for simplicity
    
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
        if (x === 0 && y === 2) return 'Library';
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
        if (x === 2 && y === 4) return 'Ballroom'; 
    
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

    getRoomCoordinates(roomName) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.getRoomName(x, y) === roomName) {
                    return {x, y};
                }
            }
        }
        return null; // Return null if no room found
    }
}




function getNextMove(playerId, i, j) {
    const lastPos = gameState.players[playerId];
    const nextX = lastPos.x + i;
    const nextY = lastPos.y + j;

    // Print out the computed next x and y coordinates
    console.log(`Next move for player ${playerId}: x = ${nextX}, y = ${nextY}`);

    return { x: nextX, y: nextY };
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



function broadcastChat(message, playerId) {
    const sender = players.find(player => player.id === playerId);

    const chatMessage = JSON.stringify({ type: 'chat', message, sender: `Player ${playerId} (${sender.character})` });
    console.log(`Broadcasting message from Player ${playerId} (${sender.character}): ${message}`); // Log the message being sent
    players.forEach(player => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(chatMessage);
            console.log(`Sent to Player ${player.id}`); // Log the recipient of the message
        } else {
            console.log(`Connection not open for Player ${player.id}`); // Log if the connection is not open
        }
    });
}


// function that broadcast to one person only
function broadcastChatTo(message, playerReceive) {
   
    const chatMessage = JSON.stringify({ type: 'chat', message, sender: `System`});

    players.forEach(player => {
        if (player.id == playerReceive && player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(chatMessage);
            console.log(`Sent to Player ${player.id}`); // Log the recipient of the message
        } else {
            console.log(`Connection not open for Player ${player.id}`); // Log if the connection is not open
        }
    });
    
}



// function to handle show card existence
function handleShowCard(playerId, suspect, weapon, room) {

    // Reset the sequence of player checking. For example, if player 2 make a suggestion, the checking start on player3
    // Convert Set to an array
    let arrayFromSet = Array.from(players);

    // Reorganize the sequence of elements in the array
    let rearrangedArray = arrayFromSet.slice(playerId).concat(arrayFromSet.slice(0, playerId));

    // Convert the rearranged array back to a Set
    let rearrangedSet = new Set(rearrangedArray);
    
    // Initiate variable
    let findMessage = `initiate find message`;
    let findTrigger = 0;
    // Check for each player to see if the suggestion card exist in their hand
    rearrangedSet.forEach(player => {
        
        // Set up trigger to end the loop, once a card has been found
        if (findTrigger == 1) {
            return true;
        }

        if (player.id == playerId){
            console.log(`self, skip`);
        } else {
        // Convert object to string 
        let jsonString = JSON.stringify(player.cardsInHand.map(card => card.name));

        if (jsonString.indexOf(suspect) !== -1) {
            console.log(`${suspect} exists in the card list of player ${player.id}.`);
            findMessage = `${suspect} exists in the card list of player ${player.id}.`;
            findTrigger = 1;
            broadcastChatTo(findMessage, playerId);
            broadcastChat(`Player ${player.id} has one of the suggestion card.`, player.id)
            return true;
        } else if (jsonString.indexOf(weapon) !== -1){
            console.log(`${weapon} exists in the card list of player ${player.id}.`);
            findMessage = `${weapon} exists in the card list of player ${player.id}.`;
            findTrigger = 1;
            broadcastChatTo(findMessage, playerId);
            broadcastChat(`Player ${player.id} has one of the suggestion card.`, player.id)
            return true;
        } else if (jsonString.indexOf(room) !== -1){
            console.log(`${room} exists in the card list of player ${player.id}.`);
            findMessage = `${room} exists in the card list of player ${player.id}.`;
            findTrigger = 1;
            broadcastChatTo(findMessage, playerId);
            broadcastChat(`Player ${player.id} has one of the suggestion card.`, player.id)
            return true;
        } else {
            console.log(`No Card exists in the card list of player ${player.id}.`);
            findMessage = `No Card exists in the card list of player ${player.id}.`;
            broadcastChatTo(findMessage, playerId);
            broadcastChat(`This player possesses none of the suggestion card.`, player.id)
        }
        }
        
       
    });

}




function resetGameState() {


    // Clear game board
    gameState.board.forEach(row => row.fill(0));
    gameState.lastPositions = {};

    // Reset player positions and clear hands
    players.forEach((player, index) => {
        const initialPos = initialPlayerPositions[index];
        player.position.x = initialPos.x;
        player.position.y = initialPos.y;
        player.cardsInHand = [];
        player.hasMoved = false; // Reset move flag

        // Optionally send each player their new (empty) card hand and position
        // player.send({
        //     type: 'reset',
        //     position: player.position,
        //     cards: []
        // });
    });



    // Reset other game state variables
    currentTurn = 1; // Or whoever should start the new game
    gameState.currentTurn = currentTurn;
    gameSettings.isGameStarted = false;


    // Log reset completion
    console.log("Game state has been reset. Ready for a new game.");

    // Broadcast updated game state to all players
    broadcastGameState();
}


function endGame(winnerId) {
    broadcastChat(`Game Over! Player ${winnerId} wins. Resetting game...`, winnerId);
    // Reset game state, clear boards, prepare for new game session
    resetGameState();
    checkStartGame();
    broadcastGameState(); // Notify all players of the reset state
}


function handleSuggestion(playerId, suspect, weapon, room) {
    const accuser = players.find(p => p.id === playerId);
    const accused = getPlayerByCharacter(suspect);
    
    console.log(`Player ${playerId} (${accuser.character}) accuses: ${suspect} with the ${weapon} in the ${room}.`);
    console.log(`Winning cards are ${winningCards.suspect.name}, ${winningCards.weapon.name}, ${winningCards.room.name}.`);


    if (accused) {
        const roomCoords = gameBoard.getRoomCoordinates(room);
        if (roomCoords) {
            accused.position = roomCoords;
            clearPlayerPreviousMove(accused.id);

            // Update the accused player's position in the game state
            gameState.players[accused.id] ={x: roomCoords.x ,y: roomCoords.y} 
            gameState.board[roomCoords.y][roomCoords.x] = accused.id;

            console.log(`Moved ${suspect} to ${room} at coordinates ${roomCoords.x}, ${roomCoords.y}.`);
            let moveByMsg =`Player ${playerId} Moved ${suspect} to ${room}.`
            broadcastChat(moveByMsg,playerId)


        }
    }
    broadcastGameState(); 
}

function handleAccusation(playerId, suspect, weapon, room) {
    const accuser = players.find(p => p.id === playerId);
    const accused = getPlayerByCharacter(suspect);
    
    console.log(`Player ${playerId} (${accuser.character}) accuses: ${suspect} with the ${weapon} in the ${room}.`);
    console.log(`Winning cards are ${winningCards.suspect.name}, ${winningCards.weapon.name}, ${winningCards.room.name}.`);


    // if (accused) {
    //     const roomCoords = gameBoard.getRoomCoordinates(room);
    //     if (roomCoords) {
    //         accused.position = roomCoords;
    //         clearPlayerPreviousMove(accused.id);

    //         // Update the accused player's position in the game state
    //         gameState.players[accused.id] ={x: roomCoords.x ,y: roomCoords.y} 
    //         gameState.board[roomCoords.y][roomCoords.x] = accused.id;

    //         console.log(`Moved ${suspect} to ${room} at coordinates ${roomCoords.x}, ${roomCoords.y}.`);
    //         let moveByMsg =`Player ${playerId} Moved ${suspect} to ${room}.`
    //         broadcastChat(moveByMsg,playerId)
    //     }
    // }

    // Check if the accusation matches the winning cards
    if (suspect === winningCards.suspect.name &&
        weapon === winningCards.weapon.name &&
        room === winningCards.room.name) {
        // If the accusation is correct, broadcast the winner and end the game
        let winmessage =`Winner is  ${playerId} , ${suspect} with the ${weapon} in the ${room}.`
        console.log(`winner is ${playerId} `);
        broadcastChat(winmessage,playerId);
        // broadcastGameState(); 
        endGame(playerId);
    } else {
        // If the accusation is wrong, notify the player (or you might have specific rules for wrong accusations)
        console.log(`Incorrect accusation by Player ${playerId}. The game continues.`);
        let lostmessage = `Player ${playerId} (${accuser.character})'s accusation of ${suspect} with the ${weapon} in the ${room} is incorrect. The game continues.`;
        broadcastChat(lostmessage,playerId)

    }

    broadcastGameState(); 
}



function startGame() {
    gameSettings.isGameStarted = true;
    distributeCards();
    initialPlayerPositions.forEach((pos, index) => {
        // Only set the position for the number of players chosen by player one
        if (index < gameSettings.expectedNumberOfPlayers) {
            gameState.players[pos.id] = { x: pos.x, y: pos.y };
            gameState.board[pos.y][pos.x] = pos.id;
        }
    });

    broadcastGameState();
    console.log('Game has started');
}


function checkStartGame() {
    if (players.length === gameSettings.expectedNumberOfPlayers && !gameSettings.isGameStarted) {
        startGame();
    }
}

function getPlayerByCharacter(characterName) {
    console.log("Searching for character:", characterName);
    console.log("Available players:", players.map(p => `${p.id}: ${p.character}`));

    const foundPlayer = players.find(player => player.character === characterName);

    if (foundPlayer) {
        console.log("Found player:", foundPlayer.id);
    } else {
        console.log("No player found for character:", characterName);
    }

    return foundPlayer;
}

function endTurn(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player && player.hasMoved) {
        player.hasMoved = false; // Reset move flag for this player
        currentTurn = (currentTurn % players.length) + 1; // Move to the next player
        gameState.currentTurn = currentTurn;
        console.log(`Turn has ended. Now it's Player ${currentTurn}'s turn.`);
        broadcastGameState(); // Update all clients with the new turn info
    } else {
        currentTurn = (currentTurn % players.length) + 1; // Move to the next player
        gameState.currentTurn = currentTurn;
        console.log(`Player ${playerId} end the turn without moving.`);
        broadcastGameState(); 
    }
}




let gameSettings = {
    expectedNumberOfPlayers: 0, // This will be set by player one
    isGameStarted: false,
};
let gameBoard = new GameBoard(5, 5)
let currentTurn = 1; // Start with player 1
let players = [];

// let players = initialPlayerPositions.map((pos, index) => {
//     let characterNames = ["Professor Plum", "Miss Scarlet", "Colonel Mustard", "Mrs. White", "Mr. Green", "Mrs. Peacock"];
//     return new Player(pos.id, pos.x, pos.y, characterNames[index]);
// });

let gameState = {
    board: gameBoard.board, // Initialize a 10x10 board
    players: {}, // Stores current positions
    lastPositions: {}, // Stores last positions for each player
    currentTurn: 1
    
};


// WebSocket connection setup
wss.on('connection', function connection(ws) {
    if (players.length >= characterNames.length) {
        console.log("Maximum player limit reached. Rejecting new connection.");
        ws.close();
        return;
    }


    const playerId = players.length + 1; // Dynamic ID based on current player count
    console.log(`A new player has connected with ID: ${playerId}.`);

    const characterIndex = players.length; // Index from the character names array
    const initialPosition = initialPlayerPositions[characterIndex]; 
    const character = characterNames[characterIndex]; // Assign character based on connection order



    // Find the initial position for the new player
    // const initialPosition = initialPlayerPositions.find(pos => pos.id === playerId);

    // Create a new player instance with the initial position
    const player = new Player(playerId, initialPosition?.x || 0, initialPosition?.y || 0, character);
    
    player.ws = ws; // Assign the WebSocket connection to the player
    players.push(player); // Add the player to the players array
    
    console.log(`A new player has connected with ID: ${playerId}, character: ${character}.`);
    // Send player info to the newly connected player
    player.send({
        type: 'playerInfo',
        playerId: playerId,
        isPlayerOne: playerId === 1
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



        if (data.type === 'setPlayerCount' && playerId === 1) {
            const count = parseInt(data.count);
            if (count === 3 || count === 6) {
                gameSettings.expectedNumberOfPlayers = count;
                console.log(`Player one has set the game for ${count} players.`);
                checkStartGame(); // Check if we can start the game
            } else {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid number of players. Choose 3 or 6.' }));
            }
        }



        if (data.type === 'move' && data.playerId === currentTurn) {

            const player = players.find(p => p.id === data.playerId);
            if (!player.hasMoved) {


            if (data.direction === "down")      {i=0,j=1 } 
            if (data.direction === "up")        {i=0,j=-1}
            if (data.direction === "left")      {i=-1,j=0} 
            if (data.direction === "right")     {i=1,j=0}

            if (data.direction === "downRight")   {i=4,j=4}
            if (data.direction === "upRight")     {i=4,j=-4}
            if (data.direction === "upLeft")      {i=-4,j=-4}
            if (data.direction === "downLeft")    {i=-4,j=4}

            const nextMove = getNextMove(data.playerId,i,j);



            clearPlayerPreviousMove(currentTurn); // Clear the current player's last position
            gameState.lastPositions[currentTurn] = { x: nextMove.x, y: nextMove.y }; // Update last position

            console.log('player',playerId,'x move:', nextMove.x,'y move:',nextMove.y );

            gameState.players[currentTurn] = { x: nextMove.x, y: nextMove.y }; // Update current position
            gameState.board[nextMove.y][nextMove.x] = currentTurn; // Set new position on the board

                // Get room name based on coordinates
            const roomName = gameBoard.getRoomName(nextMove.x, nextMove.y); // Ensure this function exists and returns the correct room name

            const moveInfo = `Player ${data.playerId} moved to ${roomName}.`;

            broadcastChat(moveInfo, data.playerId); // Use this to broadcast move
           
            // currentTurn = (currentTurn % players.length) + 1; // Move to the next player
            // gameState.currentTurn = currentTurn;
            broadcastGameState(); // Broadcast updated game stat
            

            player.hasMoved = true;
        } else {
            console.log(`Player ${data.playerId} has already moved this turn.`);
            player.send({type: 'error', message: 'You have already moved this turn.'});
        }

        }

        if (data.type === 'endTurn' && data.playerId === currentTurn) {
            endTurn(data.playerId);
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
            handleSuggestion(data.playerId, data.suspect, data.weapon, roomName)
            handleShowCard(data.playerId, data.suspect, data.weapon, roomName)
        }

        if (data.type === 'accusation') {
            // const roomName = gameBoard.getRoomName(gameState.lastPositions[data.playerId].x, gameState.lastPositions[data.playerId].y); // Ensure this function exists and returns the correct room name
            const accusationInfo = `Player ${data.playerId} accuses: ${data.suspect} with the ${data.weapon} at ${data.room}.`;
            broadcastChat(accusationInfo, data.playerId); // Broadcast accusation

            console.log('player',playerId,'suspect:', data.suspect,'weapon:',data.weapon ,'room:',data.room );
            handleAccusation(data.playerId, data.suspect, data.weapon, data.room)
        }
        

    });

    ws.on('close', function() {


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