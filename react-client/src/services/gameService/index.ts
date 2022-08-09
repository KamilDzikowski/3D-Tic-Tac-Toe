import { Socket } from "socket.io-client";
import { IPlay3Matrix, IStartGame } from "../../components/game";

class GameService {
  public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
    return new Promise((rs, rj) => {
      socket.emit("join_game", { roomId });
      socket.on("room_joined", () => rs(true));
      socket.on("room_join_error", ({ error }) => rj(error));});
  }
  public async leaveGameRoom(socket: Socket, roomId: string): Promise<boolean> {
    return new Promise((rs, rj) => {
      socket.emit("leave_game", { roomId });
      socket.on("room_left", () => rs(true));
      socket.on("room_leave_error", ({ error }) => rj(error));});
  }
  public async updateGame(socket: Socket, gameMatrix: IPlay3Matrix) {
    socket.emit("update_game", { matrix: gameMatrix });
  }

  public async onGameUpdate(
    socket: Socket,
    listiner: (matrix: IPlay3Matrix) => void
  ) {
    socket.on("on_game_update", ({ matrix }) => listiner(matrix));
  }

  public async onStartGame(
    socket: Socket,
    listiner: (options: IStartGame) => void
  ) {
    socket.on("start_game", listiner);
  }

  public async gameWin(socket: Socket, winner: "x" | "o") {
    socket.emit("game_win", winner);
  }

  public async onGameWin(socket: Socket,
    listiner: (winner: "x" | "o") => void){
    socket.on("on_game_win", listiner);
  }
}

export default new GameService();
