import 'package:mobile/classes/abstract-game.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/actions/word-placement.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-parser.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:rxdart/rxdart.dart';

class AnalysisPending {
  final int idGameHistory;
  final int idUser;

  AnalysisPending({required this.idGameHistory, required this.idUser});

  factory AnalysisPending.fromJson(Map<String, dynamic> json) {
    return AnalysisPending(
        idGameHistory: json['idGameHistory'], idUser: json['idUser']);
  }
}

class AnalysisWithId extends AnalysisPending {
  final int idAnalysis;

  AnalysisWithId(
      {required super.idGameHistory,
      required super.idUser,
      required this.idAnalysis});

  factory AnalysisWithId.fromJson(Map<String, dynamic> json) {
    AnalysisPending parent = AnalysisPending.fromJson(json);
    return AnalysisWithId(
        idGameHistory: parent.idGameHistory,
        idUser: parent.idUser,
        idAnalysis: json['idAnalysis']);
  }
}

class AnalysisCompleted extends AnalysisPending {
  final List<CriticalMoment> criticalMoments;

  AnalysisCompleted(
      {required super.idGameHistory,
      required super.idUser,
      required this.criticalMoments});

  factory AnalysisCompleted.fromJson(Map<String, dynamic> json) {
    AnalysisPending parent = AnalysisPending.fromJson(json);
    return AnalysisCompleted(
        idGameHistory: parent.idGameHistory,
        idUser: parent.idUser,
        criticalMoments: (json['criticalMoments'] as List<dynamic>)
            .map((dynamic criticalMoment) =>
                CriticalMoment.fromJson(criticalMoment))
            .toList());
  }
}

class CriticalMoment {
  final List<List<Square>> grid;
  final List<Tile> tiles;
  final ActionType actionType;
  final ScoredWordPlacement? playedPlacement;
  final ScoredWordPlacement bestPlacement;

  final BehaviorSubject<AbstractGame> _game$;

  CriticalMoment(
      {required this.grid,
      required this.tiles,
      required this.actionType,
      required this.playedPlacement,
      required this.bestPlacement}) : _game$ = BehaviorSubject.seeded((AbstractGame(
      board: Board().withGrid(grid), tileRack: TileRack().setTiles(tiles))));

  factory CriticalMoment.fromJson(Map<String, dynamic> json) {
    return CriticalMoment(
        grid: Board.gridFromJson(json['board']['grid']),
        tiles: TilesParser().parseTiles(json['tiles'] as List<dynamic>),
        actionType: ActionType.parse(json['actionType']),
        playedPlacement: json['playedPlacement'] != null
            ? ScoredWordPlacement.fromJson(json['playedPlacement'])
            : null,
        bestPlacement: ScoredWordPlacement.fromJson(json['bestPlacement']));
  }

  ValueStream<AbstractGame> get convertToGameStream => _game$.stream;

  void showPlacementOnBoard(ScoredWordPlacement placement) {
    Board updatedBoard = Board().withGrid(grid);
    List<Square> squaresToPlace = placement.toSquaresOnBoard(updatedBoard);

    updatedBoard.updateBoardData(squaresToPlace);

    AbstractGame updatedGame = AbstractGame(board: updatedBoard, tileRack: _game$.value.tileRack);

    _game$.add(updatedGame);
  }
}
