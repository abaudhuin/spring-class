function play(column) {
    fetch("/game?column=" + column, {method: "PUT"}).then(
        () => refreshBoard()
    );
}

function refreshBoard() {
    fetch("/game")
        .then((response) => response.json())
        .then((game) => {
            game.board.forEach((row, rowIndex) => {
                row.forEach((cell, columnIndex) => {
                    if (cell) {
                        const cellElement = document.getElementById(
                            `${rowIndex}-${columnIndex}`
                        );
                        cellElement.className = `cell piece ${cell}`;
                    }
                });
            });
            let message = document.getElementById("message");
            if (game.winner) {
                message.innerText = `Winner: ${game.winner}`;
            } else {
                message.innerText = "";
            }
        });
}

refreshBoard();
