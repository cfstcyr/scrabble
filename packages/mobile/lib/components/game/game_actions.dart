import 'package:async/async.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/player-leave-service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:rxdart/rxdart.dart';

class GameActions extends StatelessWidget {
  GameService _gameService = getIt.get<GameService>();
  ActionService _actionService = getIt.get<ActionService>();
  RoundService _roundService = getIt.get<RoundService>();

  void surrender(BuildContext context) {
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
                  AppButton(
                    onPressed: () => surrender(context),
                    icon: Icons.flag,
                    size: AppButtonSize.large,
                    theme: AppButtonTheme.danger,
                  ),
                  AppButton(
                    onPressed: () {},
                    icon: Icons.lightbulb,
                    size: AppButtonSize.large,
                  ),
                  StreamBuilder<bool>(
                    stream: _canExchangeStream(),
                    initialData: false,
                    builder: (context, snapshot) {
                      return AppButton(
                        onPressed: snapshot.hasData && snapshot.data!
                            ? () => _actionService.sendAction(
                                ActionType.exchange,
                                _gameService
                                    .getTileRack()
                                    .getSelectedTilesPayload())
                            : null,
                        icon: Icons.swap_horiz_rounded,
                        size: AppButtonSize.large,
                      );
                    }
                  ), //Échanger
                  StreamBuilder<bool>(
                    stream: _canPlayStream(),
                    initialData: false,
                    builder: (context, snapshot) {
                      return AppButton(
                        onPressed: snapshot.hasData && snapshot.data!
                            ? () => _actionService.sendAction(ActionType.pass)
                            : null,
                        icon: Icons.not_interested_rounded,
                        size: AppButtonSize.large,
                      );
                    }
                  ), // Passer
                  StreamBuilder<bool>(
                    stream: snapshot.hasData ? snapshot.data!.board.isValidPlacementStream : Stream.value(false),
                    builder: (context, isValidPlacement) {
                      return AppButton(
                        onPressed: isValidPlacement.data ?? false
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
    return CombineLatestStream<dynamic, bool>([_gameService.gameStream, _actionService.isActionBeingProcessedStream, _roundService.getActivePlayerId()], (values) {
      Game game = values[0];
      bool isActionBeingProcessed = values[1];
      String activePlayerSocketId = values[2];

      return _roundService.isActivePlayer(activePlayerSocketId, game.players.getLocalPlayer().socketId) && !game.isOver && !isActionBeingProcessed;
    });
  }

  Stream<bool> _canExchangeStream() {
    return CombineLatestStream<dynamic, bool>([_canPlayStream(), _gameService.getTileRack().selectedTilesStream], (values) {
      bool canPlay = values[0];
      List<Tile> selectedTiles = values[1];

      return canPlay && selectedTiles.isNotEmpty;
    });
  }
}
