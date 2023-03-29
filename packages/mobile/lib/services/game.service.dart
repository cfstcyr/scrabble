import 'package:flutter/cupertino.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/game/game-config.dart';
import 'package:mobile/classes/game/game-update.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/game/player.dart';
import 'package:mobile/classes/game/players_container.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/end-game.service.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game-messages.service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/services/user.service.dart';
import 'package:mobile/view-methods/group.methods.dart';
import 'package:rxdart/rxdart.dart';

import '../components/alert-dialog.dart';
import '../components/app_button.dart';
import '../constants/locale/game-constants.dart';
import 'game-observer-service.dart';

class GameService {
  final GamePlayController gamePlayController = getIt.get<GamePlayController>();
  final ActionService _actionService = getIt.get<ActionService>();
  final RoundService _roundService = getIt.get<RoundService>();
  final GameEventService _gameEventService = getIt.get<GameEventService>();
  final GameObserverService _gameObserverService =
      getIt.get<GameObserverService>();
  final BehaviorSubject<MultiplayerGame?> _game;

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

  void startGame(String localPlayerId, StartGameData startGameData) {
    PlayersContainer playersContainer = PlayersContainer.fromPlayers(
        player1: startGameData.player1,
        player2: startGameData.player2,
        player3: startGameData.player3,
        player4: startGameData.player4);

    playersContainer.localPlayerId = localPlayerId;
    if (getIt.get<UserService>().isObserver) {
      playersContainer.localPlayerId = playersContainer.player1.socketId;
    }

    playersContainer.players
        .where((Player player) => player.socketId == localPlayerId)
        .map((Player player) => player.isLocalPlayer = true);

    _gameObserverService.playersContainer.add(playersContainer);

    TileRack tileRack =
        TileRack().setTiles(playersContainer.getLocalPlayer().tiles);

    _game.add(MultiplayerGame(
        board: Board(),
        tileRack: tileRack,
        players: playersContainer,
        tileReserve: startGameData.tileReserve));

    _roundService.startRound(startGameData.firstRound, _onTimerExpires);
    getIt.get<GameMessagesService>().resetMessages();
    Navigator.pushReplacementNamed(
        navigatorKey.currentContext!, GAME_PAGE_ROUTE);
  }

  void updateGame(GameUpdateData gameUpdate) {
    if (_game.value == null) {
      throw Exception('Cannot update game: game is null');
    }

    MultiplayerGame game = _game.value!;

    _gameEventService.add<void>(PUT_BACK_TILES_ON_TILE_RACK, null);

    if (gameUpdate.tileReserve != null) {
      game.tileReserve = gameUpdate.tileReserve!;
    }

    if (gameUpdate.player1 != null) {
      game.players.getPlayer(1).updatePlayerData(gameUpdate.player1!);
    }

    if (gameUpdate.player2 != null) {
      game.players.getPlayer(2).updatePlayerData(gameUpdate.player2!);
    }

    if (gameUpdate.player3 != null) {
      game.players.getPlayer(3).updatePlayerData(gameUpdate.player3!);
    }

    if (gameUpdate.player4 != null) {
      game.players.getPlayer(4).updatePlayerData(gameUpdate.player4!);
    }

    _gameObserverService.playersContainer.add(game.players);

    if (gameUpdate.board != null) {
      game.board.updateBoardData(gameUpdate.board!);
    }

    if (gameUpdate.round != null) {
      _roundService.updateRoundData(gameUpdate.round!, _onTimerExpires);
    }

    if (gameUpdate.isGameOver != null) {
      game.isOver = gameUpdate.isGameOver!;
      if (game.isOver) {
        getIt
            .get<EndGameService>()
            .setEndGame(game.isOver, gameUpdate.winners ?? []);
      }
    }

    if (!getIt.get<UserService>().isObserver) {
      game.tileRack.setTiles(game.players.getLocalPlayer().tiles);
    }

    _game.add(game);
  }

  MultiplayerGame get game {
    if (_game.value == null) throw Exception("No game");

    return _game.value!;
  }

  ValueStream<MultiplayerGame?> get gameStream {
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

  void handleEndGame(BuildContext context) {
    String player = getIt.get<UserService>().getUser().username;
    bool isWinner = getIt.get<EndGameService>().winners$.value.contains(player);

    triggerDialogBox(DIALOG_END_OF_GAME_TITLE(isWinner), [
      Text(DIALOG_END_OF_GAME_CONTENT(isWinner), style: TextStyle(fontSize: 16))
    ], [
      DialogBoxButtonParameters(
          content: DIALOG_LEAVE_BUTTON_CONTINUE,
          theme: AppButtonTheme.secondary,
          onPressed: () async {
            await getIt.get<GamePlayController>().leaveGame();

            if (!context.mounted) return;
            Navigator.popUntil(context, ModalRoute.withName(HOME_ROUTE));
          }),
      DialogBoxButtonParameters(
        content: DIALOG_STAY_BUTTON_CONTINUE,
        theme: AppButtonTheme.secondary,
        closesDialog: true,
      ),
    ]);
  }

  bool isActivePlayer(String socketId) {
    return _roundService.getActivePlayerId() == socketId;
  }

  void _onTimerExpires() {
    if (!getIt.get<UserService>().isObserver &&
        _roundService.currentRound.socketIdOfActivePlayer ==
            getIt.get<GameService>().game.players.getLocalPlayer().socketId) {
      _actionService.sendAction(ActionType.pass);
      _gameEventService.add<void>(PUT_BACK_TILES_ON_TILE_RACK, null);
    }
  }
}
