import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-observer-service.dart';

class GameObserverActions extends StatelessWidget {
  final GameObserverService _gameObserverService =
      getIt.get<GameObserverService>();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
          height: 70,
          padding: EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              AppButton(
                onPressed: () {
                  _gameObserverService.getPlayerTileRack(1);
                },
                icon: Icons.lightbulb,
                size: AppButtonSize.large,
              ),
              AppButton(
                onPressed: () {
                  _gameObserverService.getPlayerTileRack(2);
                },
                icon: Icons.lightbulb,
                size: AppButtonSize.large,
              ),
              AppButton(
                onPressed: () {
                  _gameObserverService.getPlayerTileRack(3);
                },
                icon: Icons.lightbulb,
                size: AppButtonSize.large,
              ),
              AppButton(
                onPressed: () {
                  _gameObserverService.getPlayerTileRack(4);
                },
                icon: Icons.lightbulb,
                size: AppButtonSize.large,
              ),
            ],
          )),
    );
  }
}
