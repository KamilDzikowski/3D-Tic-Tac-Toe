import React from "react";

export interface IGameContextProps {
  isInRoom: boolean;
  setInRoom: (inRoom: boolean) => void;
  playerSymbol: "x" | "o";
  setPlayerSymbol: (symbol: "x" | "o") => void;
  isPlayerTurn: boolean;
  setPlayerTurn: (turn: boolean) => void;
  isGameStarted: boolean;
  setGameStarted: (started: boolean) => void;
  isGameEnded: boolean;
  setGameEnded: (ended: boolean) => void;
  gameResult: "W" | "D" | "L";
  setGameResult: (symbol: "W" | "D" | "L") => void;
}

const defaultState: IGameContextProps = {
  isInRoom: false,
  setInRoom: () => {},
  playerSymbol: "x",
  setPlayerSymbol: () => {},
  isPlayerTurn: false,
  setPlayerTurn: () => {},
  isGameStarted: false,
  setGameStarted: () => {},
  isGameEnded: false,
  setGameEnded: () => {},
  gameResult: "D",
  setGameResult: () => {},
};

export default React.createContext(defaultState);
