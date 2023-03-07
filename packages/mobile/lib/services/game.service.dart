import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/game/player.dart';
import 'package:mobile/classes/game/players_container.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/action-service.dart';
import 'package:rxdart/rxdart.dart';

class GameService {
  final ActionService _actionService = getIt.get<ActionService>();
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
              socketId: '1',
              user: PublicUser(username: "George", avatar: '', email: ''),
              score: 420,
              isLocalPlayer: true),
          player2: Player(
              socketId: '2',
              user: PublicUser(username: "Léonard", avatar: '', email: ''),
              score: 69),
          player3: Player(
              socketId: '3',
              user: PublicUser(username: "Hernest", avatar: '', email: ''),
              score: 666),
          player4: Player(
              socketId: '4',
              user: PublicUser(username: "Bernard", avatar: '', email: ''),
              score: 2),
        ),
        roundDuration: Duration(minutes: 1, seconds: 42)));

    game.board.grid[7][7].setTile(Tile.create("B", 1)).applyTile();
    game.board.grid[7][8].setTile(Tile.create("O", 1)).applyTile();
    game.board.grid[7][9].setTile(Tile.create("N", 1)).applyTile();
    game.board.grid[7][10].setTile(Tile.create("J", 1)).applyTile();
    game.board.grid[7][11].setTile(Tile.create("O", 1)).applyTile();
    game.board.grid[7][12].setTile(Tile.create("U", 1)).applyTile();
    game.board.grid[7][13].setTile(Tile.create("R", 1)).applyTile();

    game.board.grid[8][9].setTile(Tile.create("O", 1)).applyTile();
    game.board.grid[9][9].setTile(Tile.create("E", 1)).applyTile();
    game.board.grid[10][9].setTile(Tile.create("L", 1)).applyTile();

    game.tileRack.setTiles([
      Tile.create("P", 1),
      Tile.create("N", 1),
      Tile.create("E", 1),
      Tile.create("I", 1),
      Tile.create("S", 1),
      Tile.create("I", 1),
      Tile.wildcard(),
    ]);
  }

  Game get game {
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

  void playPlacement() {
    if (!(_game$.value?.board.isValidPlacement ?? false)) return;

    var placement = _game$.value?.board.currentPlacement;

    if (placement == null) {
      throw Exception('Cannot play placement: placement is null');
    }

    _actionService.sendAction(ActionType.place, placement.toActionPayload());
  }
}
