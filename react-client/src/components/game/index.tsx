import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: "Rock Salt", cursive;
  position: relative;
`;

const RowContainer = styled.div`
  width: 100%;
  display: flex;
`;
const PlaneContainer = styled.div`
display: flex;
flex-direction: column;
position: relative;
margin-top: 25px;
`;
interface ICellProps {
  borderTop?: boolean;
  borderRight?: boolean;
  borderLeft?: boolean;
  borderBottom?: boolean;
}

const Cell = styled.div<ICellProps>`
  width: 3em;
  height: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  border-top: ${({ borderTop }) => borderTop && "3px solid cornflowerblue"};
  border-left: ${({ borderLeft }) => borderLeft && "3px solid cornflowerblue"};
  border-bottom: ${({ borderBottom }) => borderBottom && "3px solid cornflowerblue"};
  border-right: ${({ borderRight }) => borderRight && "3px solid cornflowerblue"};
  transition: all 270ms ease-in-out;

  &:hover {background-color: cornflowerblue;}
`;

const PlayStopper = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 99;
  cursor: default;
`;

const X = styled.span`
  font-size: 33px;
  color: #221C35;
  &::after {content: "X";}
`;

const O = styled.span`
  font-size: 33px;
  color: #221C35;
  &::after {content: "O";}
`;

export type IPlay3Matrix = Array<Array<Array<string | null>>>;
export interface IStartGame {
  start: boolean;
  symbol: "x" | "o";
}
//Check if a set of 2d points forms a line
const colinear2d = (points: number[][]) => {
  if(points[1][0] == points[0][0]){     //Check for a vertical line
    for (var i = 2; i < points.length; i++)
      if(points[i][0] != points[i-1][0]) return false;
    return true;
  }
  // Otherwise check for a non-vertical line
  let slope: number = (points[1][1] - points[0][1])/(points[1][0] - points[0][0]);
  for (var i = 2; i < points.length; i++)
    if((points[i-1][1] - points[i][1])/(points[i-1][0] - points[i][0]) != slope) return false;
  return true;
}

//Check if a set of 3d points forms a line by checking if all 3 of the 2d projections form a line
const colinear3d = (points: number[][]) => {
  let proj: number[][] = [];
  for (var i = 0; i < points.length; i++) proj.push([points[i][0] ,points[i][1]]);
  if(!colinear2d(proj)) return false;
  proj = [];
  for (var i = 0; i < points.length; i++) proj.push([points[i][0] ,points[i][2]]);
  if(!colinear2d(proj)) return false;
  proj = [];
  for (var i = 0; i < points.length; i++) proj.push([points[i][1] ,points[i][2]]);
  if(!colinear2d(proj)) return false;
  return true;
}
export function Game(): JSX.Element {
  const [matrix, setMatrix] = useState<IPlay3Matrix>([
    [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
    [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
    [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
    [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
  ]);

  const [MoveLogX]  = useState<number[][]>([]);
  const [MoveLogO]  = useState<number[][]>([]);
  
const {
    playerSymbol,
    setPlayerSymbol,
    setPlayerTurn,
    isPlayerTurn,
    setGameStarted,
    isGameStarted,
    setGameEnded,
    isGameEnded,
    gameResult,
    setGameResult,
  } = useContext(gameContext);

   
  const checkGameState = (MoveLog: number[][]) => {
    for (var i = 0; i < MoveLog.length; i++) 
      for (var j = 0; j < i; j++) 
        for (var k = 0; k < j; k++) 
          if(colinear3d([MoveLog[i],MoveLog[j],MoveLog[k]]))
            for (var l = 0; l < k; l++) 
              if(colinear3d([MoveLog[i],MoveLog[j],MoveLog[k],MoveLog[l]])) return true;
    return false;
  };
  const Win = (symbol: "x" | "o") => {
    if (socketService.socket) gameService.gameWin(socketService.socket, symbol);
    setGameEnded(true);
    setGameResult("W");
  }
  const updateGameMatrix = (column: number, row: number, plane: number, symbol: "x" | "o") => {
    const newMatrix = [...matrix];
   
    if (newMatrix[plane][row][column] === null || newMatrix[plane][row][column] === "null") {
      newMatrix[plane][row][column] = symbol;
      setMatrix(newMatrix);
    }
    if (socketService.socket) gameService.updateGame(socketService.socket, newMatrix);

    if(symbol == "x"){
      MoveLogX.push([plane, row, column]);
      if (checkGameState(MoveLogX)) Win("x");
    }
    else if(symbol == "o"){
      MoveLogO.push([plane, row, column]);
      if (checkGameState(MoveLogO)) Win("o");
    }
    if(MoveLogX.length == 32 && MoveLogX.length == 32){
      setGameEnded(true);
    }
    
    setPlayerTurn(false);
  };

  const handleGameUpdate = () => {
    if (socketService.socket)
      gameService.onGameUpdate(socketService.socket, (newMatrix) => {
        setMatrix(newMatrix);
        setPlayerTurn(true);
      });
  };

  const handleGameStart = () => {
    if (socketService.socket)
      gameService.onStartGame(socketService.socket, (options) => {
        setGameStarted(true);
        setPlayerSymbol(options.symbol);
        if (options.start) setPlayerTurn(true);
        else setPlayerTurn(false);
      });
  };

  const handleGameWin = () => {
    if (socketService.socket)
      gameService.onGameWin(socketService.socket, (winner) => {
        setPlayerTurn(false);
        setGameEnded(true);
        setGameResult("L");
      });
  };

  useEffect(() => {
    handleGameUpdate();
    handleGameStart();
    handleGameWin();
  }, []);

  return (
    <GameContainer>
      {!isGameStarted && (
        <h2>Waiting for Other Player to Join to Start the Game!</h2>
      )}
      {(!isGameStarted || !isPlayerTurn) && <PlayStopper />}
      {matrix.map((plane, planeIdx) => {
      return (
      <PlaneContainer>
       {plane.map((row, rowIdx) => {
        return (
          <RowContainer>
            {row.map((column, columnIdx) => (
              <Cell
                borderRight={columnIdx < 3}
                borderLeft={columnIdx > 0}
                borderBottom={rowIdx < 3}
                borderTop={rowIdx > 0}
                onClick={() =>updateGameMatrix(columnIdx, rowIdx,planeIdx, playerSymbol)}
              >
                {column && column !== "null" ? (column === "x" ? (<X />) : (<O />)) : null}
              </Cell>
            ))}
          </RowContainer>
        );
      })}
       </PlaneContainer>
       );
      })}
    </GameContainer>
  );
}
