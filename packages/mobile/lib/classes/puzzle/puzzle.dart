import 'package:mobile/classes/abstract-game.dart';
import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/classes/puzzle/puzzle-player.dart';

class PuzzleGame extends AbstractGame {
  final PuzzlePlayer puzzlePlayer;
  final PuzzleLevel puzzleLevel;

  PuzzleGame(
      {required super.board,
      required super.tileRack,
      required this.puzzlePlayer,
      required this.puzzleLevel});
}
