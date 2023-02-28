import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';

class TileRack extends StatelessWidget {
  final GameService _gameService = getIt.get<GameService>();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        padding: EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
        height: 70,
        child: Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          alignment: WrapAlignment.spaceEvenly,
          spacing: SPACE_4,
          children: [
            AppButton(
              onPressed: () {},
              icon: Icons.repeat,
              iconOnly: true,
            ),
            Wrap(
              spacing: SPACE_2,
              children: List.generate(
                  _gameService.game?.tileRack.tiles.length ?? 0,
                  (index) => Tile(
                      tile: _gameService.game!.tileRack.tiles[index],
                      size: 42)),
            ),
            AppButton(
              onPressed: null,
              icon: Icons.close,
              size: AppButtonSize.large,
            ),
          ],
        ),
      ),
    );
  }
}
