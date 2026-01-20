import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentTurn, setCurrentTurn] = useState(null);
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState("waiting");
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    socket.on("gameStart", (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      setRoomId(data.roomId);
      setStatus("playing");
    });

    socket.on("gameState", (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
    });

    socket.on("gameOver", (data) => {
      setBoard(data.board);
      setWinner(data.winner);
      setStatus("finished");
    });

    return () => {
      socket.off("gameStart");
      socket.off("gameState");
      socket.off("gameOver");
    };
  }, []);

  function handleClick(index) {
    if (!roomId) return;
    socket.emit("makeMove", { roomId, index });
  }

  return (
    <div>
      <h1>Tic Tac Toe</h1>

      {status === "waiting" && <p>Waiting for opponent...</p>}
      {status === "playing" && <p>Turn: {currentTurn}</p>}
      {status === "finished" && <p>Winner: {winner}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)" }}>
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            style={{ height: 80, fontSize: 24 }}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
