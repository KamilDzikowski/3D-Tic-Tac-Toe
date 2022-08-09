import React, { useContext, useState } from "react";
import styled from "styled-components";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";

interface IJoinRoomProps {}

const ResultText = styled.h1`
  margin: 3u;
  font-size: 36pt; 
  color: cornflowerblue;
`;
const ResultContainer = styled.div`
width: 100%;
heigth: 20%;
display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  `;

const RestartButton = styled.button`
  outline: none;
  background-color: cornflowerblue;
  color: #fff;
  font-size: 17px;
  border: 2px solid transparent;
  border-radius: 5px;
  padding: 4px 18px;
  transition: all 230ms ease-in-out;
  margin-top: 1em;
  cursor: pointer;

  &:hover {
    background-color: transparent;
    border: 2px solid cornflowerblue;
    color: cornflowerblue;
  }
`;

export function Result(props: IJoinRoomProps) {
  const [roomName, setRoomName] = useState("");
  const { setGameStarted, isGameStarted } = useContext(gameContext);
  const { setGameEnded, isGameEnded } = useContext(gameContext);
  const { setInRoom, isInRoom } = useContext(gameContext);
  const { setGameResult, gameResult } = useContext(gameContext);

  const reset = async () => {
    const socket = socketService.socket;
    if (!socket) return;
    
    const left = await gameService.leaveGameRoom(socket, roomName).catch((err) => {alert(err);});
    
    if (left) 
    {
      setInRoom(false);
      setGameStarted(false);
      setGameEnded(false);
    }
  };

  return (
    <form onSubmit={reset}>
      <ResultContainer>
          {gameResult == "W" && <ResultText>You Win</ResultText>}
          {gameResult == "L" && <ResultText>You Loose</ResultText>}
          {gameResult == "D" && <ResultText>Draw</ResultText>}
          <RestartButton type="submit">{"Play again"}</RestartButton>
      </ResultContainer>
    </form>
  );
}
