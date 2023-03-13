import 'package:flutter/material.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/player-leave-service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:rxdart/rxdart.dart';

class GameActions extends StatelessWidget {
  final GameService _gameService = getIt.get<GameService>();
  final ActionService _actionService = getIt.get<ActionService>();
  final RoundService _roundService = getIt.get<RoundService>();
  final GameEventService _gameEventService = getIt.get<GameEventService>();

  void surrender(BuildContext context) {
    getIt.get<PlayerLeaveService>().abandonGame(context);
  }

  void leave(BuildContext context) {
    getIt.get<PlayerLeaveService>().leaveGame(context);
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Game?>(
      stream: _gameService.gameStream,
      builder: (context, snapshot) {
        return Card(
          child: Container(
              height: 70,
              padding:
                  EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  StreamBuilder<bool>(
                      stream: _endGameStream(),
                      initialData: false,
                      builder: (context, snapshot) {
                        bool isOver = snapshot.hasData && snapshot.data!;
                        return AppButton(
                          onPressed: () =>
                              isOver ? leave(context) : surrender(context),
                          icon: isOver ? Icons.output_outlined : Icons.flag,
                          size: AppButtonSize.large,
                          theme: AppButtonTheme.danger,
                        );
                      }),
                  StreamBuilder<bool>(
                      stream: _canPlayStream(),
                      initialData: false,
                      builder: (context, snapshot) {
                        return AppButton(
                          onPressed: snapshot.hasData && snapshot.data!
                              ? () {
                                  _actionService.sendAction(ActionType.hint);
                                }
                              : null,
                          icon: Icons.lightbulb,
                          size: AppButtonSize.large,
                        );
                      }),

                  StreamBuilder<bool>(
                      stream: _canExchangeStream(),
                      initialData: false,
                      builder: (context, snapshot) {
                        return AppButton(
                          onPressed: snapshot.hasData && snapshot.data!
                              ? () {
                                  _actionService.sendAction(
                                      ActionType.exchange,
                                      _gameService
                                          .getTileRack()
                                          .getSelectedTilesPayload());
                                  _gameService
                                      .getTileRack()
                                      .disableExchangeMode();
                                }
                              : null,
                          icon: Icons.swap_horiz_rounded,
                          size: AppButtonSize.large,
                        );
                      }), //Échanger
                  StreamBuilder<bool>(
                      stream: _canPlayStream(),
                      initialData: false,
                      builder: (context, snapshot) {
                        return AppButton(
                          onPressed: snapshot.hasData && snapshot.data!
                              ? () {
                                  _actionService.sendAction(ActionType.pass);
                                  _gameEventService.add<void>(
                                      PUT_BACK_TILES_ON_TILE_RACK, null);
                                }
                              : null,
                          icon: Icons.not_interested_rounded,
                          size: AppButtonSize.large,
                        );
                      }), // Passer
                  StreamBuilder<bool>(
                    stream: snapshot.hasData
                        ? _canPlaceStream(snapshot.data!)
                        : Stream.value(false),
                    builder: (context, canPlace) {
                      return AppButton(
                        onPressed: canPlace.data ?? false
                            ? () => _gameService.playPlacement()
                            : null,
                        icon: Icons.play_arrow_rounded,
                        size: AppButtonSize.large,
                      );
                    },
                  ),
                ],
              )),
        );
      },
    );
  }

  Stream<bool> _canPlayStream() {
    return CombineLatestStream<dynamic, bool>([
      _gameService.gameStream,
      _actionService.isActionBeingProcessedStream,
      _roundService.getActivePlayerId()
    ], (values) {
      Game game = values[0];
      bool isActionBeingProcessed = values[1];
      String activePlayerSocketId = values[2];

      return _roundService.isActivePlayer(
              activePlayerSocketId, game.players.getLocalPlayer().socketId) &&
          !game.isOver &&
          !isActionBeingProcessed;
    });
  }

  Stream<bool> _endGameStream() {
    return CombineLatestStream<dynamic, bool>([
      _gameService.gameStream,
    ], (values) {
      Game game = values[0];

      return game.isOver;
    });
  }

  Stream<bool> _canExchangeStream() {
    return CombineLatestStream<dynamic, bool>(
        [_canPlayStream(), _gameService.getTileRack().selectedTilesStream],
        (values) {
      bool canPlay = values[0];
      List<Tile> selectedTiles = values[1];

      return canPlay && selectedTiles.isNotEmpty;
    });
  }

  Stream<bool> _canPlaceStream(Game game) {
    return CombineLatestStream(
        [_canPlayStream(), game.board.isValidPlacementStream], (values) {
      bool canPlay = values[0];
      bool isValidPlacement = values[1];
      return canPlay && isValidPlacement;
    });
  }
}
