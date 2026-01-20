import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors"
const app = express();

const server = createServer(app);
app.use(cors());
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});
    let waitingPlayer = null;
    let games = {};

    function createBoard() {
        return ["", "", "", "", "", "", "", "", ""];
    }

    const checkWinner = (board) => {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        for(const combo of winningCombinations) {
            const [a,b,c] = combo;
            if(board[a] == "") continue;

            if(board[a] == board[b] && board[b] == board[c]) {
                return board[a];
            }
        }
        return null;
    }
io.on("connection", (socket) => {
    console.log("server connected", socket.id);
    
    if(!waitingPlayer) {
        waitingPlayer = socket;
        // to whom should i emit for waiting. socket or io
    }
    else {
        const playerX = waitingPlayer;
        const playerO = socket;
        waitingPlayer = null;
        const roomId = `game-${playerX.id}-${playerO.id}`;
        playerX.join(roomId);
        playerO.join(roomId);

        games[roomId] = {
            currentTurn: "X",
            players: {
                "X": playerX.id,
                "O": playerO.id
            },
            status: "playing",
            board: createBoard()
        }
        io.to(roomId).emit("gameStart", {
            currentTurn: "X",
            roomId,
            players: games[roomId].players,
            board: games[roomId].board
        })
        console.log("bhosads connected", roomId);
        
    }
    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
        
        if(waitingPlayer && waitingPlayer.id === socket.id) {
            waitingPlayer = null;
        }

        for(const roomId in games) {
            const game = games[roomId];
            if(game.players.X == socket.id || game.players.O == socket.id) {
                io.to(roomId).emit("gameOver", {
                    reason: "Opponent Left"
                })
            }
            delete games[roomId];
            console.log("Bhosads went", roomId);
            
        }
    })
    // makeMove
    socket.on("makeMove", ({roomId, index}) => {
        const game = games[roomId];

        if(!game || game.status != "playing") {
            return;
        }
        let playerSymbol = null;
        if(game.players.X === socket.id) playerSymbol = "X";
        else if(game.players.O === socket.id) playerSymbol = "O";
        else return;

        if(playerSymbol != game.currentTurn) return;
        
        if(game.board[index] != "") return;
        game.board[index] = playerSymbol;

        const winner = checkWinner(game.board);
        if(winner) {
            game.status = "winner";
            game.winner = winner;
        
        io.to(roomId).emit("gameOver", {
            board: game.board,
            winner: game.winner
        })
        return;
        }
        const isDraw = game.board.every(cell => cell != "")
        if(isDraw) {
            game.status = "finished";
            winner = "draw"

            io.to(roomId).emit("gameOver", {
                board: game.board,
                winner: "draw"
            })
        return;
        }

        game.currentTurn = game.currentTurn === "X" ? "O" : "X";

        io.to(roomId).emit("gameState", {
            board: game.board,
            currentTurn: game.currentTurn
        })

    })
})
        
    

server.listen(3000, () => {
    console.log("the server is running.");    
});