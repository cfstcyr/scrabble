import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/constants/create-game.constants.dart';

class StartPuzzle {
  List<Square> board;
  List<Tile> tiles;
  late Duration roundDuration;

  StartPuzzle({required this.board, required this.tiles, this.roundDuration = DEFAULT_TIME});

  factory StartPuzzle.fromJson(Map<String, dynamic> json) {
    return StartPuzzle(
        board: List<Square>.from(
            (json['board'] as List).map((e) => Square.fromJson(e))),
        tiles: List<Tile>.from(
            (json['tiles'] as List).map((e) => Tile.fromJson(e))));
  }

  StartPuzzle withRoundDuration(Duration roundDuration) {
    this.roundDuration = roundDuration;
    return this;
  }

}
