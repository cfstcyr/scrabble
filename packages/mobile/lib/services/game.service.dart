import 'dart:developer';

import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/game/player.dart';
import 'package:mobile/classes/game/players_container.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/user.dart';

class GameService {
  GameService._privateConstructor();

  Game? game;

  GameService() {
    // TODO: Change this to actual gameplay
    game = Game(
        board: Board(),
        tileRack: TileRack(),
        players: PlayersContainer.fromPlayers(
          player1: Player(
              user: PublicUser(username: "George"),
              points: 420,
              isLocalPlayer: true),
          player2: Player(user: PublicUser(username: "Léonard"), points: 69),
          player3: Player(user: PublicUser(username: "Hernest"), points: 666),
          player4: Player(user: PublicUser(username: "Bernard"), points: 2),
        ),
        roundDuration: Duration(minutes: 1, seconds: 42));

    game?.board.grid[7][7].setTile(Tile.create("B", 1));
    game?.board.grid[7][8].setTile(Tile.create("O", 1));
    game?.board.grid[7][9].setTile(Tile.create("N", 1));
    game?.board.grid[7][10].setTile(Tile.create("J", 1));
    game?.board.grid[7][11].setTile(Tile.create("O", 1));
    game?.board.grid[7][12].setTile(Tile.create("U", 1));
    game?.board.grid[7][13].setTile(Tile.create("R", 1));

    game?.board.grid[8][9].setTile(Tile.create("O", 1));
    game?.board.grid[9][9].setTile(Tile.create("E", 1));
    game?.board.grid[10][9].setTile(Tile.create("L", 1));

    game?.tileRack.setTiles([
      Tile.create("P", 1),
      Tile.create("N", 1),
      Tile.create("E", 1),
      Tile.create("I", 1),
      Tile.create("S", 1),
      Tile.create("I", 1),
      Tile.create("S", 1),
    ]);
  }

  Game getGame() {
    if (game == null) throw Exception("No game");

    return game!;
  }

  TileRack getTileRack() {
    if (game == null) throw Exception("No game");

    return game!.tileRack;
  }
}