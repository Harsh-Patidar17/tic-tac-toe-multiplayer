// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import "./App.css";

// const socket = io("http://localhost:3000");

// function App() {
//   const [board, setBoard] = useState(Array(9).fill(""));
//   const [currentTurn, setCurrentTurn] = useState(null);
//   const [winner, setWinner] = useState(null);
//   const [status, setStatus] = useState("waiting");
//   const [roomId, setRoomId] = useState(null);
//   const [mySymbol, setMySymbol] = useState(null);

//   useEffect(() => {
//     socket.on("gameStart", (data) => {
//       setBoard(data.board);
//       setCurrentTurn(data.currentTurn);
//       setRoomId(data.roomId);
//       setMySymbol(
//         socket.id === data.players.X ? "X" : "O"
//       );
//       setStatus("playing");
//     });

//     socket.on("gameState", (data) => {
//       setBoard(data.board);
//       setCurrentTurn(data.currentTurn);
//     });

//     socket.on("gameOver", (data) => {
//       setBoard(data.board);
//       setWinner(data.winner);
//       setStatus("finished");
//     });

//     return () => {
//       socket.off("gameStart");
//       socket.off("gameState");
//       socket.off("gameOver");
//     };
//   }, []);

//   function handleClick(index) {
//     if (status !== "playing") return;
//     socket.emit("makeMove", { roomId, index });
//   }

//   function getStatusText() {
//     if (status === "waiting") return "Waiting for opponent...";
//     if (status === "finished") {
//       if (winner === "draw") return "It's a draw 🤝";
//       return winner === mySymbol ? "You won 🎉" : "You lost 💀";
//     }
//     return currentTurn === mySymbol
//       ? "Your turn"
//       : "Opponent's turn";
//   }

//   return (
//     <div className="app">
//       <h1>Tic Tac Toe</h1>

//       <div className={`status ${status}`}>
//         {getStatusText()}
//       </div>

//       <div className="board">
//         {board.map((cell, index) => (
//           <button
//             key={index}
//             className={`cell ${cell}`}
//             onClick={() => handleClick(index)}
//             disabled={cell !== "" || status !== "playing"}
//           >
//             {cell}
//           </button>
//         ))}
//       </div>

//       {mySymbol && (
//         <p className="footer">
//           You are playing as <strong>{mySymbol}</strong>
//         </p>
//       )}
//     </div>
//   );
// }

// export default App;

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://tic-tac-toe-multiplayer-pl3o.onrender.com");

export default function App() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState(null);
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState("waiting");
  const [roomId, setRoomId] = useState(null);
  const [me, setMe] = useState(null);
  const [players, setPlayers] = useState({});
  const [rematchMessage, setRematchMessage] = useState("");

  useEffect(() => {
    socket.on("gameStart", (data) => {
      setRematchMessage("");
      setBoard(data.board);
      setTurn(data.currentTurn);
      setRoomId(data.roomId);
      setPlayers(data.players);
      setMe(socket.id === data.players.X.id ? "X" : "O");
      setWinner(null);
      setStatus("playing");
    });

    socket.on("gameState", (data) => {
      setBoard(data.board);
      setTurn(data.currentTurn);
    });

    socket.on("gameOver", (data) => {
      setBoard(data.board);
      setWinner(data.winner);
      setStatus("finished");
    });
    socket.on("rematchRequested", () => {
      setRematchMessage("Opponent is asking for a rematch 👀");
    });
    return () => {
    socket.off("rematchRequested");
};

    return () => socket.removeAllListeners();
  }, []);

  function join() {
    socket.emit("setName", name);
    socket.emit("joinGame");
    setJoined(true);
}


  function move(i) {
    if (status !== "playing") return;
    socket.emit("makeMove", { roomId, index: i });
  }

  function rematch() {
    socket.emit("requestRematch", { roomId });
  }

  function label() {
    if (!joined) return "Enter your name";
    if (status === "waiting") return "Waiting for opponent...";
    if (status === "finished") {
      if (winner === "draw") return "Draw 🤝";
      if (winner === "opponent_left") return "Opponent left";
      return winner === me ? "You won 🎉" : "You lost 💀";
    }
    return turn === me ? "Your turn" : "Opponent’s turn";
  }

  if (!joined) {
    return (
      <div className="app">
        <h1>Tic Tac Toe</h1>
        <input
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button onClick={join}>Join</button>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Tic Tac Toe</h1>
      <div className="status">{label()}</div>

      <div className="board">
        {board.map((c, i) => (
          <button
            key={i}
            onClick={() => move(i)}
            disabled={c !== "" || status !== "playing"}
            className={`cell ${c}`}
          >
            {c}
          </button>
        ))}
      </div>

      {players.X && (
        <p>
          {players.X.name} (X) vs {players.O.name} (O)
        </p>
      )}
      {rematchMessage && (
        <p className="rematch-info">{rematchMessage}</p>
      )}

      {status === "finished" && (
        <button onClick={rematch}>Rematch</button>
      )}
    </div>
  );
}
