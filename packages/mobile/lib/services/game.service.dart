import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/game/player.dart';
import 'package:mobile/classes/game/players_container.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/user.dart';
import 'package:rxdart/rxdart.dart';

class GameService {
  final BehaviorSubject<Game?> _game$;

  static final GameService _instance = GameService._();

  factory GameService() {
    return _instance;
  }

  GameService._() : _game$ = BehaviorSubject() {
    // TODO: Not do this
    _game$.add(Game(
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
        timeLeft: Duration(minutes: 1, seconds: 42)));

    _game.board.grid[7][7].setTile(Tile.create("B", 1)).applyTile();
    _game.board.grid[7][8].setTile(Tile.create("O", 1)).applyTile();
    _game.board.grid[7][9].setTile(Tile.create("N", 1)).applyTile();
    _game.board.grid[7][10].setTile(Tile.create("J", 1)).applyTile();
    _game.board.grid[7][11].setTile(Tile.create("O", 1)).applyTile();
    _game.board.grid[7][12].setTile(Tile.create("U", 1)).applyTile();
    _game.board.grid[7][13].setTile(Tile.create("R", 1)).applyTile();

    _game.board.grid[8][9].setTile(Tile.create("O", 1)).applyTile();
    _game.board.grid[9][9].setTile(Tile.create("E", 1)).applyTile();
    _game.board.grid[10][9].setTile(Tile.create("L", 1)).applyTile();

    _game.tileRack.setTiles([
      Tile.create("P", 1),
      Tile.create("N", 1),
      Tile.create("E", 1),
      Tile.create("I", 1),
      Tile.create("S", 1),
      Tile.create("I", 1),
      Tile.wildcard(),
    ]);
  }

  Game get _game {
    if (_game$.value == null) throw Exception("No game");

    return _game$.value!;
  }

  ValueStream<Game?> get gameStream {
    return _game$.stream;
  }

  Stream<TileRack?> get tileRackStream {
    return _game$.map((game) => game?.tileRack);
  }

  TileRack getTileRack() {
    if (_game$.value == null) throw Exception("No game");

    return _game$.value!.tileRack;
  }
}
