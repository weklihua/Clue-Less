document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket('ws://localhost:8080'); // Update with your actual WebSocket server URL
    let myPlayerId = null;

    ws.onopen = () => {
        console.log('Connected to the server');
    };



    const suspectsDropdown = document.getElementById('suspectsDropdown');
    suspectsArray.forEach(suspect => {
        const option = document.createElement('option');
        option.value = suspect.name.toLowerCase();
        option.textContent = suspect.name;
        suspectsDropdown.appendChild(option);
    });

    const weaponsDropdown = document.getElementById('weaponsDropdown');
    weaponsArray.forEach(weapon => {
        const option = document.createElement('option');
        option.value = weapon.name.toLowerCase();
        option.textContent = weapon.name;
        weaponsDropdown.appendChild(option);
    });




    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'init':
                myPlayerId = data.playerId;
                document.getElementById('turnIndicator').textContent = 'Waiting for other players...';
                break;
            case 'update':
                updateBoard(data.board);
                if (data.currentTurn === myPlayerId) {
                    document.getElementById('turnIndicator').textContent = 'Your turn';
                    document.getElementById('moveButton').disabled = false;
                    document.getElementById('suggestButton').disabled = false; // Enable suggest button
                } else {
                    document.getElementById('turnIndicator').textContent = `Player ${data.currentTurn}'s turn`;
                    document.getElementById('moveButton').disabled = true;
                    document.getElementById('suggestButton').disabled = true; // Disable suggest button
                }
                break;

            case 'chat':
            displayChatMessage(data.message,data.sender);
                break;

        }
    };

    document.getElementById('moveButton').addEventListener('click', () => {
        if (!document.getElementById('moveButton').disabled) {
            ws.send(JSON.stringify({ type: 'move', playerId: myPlayerId}));
        }
    });

function updateBoard(board) {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = ''; // Clear the board before updating
    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            if (cell > 0) { // If the cell is not empty, assign a class based on the player number
                cellElement.classList.add(`player${cell}`);
            }
            gameBoard.appendChild(cellElement);
        });
    });
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
    if (!document.getElementById('moveButton').disabled) {
        const suspect = document.getElementById('suspectsDropdown').value;
        const weapon = document.getElementById('weaponsDropdown').value;

        ws.send(JSON.stringify({ 
            type: 'suggestion', 
            suspect, 
            weapon, 
            //moveInfo: moveInfo, 
            playerId: myPlayerId 
        }));
    }
});









});




