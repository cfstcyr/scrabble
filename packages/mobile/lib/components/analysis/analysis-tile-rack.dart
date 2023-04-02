import 'package:flutter/material.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/components/tile/tile-rack/abstract-tile-rack.dart';
import 'package:mobile/components/tile/tile.dart' as w;


class AnalysisTileRack extends AbstractTileRack {
  AnalysisTileRack({required super.gameStream, required this.tileViews});

  final List<w.Tile> tileViews;

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
    return tileViews[index];
  }
}
