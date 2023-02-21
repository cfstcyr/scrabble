import 'package:flutter/material.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';

class TileRack extends StatelessWidget {
  GameService _gameService = getIt.get<GameService>();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        padding: EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
        child: Wrap(
          spacing: SPACE_2,
          children: List.generate(_gameService.game?.tileRack.tiles.length ?? 0, (index) => Tile(tile: _gameService.game!.tileRack.tiles[index], size: 42)),
        ),
      ),
    );
  }
}
