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




    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'init':

                myPlayerId = data.playerId;
                document.getElementById('turnIndicator').textContent = 'Waiting for other players...';
                // initiateBoard(data.board, data.players);
                updateBoard(data.board);
                break;
            case 'update':
                updateBoard(data.board);
                if (data.currentTurn === myPlayerId) {
                    document.getElementById('turnIndicator').textContent = 'Your turn';
                    //document.getElementById('moveButton').disabled = false;
                    document.getElementById('moveUp').disabled = false;
                    document.getElementById('moveDown').disabled = false;
                    document.getElementById('moveLeft').disabled = false;
                    document.getElementById('moveRight').disabled = false;

                    
                    document.getElementById('suggestButton').disabled = false; // Enable suggest button
                } else {
                    document.getElementById('turnIndicator').textContent = `Player ${data.currentTurn}'s turn`;
                    //document.getElementById('moveButton').disabled = true;
                    document.getElementById('moveUp').disabled = true;
                    document.getElementById('moveDown').disabled = true;
                    document.getElementById('moveLeft').disabled = true;
                    document.getElementById('moveRight').disabled = true;
                    document.getElementById('suggestButton').disabled = true; // Disable suggest button
                }
                break;

            case 'chat':
            displayChatMessage(data.message,data.sender);
                break;

        }
    };



    document.getElementById('moveUp').addEventListener('click', () => {
        if (!document.getElementById('moveUp').disabled) {
            ws.send(JSON.stringify({ type: 'move', direction: 'up', playerId: myPlayerId }));
        }
    });
    document.getElementById('moveDown').addEventListener('click', () => {
        if (!document.getElementById('moveDown').disabled) {
            ws.send(JSON.stringify({ type: 'move', direction: 'down', playerId: myPlayerId }));
        }
    });
    document.getElementById('moveLeft').addEventListener('click', () => {
        if (!document.getElementById('moveLeft').disabled) {
            ws.send(JSON.stringify({ type: 'move', direction: 'left', playerId: myPlayerId }));
        }
    });
    document.getElementById('moveRight').addEventListener('click', () => {
        if (!document.getElementById('moveRight').disabled) {
            ws.send(JSON.stringify({ type: 'move', direction: 'right', playerId: myPlayerId }));
        }
    });





function updateBoard(board) {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = ''; // Clear the board before updating

    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            // Assign a class based on the player number or cell type
            if (cell > 0) {
                cellElement.classList.add(`player${cell}`);
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

function getRoomName_Client(x, y) {
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




// Send chat message function
document.getElementById('sendButton').addEventListener('click', () => {
    const messageBox = document.getElementById('chatMessage');
    const message = messageBox.value;
    ws.send(JSON.stringify({ type: 'chat', message: message, playerId: myPlayerId }));
    messageBox.value = ''; // Clear input box after sending
});


function displayChatMessage(message, sender) {
    const chatBox = document.getElementById('chatBox');
    // Ensure messages from self also display properly
    //const senderName = sender === myPlayerId ? 'You' : `Player ${sender}`;
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



});




