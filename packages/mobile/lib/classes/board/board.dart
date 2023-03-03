import 'package:mobile/classes/board/navigator.dart';
import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/multiplier.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/classes/vector.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:rxdart/rxdart.dart';

class Board {
  final GameEventService _gameEventService = getIt.get<GameEventService>();
  late List<List<Square>> grid;
  BehaviorSubject<Placement> _currentPlacement$;
  BehaviorSubject<bool> _isValidPlacement$;

  Board()
      : _currentPlacement$ = BehaviorSubject.seeded(Placement()),
        _isValidPlacement$ = BehaviorSubject.seeded(false) {
    grid = List.generate(
        GRID_SIZE,
        (y) =>
            List.generate(GRID_SIZE, (x) => Square(position: Position(x, y))));
    _applyMultipliers();

    _gameEventService.listen<TilePlacement>(PLACE_TILE_ON_BOARD,
        (tilePlacement) {
      var placement = _currentPlacement$.value;
      placement.add(tilePlacement);

      _currentPlacement$.add(placement.clone());
      _isValidPlacement$.add(placement.validatePlacement(this));
    });

    _gameEventService.listen<TilePlacement>(REMOVE_TILE_FROM_BOARD,
        (tilePlacement) {
      var placement = _currentPlacement$.value;

      placement.remove(tilePlacement);

      _currentPlacement$.add(placement.clone());
      _isValidPlacement$.add(placement.validatePlacement(this));
    });
  }

  Square getSquare(Vec2 v) {
    return grid[v.row][v.column];
  }

  Navigator navigate(Position position,
      {Orientation orientation = Orientation.horizontal}) {
    return Navigator(board: this, orientation: orientation, position: position);
  }

  Stream<bool> get hasPlacementStream {
    return _currentPlacement$.map((placement) => placement.tiles.isNotEmpty);
  }

  ValueStream<bool> get isValidPlacementStream {
    return _isValidPlacement$.stream;
  }

  Placement get currentPlacement {
    return _currentPlacement$.value;
  }

  bool get isValidPlacement {
    return _isValidPlacement$.value;
  }

  _applyMultipliers() {
    // Center
    grid[7][7].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[7][7].isCenter = true;

    // Letter x2
    grid[6][6].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[6][8].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[8][6].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[8][8].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[7][3].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[3][7].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[7][11].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[11][7].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[6][2].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[8][2].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[2][6].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[2][8].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[6][12].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[8][12].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[12][6].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[12][8].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[0][3].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[3][0].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[0][11].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[11][0].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[14][3].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[3][14].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[14][11].multiplier = Multiplier(value: 2, type: MultiplierType.letter);
    grid[11][14].multiplier = Multiplier(value: 2, type: MultiplierType.letter);

    // Word x2
    grid[1][1].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[2][2].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[3][3].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[4][4].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[13][1].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[12][2].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[11][3].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[10][4].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[1][13].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[2][12].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[3][11].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[4][10].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[13][13].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[12][12].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[11][11].multiplier = Multiplier(value: 2, type: MultiplierType.word);
    grid[10][10].multiplier = Multiplier(value: 2, type: MultiplierType.word);

    // Letter x3
    grid[1][5].multiplier = Multiplier(value: 3, type: MultiplierType.letter);
    grid[5][1].multiplier = Multiplier(value: 3, type: MultiplierType.letter);
    grid[1][9].multiplier = Multiplier(value: 3, type: MultiplierType.letter);
    grid[9][1].multiplier = Multiplier(value: 3, type: MultiplierType.letter);
    grid[13][5].multiplier = Multiplier(value: 3, type: MultiplierType.letter);
    grid[5][13].multiplier = Multiplier(value: 3, type: MultiplierType.letter);
    grid[13][9].multiplier = Multiplier(value: 3, type: MultiplierType.letter);
    grid[9][13].multiplier = Multiplier(value: 3, type: MultiplierType.letter);
    grid[5][5].multiplier = Multiplier(value: 3, type: MultiplierType.letter);
    grid[5][9].multiplier = Multiplier(value: 3, type: MultiplierType.letter);
    grid[9][5].multiplier = Multiplier(value: 3, type: MultiplierType.letter);
    grid[9][9].multiplier = Multiplier(value: 3, type: MultiplierType.letter);

    // Word x3
    grid[0][0].multiplier = Multiplier(value: 3, type: MultiplierType.word);
    grid[0][14].multiplier = Multiplier(value: 3, type: MultiplierType.word);
    grid[14][0].multiplier = Multiplier(value: 3, type: MultiplierType.word);
    grid[14][14].multiplier = Multiplier(value: 3, type: MultiplierType.word);
    grid[7][0].multiplier = Multiplier(value: 3, type: MultiplierType.word);
    grid[0][7].multiplier = Multiplier(value: 3, type: MultiplierType.word);
    grid[7][14].multiplier = Multiplier(value: 3, type: MultiplierType.word);
    grid[14][7].multiplier = Multiplier(value: 3, type: MultiplierType.word);
  }
}
