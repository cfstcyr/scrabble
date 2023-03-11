import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:rxdart/rxdart.dart';

class TileRack {
  final GameEventService _gameEventService = getIt.get<GameEventService>();
  final BehaviorSubject<List<RackTile>> _tiles;
  final BehaviorSubject<bool> _isExchangeModeEnabled$;

  TileRack({List<RackTile> tiles = const []})
      : _tiles = BehaviorSubject.seeded(tiles),
        _isExchangeModeEnabled$ = BehaviorSubject.seeded(false) {
    _gameEventService.listen<TilePlacement>(PLACE_TILE_ON_BOARD, (placement) {
      removeTile(RackTile.fromTile(placement.tile));
    });
  }

  ValueStream<List<RackTile>> get stream {
    return _tiles.stream;
  }

  ValueStream<bool> get isExchangeModeEnabled {
    return _isExchangeModeEnabled$.stream;
  }

  Stream<List<RackTile>> get selectedTiles {
    return stream.map((List<RackTile> tileRack) => tileRack.where((RackTile tile) => tile.isSelected).toList());
  }

  TileRack setTiles(List<RackTile> tiles) {
    _tiles.add(tiles);
    return this;
  }

  TileRack addTiles(List<RackTile> tiles) {
    _tiles.add([..._tiles.value, ...tiles]);
    return this;
  }

  TileRack removeTile(RackTile tile) {
    List<RackTile> tiles = _tiles.value;

    tiles.remove(tile);
    _tiles.add([...tiles]);
    return this;
  }

  placeTile(RackTile tile, {int? to}) {
    List<RackTile> tiles = _tiles.value;

    if (to != null) {
      int from = tiles.indexOf(tile);

      if (from < 0) {
        // Add to tile rack
        tiles.insert(to + 1, tile);
      } else {
        // Move from within tile rack
        if (from > to) to = to + 1;

        if (from < to) {
          tiles.setRange(from, to, tiles, from + 1);
        } else {
          tiles.setRange(to + 1, from + 1, tiles, to);
        }
        tiles[to] = tile;
      }
    } else {
      tiles.remove(tile);
      tiles.add(tile);
    }

    setTiles(tiles);
  }

  shuffle() {
    var tiles = _tiles.value;
    tiles.shuffle();
    _tiles.add(tiles);
  }

  void toggleExchangeMode() {
    bool currentMode = isExchangeModeEnabled.value;
    _isExchangeModeEnabled$.add(!currentMode);
  }
}
