import 'dart:convert';

import 'package:http/http.dart';
import 'package:mobile/classes/puzzle/puzzle-config.dart';
import 'package:mobile/classes/puzzle/puzzle.dart';
import 'package:mobile/controllers/puzzle-controller.dart';
import 'package:mobile/services/round-service.dart';
import 'package:rxdart/rxdart.dart';

import '../locator.dart';

class PuzzleService {
  final PuzzleController _puzzleController =
      getIt.get<PuzzleController>();
  final RoundService _roundService = getIt.get<RoundService>();
  final BehaviorSubject<PuzzleGame?> _puzzle;

  PuzzleService._privateConstructor() : _puzzle = BehaviorSubject();

  static final PuzzleService _instance =
      PuzzleService._privateConstructor();

  factory PuzzleService() {
    return _instance;
  }

  Future<bool> startPuzzle(Duration roundDuration) async {
    return await _puzzleController.startPuzzle().then((Response value) {
      _handleStartPuzzle(StartPuzzle.fromJson(jsonDecode(value.body))
          .withRoundDuration(roundDuration));
      return true;
    }).catchError((error) => false);
  }

  void _handleStartPuzzle(StartPuzzle startPuzzle) {
    print(startPuzzle);
  }
}
