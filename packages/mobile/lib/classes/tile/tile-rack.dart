import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game-state.service.dart';
import 'package:rxdart/rxdart.dart';

class TileRack {
  final GameEventService _gameEventService = getIt.get<GameEventService>();
  final BehaviorSubject<List<Tile>> _tiles;

  TileRack({List<Tile> tiles = const []})
      : _tiles = BehaviorSubject.seeded(tiles) {
    _gameEventService.listen<Tile>(PLACE_TILE_ON_BOARD, (tile) {
      removeTile(tile);
    });
  }

  ValueStream<List<Tile>> get stream {
    return _tiles.stream;
  }

  setTiles(List<Tile> tiles) {
    _tiles.add(tiles);
  }

  addTiles(List<Tile> tiles) {
    _tiles.add([..._tiles.value, ...tiles]);
  }

  removeTile(Tile tile) {
    List<Tile> tiles = _tiles.value;

    tiles.remove(tile);
    _tiles.add([...tiles]);
  }

  placeTile(Tile tile, {int? to}) {
    List<Tile> tiles = _tiles.value;

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
}
