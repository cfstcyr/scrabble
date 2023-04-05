import 'package:flutter/material.dart';
import 'package:mobile/classes/abstract-game.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/actions/word-placement.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile-state.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/components/analysis/analysis-tile-rack.dart';
import 'package:mobile/components/game/game_board.dart';
import 'package:mobile/components/game/game_square.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:rxdart/streams.dart';
import 'package:rxdart/subjects.dart';
import 'package:mobile/components/tile/tile.dart' as w;

class PlacementView {
  GameBoard? gameBoard;
  AnalysisTileRack? tileRack;

  final List<w.Tile> tileViews;
  final ScoredWordPlacement? placement;

  BehaviorSubject<AbstractGame>? _gameForPlacement$;

  ValueStream<AbstractGame> get gameStream => _gameForPlacement$!.stream;

  PlacementView({required this.tileViews, this.placement});

  factory PlacementView.fromCriticalMoment(
      CriticalMoment criticalMoment, ScoredWordPlacement? scoredWordPlacement) {
    List<w.Tile> tileRackView =
        _transformToTileRackView(criticalMoment.tiles, scoredWordPlacement);

    PlacementView placement =
        PlacementView(tileViews: tileRackView, placement: scoredWordPlacement);

    if (scoredWordPlacement == null) return placement;

    Board board = Board().withGrid(copyGrid(criticalMoment.grid));
    List<Square> squaresToPlace = scoredWordPlacement.toSquaresOnBoard(board);
    board.updateBoardData(squaresToPlace);

    placement._gameForPlacement$ = BehaviorSubject.seeded(AbstractGame(
        board: board,
        tileRack: TileRack()
            .setTiles(tileRackView.map((w.Tile t) => t.tile!).toList())));

    return placement;
  }

  GameBoard generateGameBoard() {
    return gameBoard ?? GameBoard(gameStream: gameStream);
  }

  AnalysisTileRack generateTileRack() {
    return tileRack ??
        AnalysisTileRack(gameStream: gameStream, tileViews: tileViews);
  }

  static List<w.Tile> _transformToTileRackView(
      List<Tile> tileRack, ScoredWordPlacement? placement) {
    List<w.Tile> tileViews = tileRack
        .map((Tile tile) => w.Tile(
              tile: tile.copy(),
              size: TILE_SIZE - 10,
              shouldWiggle: false,
            ))
        .toList();

    if (placement == null) return tileViews;

    List<Tile> usedTiles = [...placement.actionPlacePayload.tiles];
    for (w.Tile tileView in tileViews) {
      int index = usedTiles
          .indexWhere((Tile tile) => tile.letter == tileView.tile?.letter);
      tileView.tile!.withState(index >= 0 ? TileState.notApplied : TileState.defaultState);
      if (index >= 0) usedTiles.removeAt(index);
    }

    return tileViews;
  }

  static List<List<Square>> copyGrid(List<List<Square>> grid) {
    return grid
        .map((List<Square> rows) =>
            rows.map((Square square) => square.copy()).toList())
        .toList();
  }
}

class CriticalMomentView {
  final ActionType actionType;
  final PlacementView bestPlacement;
  final PlacementView playedPlacement;

  CriticalMomentView(
      {required this.actionType,
      required this.bestPlacement,
      required this.playedPlacement});

  factory CriticalMomentView.fromCriticalMoment(CriticalMoment criticalMoment) {
    return CriticalMomentView(
        actionType: criticalMoment.actionType,
        bestPlacement: PlacementView.fromCriticalMoment(
            criticalMoment, criticalMoment.bestPlacement),
        playedPlacement: PlacementView.fromCriticalMoment(
            criticalMoment, criticalMoment.playedPlacement));
  }
}
