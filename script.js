// script.js



document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket('ws://localhost:8080'); // Update with your actual WebSocket server URL
    let myPlayerId = null;

    ws.onopen = () => {
        console.log('Connected to the server');
    };


    const suspectsDropdown = document.getElementById('suspectsDropdown');
    suspectsArray.forEach(suspect => {
        const option = document.createElement('option');
        option.value = suspect.name;
        option.textContent = suspect.name;
        suspectsDropdown.appendChild(option);
    });

    const weaponsDropdown = document.getElementById('weaponsDropdown');
    weaponsArray.forEach(weapon => {
        const option = document.createElement('option');
        option.value = weapon.name;
        option.textContent = weapon.name;
        weaponsDropdown.appendChild(option);
    });

    function displayCards(cards, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Clear previous cards
        cards.forEach(card => {
            const cardElement = document.createElement('button'); // Changed from 'div' to 'button'
            cardElement.textContent = card; // Assuming each card has a 'name' property
            cardElement.className = 'card'; // Add a class for styling
            cardElement.addEventListener('click', function() {
                alert('Clicked on ' + card); // Replace this with actual click handling logic
            });
            container.appendChild(cardElement);
        });
    }
    
    document.getElementById('endTurnButton').addEventListener('click', function() {
        if (!this.disabled) {
            ws.send(JSON.stringify({
                type: 'endTurn',
                playerId: myPlayerId
            }));
        }
    });

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {


            case 'playerInfo':
                // Check if this client is Player 1
                if (data.isPlayerOne) {
                    // Show the player count selection for Player 1
                    document.getElementById('playerCountSelection').style.display = 'block';
                } else {
                    // Hide the player count selection for other players
                    document.getElementById('playerCountSelection').style.display = 'none';
                }
                break;

            case 'init':

                myPlayerId = data.playerId;
                document.getElementById('turnIndicator').textContent = 'Waiting for other players...';
                // initiateBoard(data.board, data.players);
                updateBoard(data.board);


                if (data.initialPositions) {
                    const initialPos = data.initialPositions.find(pos => pos.id == myPlayerId);
                    if (initialPos) {
                        currentPlayerX = initialPos.x;
                        currentPlayerY = initialPos.y;
                    }
                }

                break;
            case 'update':
                updateBoard(data.board);

                if (data.lastPositions) {
                    lastPos = data.lastPositions[myPlayerId];
                    if (lastPos) {
                        currentPlayerX = lastPos.x;
                        currentPlayerY = lastPos.y;
                    }
                }
                


                if (data.currentTurn === myPlayerId) {

                    document.getElementById('turnIndicator').textContent = 'Your turn';

                    document.getElementById('moveUp').disabled = false;
                    document.getElementById('moveDown').disabled = false;
                    document.getElementById('moveLeft').disabled = false;
                    document.getElementById('moveRight').disabled = false;
                    document.getElementById('endTurnButton').disabled = false;
                    

                } else {
                    document.getElementById('turnIndicator').textContent = `Player ${data.currentTurn}'s turn`;

                    document.getElementById('moveUp').disabled = true;
                    document.getElementById('moveDown').disabled = true;
                    document.getElementById('moveLeft').disabled = true;
                    document.getElementById('moveRight').disabled = true;
                    document.getElementById('endTurnButton').disabled = true;

                }


                // Move to Diagonal romm only enable when the player in a room with secret path
                if ((data.currentTurn === myPlayerId) && isCellRoomSecret(currentPlayerX, currentPlayerY) ) {
                    document.getElementById('moveUpRight').disabled = false; // Enable button
                    document.getElementById('moveUpLeft').disabled = false; // Enable button
                    document.getElementById('moveDownRight').disabled = false; // Enable button
                    document.getElementById('moveDownLeft').disabled = false; // Enable button
                } else {
                    document.getElementById('moveUpRight').disabled = true; // Disable button
                    document.getElementById('moveUpLeft').disabled = true; // Disable button
                    document.getElementById('moveDownRight').disabled = true; // Disable button
                    document.getElementById('moveDownLeft').disabled = true; // Disable button
                }

                // Make Suggestion or Accusation only enable when the player in a room
                // SZ Note: we suppose to accusation regardless if the player current in a room.
                // To achieve that, we need to have a dropdown menu for room. 
                // Given the time constraint, only enable accusation when the player currently in a room
                if ((data.currentTurn === myPlayerId) && isCellRoom(currentPlayerX, currentPlayerY) ) {
                    document.getElementById('suggestButton').disabled = false; // Enable suggest button
                    document.getElementById('accuseButton').disabled = false; // Enable suggest button
                } else {
                    document.getElementById('suggestButton').disabled = true; // Disable suggest button
                    document.getElementById('accuseButton').disabled = true; // Disable suggest button
                }
                

                break;

            case 'yourCards': 

                displayCards(data.cards, 'allcards');



                break;



            case 'chat':
            displayChatMessage(data.message,data.sender);
                break;

        }
    };

    document.getElementById('startGame').addEventListener('click', () => {
        
        const playerCount = document.getElementById('playerCount').value;
        
        ws.send(JSON.stringify({ 
            type: 'setPlayerCount', 
            count: parseInt(playerCount, 10),
            playerId: myPlayerId 
            
        }));

        // this.disabled = true; // 'this' refers to the button clicked
        document.getElementById('playerCount').disabled = true; // Disable the player count selection
        document.getElementById('playerCountSelection').style.display = 'none';

    });
    



    document.getElementById('moveUp').addEventListener('click', () => {
        if (!document.getElementById('moveUp').disabled) {
            const newX = currentPlayerX;
            const newY = currentPlayerY - 1;
            if (!isCellBlocked(newX, newY) && newY >= 0) { // Notice the NOT operator here to ensure logic correctness
                ws.send(JSON.stringify({ type: 'move', direction: 'up', playerId: myPlayerId }));
                // Here, you might also want to update currentPlayerX and currentPlayerY to reflect the new position
            } else {
                alert('This cell is blocked!');
            }
        }
    });
    


    document.getElementById('moveDown').addEventListener('click', () => {
        if (!document.getElementById('moveDown').disabled) {
            const newX = currentPlayerX;
            const newY = currentPlayerY + 1; // Moving down increases the Y coordinate
            if (!isCellBlocked(newX, newY) && newY <= 4) {
                ws.send(JSON.stringify({ type: 'move', direction: 'down', playerId: myPlayerId }));
                // Update currentPlayerY after the server confirms the move
            } else {
                alert('This cell is blocked!');
            }
        }
    });

    document.getElementById('moveLeft').addEventListener('click', () => {
        if (!document.getElementById('moveLeft').disabled) {
            const newX = currentPlayerX - 1; // Moving left decreases the X coordinate
            const newY = currentPlayerY;
            if (!isCellBlocked(newX, newY) && newX >= 0) {
                ws.send(JSON.stringify({ type: 'move', direction: 'left', playerId: myPlayerId }));
                // Update currentPlayerX after the server confirms the move
            } else {
                alert('This cell is blocked!');
            }
        }
    });
    
    document.getElementById('moveRight').addEventListener('click', () => {
        if (!document.getElementById('moveRight').disabled) {
            const newX = currentPlayerX + 1; // Moving right increases the X coordinate
            const newY = currentPlayerY;
            if (!isCellBlocked(newX, newY) && newX <= 4) {
                ws.send(JSON.stringify({ type: 'move', direction: 'right', playerId: myPlayerId }));
                // Update currentPlayerX after the server confirms the move
            } else {
                alert('This cell is blocked!');
            }
        }
    });


    document.getElementById('moveDownRight').addEventListener('click', () => {
        if (!document.getElementById('moveDownRight').disabled) {
            const newX = currentPlayerX + 4;
            const newY = currentPlayerY + 4;
            if (newX >= 0 && newX <= 4 && newY >= 0 && newY <= 4 ) { // Notice the NOT operator here to ensure logic correctness
                ws.send(JSON.stringify({ type: 'move', direction: 'downRight', playerId: myPlayerId }));
                // Here, you might also want to update currentPlayerX and currentPlayerY to reflect the new position
            } else {
                alert('This is an invalid Move! Please select the correct direction!');
            }
        }
    });

    document.getElementById('moveUpRight').addEventListener('click', () => {
        if (!document.getElementById('moveUpRight').disabled) {
            const newX = currentPlayerX + 4;
            const newY = currentPlayerY - 4;
            if (newX >= 0 && newX <= 4 && newY >= 0 && newY <= 4 ) { // Notice the NOT operator here to ensure logic correctness
                ws.send(JSON.stringify({ type: 'move', direction: 'upRight', playerId: myPlayerId }));
                // Here, you might also want to update currentPlayerX and currentPlayerY to reflect the new position
            } else {
                alert('This is an invalid Move! Please select the correct direction!');
            }
        }
    });

    document.getElementById('moveUpLeft').addEventListener('click', () => {
        if (!document.getElementById('moveUpLeft').disabled) {
            const newX = currentPlayerX - 4;
            const newY = currentPlayerY - 4;
            if (newX >= 0 && newX <= 4 && newY >= 0 && newY <= 4 ) { // Notice the NOT operator here to ensure logic correctness
                ws.send(JSON.stringify({ type: 'move', direction: 'upLeft', playerId: myPlayerId }));
                // Here, you might also want to update currentPlayerX and currentPlayerY to reflect the new position
            } else {
                alert('This is an invalid Move! Please select the correct direction!');
            }
        }
    });

    document.getElementById('moveDownLeft').addEventListener('click', () => {
        if (!document.getElementById('moveDownLeft').disabled) {
            const newX = currentPlayerX - 4;
            const newY = currentPlayerY + 4;
            if (newX >= 0 && newX <= 4 && newY >= 0 && newY <= 4 ) { // Notice the NOT operator here to ensure logic correctness
                ws.send(JSON.stringify({ type: 'move', direction: 'downLeft', playerId: myPlayerId }));
                // Here, you might also want to update currentPlayerX and currentPlayerY to reflect the new position
            } else {
                alert('This is an invalid Move! Please select the correct direction!');
            }
        }
    });



