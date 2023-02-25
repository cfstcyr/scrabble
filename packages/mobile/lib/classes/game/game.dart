import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/game/players_container.dart';

class Game {
  Board board;
  TileRack tileRack;
  PlayersContainer players;
  Duration timeLeft;

  Game({
    required this.board,
    required this.tileRack,
    required this.players,
    required this.timeLeft,
  });
}
