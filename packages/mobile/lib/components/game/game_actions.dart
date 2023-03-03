import 'package:flutter/material.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/player-leave-service.dart';

import '../../locator.dart';

class GameActions extends StatelessWidget {
  GameService _gameService = getIt.get<GameService>();

  void surrender(BuildContext context) {
    getIt.get<PlayerLeaveService>().leaveGame(context);
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Game?>(
      stream: _gameService.gameStream,
      builder: (context, game) {
        return Card(
          child: Container(
            height: 70,
            padding:
                EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
            child: game.data != null
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
                      AppButton(
                        onPressed: () {},
                        icon: Icons.swap_horiz_rounded,
                        size: AppButtonSize.large,
                      ),
                      AppButton(
                        onPressed: () {},
                        icon: Icons.not_interested_rounded,
                        size: AppButtonSize.large,
                      ),
                      StreamBuilder(
                        stream: game.data!.board.isValidPlacementStream,
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
