import 'package:async/async.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/stream/game-stream.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/player-leave-service.dart';
import 'package:rxdart/rxdart.dart';

class GameActions extends StatelessWidget {
  GameService _gameService = getIt.get<GameService>();
  ActionService _actionService = getIt.get<ActionService>();

  void surrender(BuildContext context) {
    getIt.get<PlayerLeaveService>().leaveGame(context);
  }

  bool canPlay(Game game) {
    return _gameService.isLocalPlayerActivePlayer() &&
        !game.isOver &&
        !_actionService.isActionBeingProcessed;
  }

  bool canExchange(Game game, TileRack tileRack) {
    return true;
    // print(tileRack.isExchangeModeEnabled.value);
    // return tileRack.isExchangeModeEnabled.value &&
    //     tileRack.selectedTiles.isNotEmpty &&
    //     _gameService.isLocalPlayerActivePlayer() &&
    //     game.tileReserve.length >= MAX_TILES_PER_PLAYER &&
    //     !_actionService.isActionBeingProcessed;
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Game?>(
      stream: _gameService.gameStream,
      builder: (context, gameSnapshot) {
        return Card(
          child: Container(
            height: 70,
            padding:
                EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
            child: gameSnapshot.data != null
                ? Row(
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
                      StreamBuilder<TileRack?>(
                        stream: _gameService.tileRackStream,
                        builder: (context, tileRackSnapshot) {
                          if (tileRackSnapshot.data == null) return Container();

                          return AppButton(
                            onPressed: canExchange(gameSnapshot.data!, tileRackSnapshot.data!)
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
                      AppButton(
                        onPressed: canPlay(gameSnapshot.data!)
                            ? () => _actionService.sendAction(ActionType.pass)
                            : null,
                        icon: Icons.not_interested_rounded,
                        size: AppButtonSize.large,
                      ), // Passer
                      StreamBuilder(
                        stream: gameSnapshot.data!.board.isValidPlacementStream,
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
                  )
                : Container(),
          ),
        );
      },
    );
  }
}
