import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'package:mobile/classes/actions/word-placement.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/puzzle/puzzle-config.dart';
import 'package:mobile/classes/puzzle/puzzle-player.dart';
import 'package:mobile/classes/puzzle/puzzle.dart';
import 'package:mobile/classes/rounds/round.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/constants/puzzle-constants.dart';
import 'package:mobile/constants/socket-constants.dart';
import 'package:mobile/controllers/puzzle-controller.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/game-messages.service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/user.service.dart';
import 'package:rxdart/rxdart.dart';

import '../locator.dart';

class PuzzleService {
  final PuzzleController _puzzleController =
      getIt.get<PuzzleController>();
  final RoundService _roundService = getIt.get<RoundService>();
  final UserService _userService = getIt.get<UserService>();
  final BehaviorSubject<PuzzleGame?> _puzzle;
  PuzzlePlayer? _currentPlayer;

  PuzzleService._privateConstructor() : _puzzle = BehaviorSubject(), _currentPlayer = null;

  static final PuzzleService _instance =
      PuzzleService._privateConstructor();

  factory PuzzleService() {
    return _instance;
  }

  ValueStream<PuzzleGame?> get puzzleStream => _puzzle.stream;

  Future<bool> startPuzzle(Duration roundDuration) async {
    return await _puzzleController.startPuzzle().then((Response value) {
      _handleStartPuzzle(StartPuzzle.fromJson(jsonDecode(value.body))
          .withRoundDuration(roundDuration));
      return true;
    }).catchError((error) => false);
  }

  void _handleStartPuzzle(StartPuzzle startPuzzle) {
    List<Square> gridConfig = startPuzzle.board;
    List<Tile> tileRackConfig = startPuzzle.tiles;

    Board board = Board();
    board.updateBoardData(gridConfig);

    TileRack tileRack = TileRack().setTiles(tileRackConfig);

    PuzzlePlayer player = _getPuzzlePlayerForGame();
    _puzzle.add(PuzzleGame(board: board, tileRack: tileRack, puzzlePlayer: player));

    Round firstRound = Round(socketIdOfActivePlayer: UNDEFINED_SOCKET, duration: startPuzzle.roundDuration);

    _roundService.startRound(firstRound, _onTimerExpires);
  }

  void completePuzzle() {
    if(!(_puzzle.value?.board.isValidPlacement ?? false)) {
      abandonPuzzle();
      return;
    }

    Placement? placement = _puzzle.value?.board.currentPlacement;

    if (placement == null) throw Exception('Cannot play placement, placement is null');

    WordPlacement wordPlacement = WordPlacement(actionPlacePayload: placement.toActionPayload());
    _puzzleController.completePuzzle(wordPlacement);

    // TODO Updater le nombre de points dans PuzzlePlayer
  }

  void abandonPuzzle() {
    _puzzleController.abandonPuzzle();

    // TODO Updater le nombre de points dans PuzzlePlayer
  }

  void quitPuzzle() {
    _puzzleController.quitPuzzle();
    _currentPlayer = null;
  }

  void _onTimerExpires() {
    completePuzzle();
  }

  PuzzlePlayer _getPuzzlePlayerForGame() {
    return _currentPlayer ?? PuzzlePlayer(user: _userService.user.value ?? UNKNOWN_USER, streakPoints: 0, streakMaxPoints: 0);
  }
}