function updateBoard(board) {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = ''; // Clear the board before updating

    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';

            // Optional: Set data attributes for cell coordinates
            cellElement.dataset.x = x;
            cellElement.dataset.y = y;
            // Assign a class based on the player number or cell type
            if (cell > 0) {
                cellElement.classList.add(`player${cell}`);
                cellElement.classList.add(`piece`);
            } else if (cell === -1) { // Assuming -1 indicates a blocked cell
                cellElement.classList.add('blocked');
            }

            
            // Here, assign names to specific cells
            if ((x === 1 && y === 3) || (x === 1 && y === 1) || (x === 3 && y === 3) || (x === 3 && y === 1)) {
                cellElement.classList.add('blocked'); // You already have this for blocked cells
            } else {
                // Assign room names based on coordinates
                const roomName = getRoomName_Client(x, y); // You should define this function based on your room layout
                cellElement.setAttribute('data-room', roomName);
                cellElement.textContent = roomName; // Display the room name on the cell
                if (roomName === 'Hallway' && (x ===0 || x===2 || x===4 ) ){
                    cellElement.classList.add('hallway_Horizontal');
                }
                if (roomName === 'Hallway' && (x ===1 || x===3 )){
                    cellElement.classList.add('hallway_Vertical');
                }            
            }
            gameBoard.appendChild(cellElement);
        });
    });
}




