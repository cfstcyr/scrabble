import 'package:mobile/classes/abstract-game.dart';
import 'package:mobile/classes/puzzle/puzzle-player.dart';

class PuzzleGame extends AbstractGame {
  final PuzzlePlayer puzzlePlayer;

  PuzzleGame(
      {required super.board,
      required super.tileRack,
      required this.puzzlePlayer});
}
