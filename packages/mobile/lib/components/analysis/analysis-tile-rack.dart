import 'package:flutter/material.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/components/game/game_square.dart';
import 'package:mobile/components/tile/tile-rack/abstract-tile-rack.dart';
import 'package:mobile/components/tile/tile-rack/clear-placed-tiles.dart';
import 'package:mobile/components/tile/tile-rack/toggle-exchange-mode.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';

class AnalysisTileRack extends AbstractTileRack {
  AnalysisTileRack({required super.gameStream, required this.usedTiles, super.tileSize});

  final List<Tile> usedTiles;

  @override
  List<Widget> startOfTileRackButtons({required TileRack tileRack}) {
    return List.empty();
  }

  @override
  List<Widget> endOfTileRackButtons(TileRack tileRack, Board board) {
    return List.empty();
  }

  @override
  Widget buildTile(Tile tile, int index) {
    return super.buildWrappedTile(tile, index, false);
  }
}
