import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/tile/multiplier.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/constants/game.constants.dart';

class Game {
  Board board;
  TileRack tileRack;

  Game({
    required this.board,
    required this.tileRack,
  });
}
