import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/game/player.dart';
import 'package:mobile/classes/game/players_container.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/classes/tile/tile-rack.dart';

class GameService {
  GameService._privateConstructor();

  Game? game;

  GameService() {
    // TODO: Change this to actual gameplay
    game = Game(
        board: Board(),
        tileRack: TileRack(),
        players: PlayersContainer.fromPlayers(
          player1: Player(name: "George", points: 420),
          player2: Player(name: "Léonard", points: 69, isLocalPlayer: true),
          player3: Player(name: "Hernest", points: 666),
          player4: Player(name: "Bernard", points: 2),
        ));

    game?.board.grid[7][7].tile = Tile.create("B", 1);
    game?.board.grid[7][8].tile = Tile.create("O", 1);
    game?.board.grid[7][9].tile = Tile.create("N", 1);
    game?.board.grid[7][10].tile = Tile.create("J", 1);
    game?.board.grid[7][11].tile = Tile.create("O", 1);
    game?.board.grid[7][12].tile = Tile.create("U", 1);
    game?.board.grid[7][13].tile = Tile.create("R", 1);

    game?.board.grid[8][9].tile = Tile.create("O", 1);
    game?.board.grid[9][9].tile = Tile.create("E", 1);
    game?.board.grid[10][9].tile = Tile.create("L", 1);

    game?.tileRack.tiles = [
      Tile.create("P", 1),
      Tile.create("N", 1),
      Tile.create("E", 1),
      Tile.create("I", 1),
      Tile.create("S", 1),
    ];
  }

  Game getGame() {
    if (game == null) throw Exception("No game");

    return game!;
  }
}