function isCellBlocked(x, y) {
    // These are the coordinates of blocked cells
    const blockedCells = [
        { x: 1, y: 3 },
        { x: 1, y: 1 },
        { x: 3, y: 3 },
        { x: 3, y: 1 }

    ];

    // Check if (x, y) matches any blocked cell
    return blockedCells.some(cell => cell.x === x && cell.y === y);
}




// Function to check if the current position have secret path
function isCellRoomSecret(x, y) {
    // These are the coordinates of Room have secret path
    const RoomCellsSecret = [
        { x: 0, y: 0 }, // Study
        { x: 0, y: 4 }, // Conservatory
        { x: 4, y: 0 }, // Lounge
        { x: 4, y: 4 } // Kitchen
    ];

    // Check if (x, y) matches any room with secret path
    return RoomCellsSecret.some(cell => cell.x === x && cell.y === y);
}



// Function to check if the current position is a room
function isCellRoom(x, y) {
    // These are the coordinates of romm
    const RoomCells = [
        { x: 0, y: 0 }, // Study
        { x: 0, y: 2 }, // Library
        { x: 0, y: 4 }, // Conservatory
        { x: 2, y: 0 }, // Hall
        { x: 2, y: 2 }, // Billiard Room
        { x: 2, y: 4 }, // Ballroom
        { x: 4, y: 0 }, // Lounge
        { x: 4, y: 2 }, // Dining Room
        { x: 4, y: 4 } // Kitchen
    ];

    // Check if (x, y) matches any room
    return RoomCells.some(cell => cell.x === x && cell.y === y);
}






function getRoomName_Client(x, y) {
    // Define your room layout here, for example:
    if (x === 0 && y === 0) return 'Study';
    if (x === 0 && y === 1) return 'Hallway';
    if (x === 0 && y === 2) return 'Library';
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
    if (x === 2 && y === 4) return 'Ballroom'; 

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




// Send chat message function
document.getElementById('sendButton').addEventListener('click', () => {
    const messageBox = document.getElementById('chatMessage');
    const message = messageBox.value;
    ws.send(JSON.stringify({ type: 'chat', message: message, playerId: myPlayerId }));
    messageBox.value = ''; // Clear input box after sending
});


function displayChatMessage(message, sender) {
    const chatBox = document.getElementById('chatBox');

    senderName  = ` ${sender}` 
    chatBox.innerHTML += `<p><strong>${senderName}:</strong> ${message}</p>`; // Append new message
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}





document.getElementById('suggestButton').addEventListener('click', () => {
    //if (!document.getElementById('moveButton').disabled) {
        const suspect = document.getElementById('suspectsDropdown').value;
        const weapon = document.getElementById('weaponsDropdown').value;

        ws.send(JSON.stringify({ 
            type: 'suggestion', 
            suspect, 
            weapon, 
            //moveInfo: moveInfo, 
            playerId: myPlayerId 
        }));
   // }
});



document.getElementById('accuseButton').addEventListener('click', () => {
    //if (!document.getElementById('moveButton').disabled) {
        const suspect = document.getElementById('suspectsDropdown').value;
        const weapon = document.getElementById('weaponsDropdown').value;

        ws.send(JSON.stringify({ 
            type: 'accusation', 
            suspect, 
            weapon, 
            //moveInfo: moveInfo, 
            playerId: myPlayerId 
        }));
   // }
});


});




