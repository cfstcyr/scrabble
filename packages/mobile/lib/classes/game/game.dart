import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/game/players_container.dart';
import 'package:mobile/classes/tile/tile-reserve.dart';

class Game {
  Board board;
  TileRack tileRack;
  PlayersContainer players;
  Duration roundDuration;
  List<TileReserveData> tileReserve;
  bool isOver;

  Game({
    required this.board,
    required this.tileRack,
    required this.players,
    required this.roundDuration,
    required this.tileReserve,
    this.isOver = false,
  });

  int computeNumberOfTilesLeft() {
    if (tileReserve.isEmpty) return 0;

    return tileReserve
        .map((TileReserveData tile) => tile.amount)
        .reduce((value, int amount) => value + amount);
  }
}
