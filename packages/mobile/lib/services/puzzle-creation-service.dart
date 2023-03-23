import 'dart:convert';

import 'package:http/http.dart';
import 'package:mobile/classes/group.dart';
import 'package:mobile/classes/puzzle/puzzle.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/controllers/game-creation-controller.dart';
import 'package:mobile/controllers/puzzle-creation-controller.dart';
import 'package:mobile/services/socket.service.dart';

import '../components/error-pop-up.dart';
import '../constants/locale/groups-constants.dart';
import '../locator.dart';
import '../routes/navigator-key.dart';

class PuzzleCreationService {
  PuzzleCreationController _puzzleCreationController =
      getIt.get<PuzzleCreationController>();

  PuzzleCreationService._privateConstructor();

  static final PuzzleCreationService _instance =
      PuzzleCreationService._privateConstructor();

  factory PuzzleCreationService() {
    return _instance;
  }

  Future<bool> startPuzzle(Duration roundDuration) async {
    return await _puzzleCreationController.startPuzzle().then((Response value) {
      _handleStartPuzzle(StartPuzzle.fromJson(jsonDecode(value.body))
          .withRoundDuration(roundDuration));
      return true;
    }).catchError((error) => false);
  }

  void _handleStartPuzzle(StartPuzzle startPuzzle) {
    print(startPuzzle);
  }
}
