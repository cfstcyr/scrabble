import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/puzzle/puzzle-config.dart';
import 'package:mobile/classes/puzzle/puzzle.dart';
import 'package:mobile/classes/rounds/round.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/controllers/puzzle-controller.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/game-messages.service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/services/socket.service.dart';
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

    _puzzle.add(PuzzleGame(board: board, tileRack: tileRack));

    Round firstRound = Round(socketIdOfActivePlayer: getIt.get<SocketService>().getSocket().id ?? '', duration: startPuzzle.roundDuration);

    _roundService.startRound(firstRound);
    getIt.get<GameMessagesService>().resetMessages();
  }

  void completePuzzle() {

  }

  void abandonPuzzle() {
    _puzzleController.abandonPuzzle();
  }

  void quitPuzzle() {
    _puzzleController.quitPuzzle();
  }
}
