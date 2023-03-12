import 'dart:developer';

import 'package:async/async.dart';
import 'package:flutter/cupertino.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/game/game-config.dart';
import 'package:mobile/classes/game/game-update.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/game/player.dart';
import 'package:mobile/classes/game/players-container.dart';
import 'package:mobile/classes/player/player-data.dart';
import 'package:mobile/classes/rounds/round.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/erros/game-errors.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/view-methods/group.methods.dart';
import 'package:rxdart/rxdart.dart';

import '../utils/round-utils.dart';

class GameService {
  final ActionService _actionService = getIt.get<ActionService>();
  final RoundService _roundService = getIt.get<RoundService>();
  final BehaviorSubject<Game?> _game;

  static final GameService _instance = GameService._();

  factory GameService() {
    return _instance;
  }

  GameService._() : _game = BehaviorSubject() {
    startGameEvent.listen((InitializeGameData initializeGameData) => startGame(
        initializeGameData.localPlayerSocketId,
        initializeGameData.startGameData));

    gamePlayController.gameUpdateEvent
        .listen((GameUpdateData gameUpdate) => updateGame(gameUpdate));
  }

  GamePlayController gamePlayController = getIt.get<GamePlayController>();

  void startGame(String localPlayerId, StartGameData startGameData) {
    PlayersContainer playersContainer = PlayersContainer.fromPlayers(
        player1: startGameData.player1,
        player2: startGameData.player2,
        player3: startGameData.player3,
        player4: startGameData.player4);
    playersContainer.localPlayerId = localPlayerId;

    playersContainer.players
        .where((Player player) => player.socketId == localPlayerId)
        .map((Player player) => player.isLocalPlayer = true);

    TileRack tileRack = TileRack();

    _game.add(Game(
        board: Board(),
        tileRack: tileRack,
        players: playersContainer,
        roundDuration: roundTimeToRoundDuration(startGameData.maxRoundTime),
        tileReserve: startGameData.tileReserve));

    _roundService.startRound(startGameData.firstRound);

    Navigator.pushReplacementNamed(
        navigatorKey.currentContext!, GAME_PAGE_ROUTE);
  }

  void updateGame(GameUpdateData gameUpdate) {
    if (_game.value == null) {
      throw Exception('Cannot update game: game is null');
    }

    Game game = _game.value!;

    if (gameUpdate.tileReserve != null) {
      game.tileReserve = gameUpdate.tileReserve!;
    }

    if (gameUpdate.player1 != null) {
      game.players.getPlayer(0).updatePlayerData(gameUpdate.player1!);
    }

    if (gameUpdate.player2 != null) {
      game.players.getPlayer(1).updatePlayerData(gameUpdate.player2!);
    }

    if (gameUpdate.player3 != null) {
      game.players.getPlayer(2).updatePlayerData(gameUpdate.player3!);
    }

    if (gameUpdate.player4 != null) {
      game.players.getPlayer(3).updatePlayerData(gameUpdate.player3!);
    }

    if (gameUpdate.board != null) {
      game.board.updateBoardData(gameUpdate.board!);
    }

    if (gameUpdate.round != null) {
      _roundService.updateRoundData(gameUpdate.round!);
    }

    if (gameUpdate.isGameOver != null) {
      game.isOver = gameUpdate.isGameOver!;
    }

    _game.add(game);
  }

  Game get game {
    if (_game.value == null) throw Exception("No game");

    return _game.value!;
  }

  ValueStream<Game?> get gameStream {
    return _game.stream;
  }

  Stream<TileRack?> get tileRackStream {
    return _game.map((game) => game?.tileRack);
  }

  TileRack getTileRack() {
    if (_game.value == null) throw Exception("No game");

    return _game.value!.tileRack;
  }

  void playPlacement() {
    if (!(_game.value?.board.isValidPlacement ?? false)) return;

    var placement = _game.value?.board.currentPlacement;

    if (placement == null) {
      throw Exception('Cannot play placement: placement is null');
    }

    _actionService.sendAction(ActionType.place, placement.toActionPayload());
  }

  bool isLocalPlayerActivePlayer() {
    return isActivePlayer(game.players.getLocalPlayer().socketId);
  }

  bool isActivePlayer(String socketId) {
    return _roundService.getActivePlayerId() == socketId;
  }
}
