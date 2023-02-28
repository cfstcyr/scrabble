import 'package:mobile/classes/tile/tile.dart';
import 'package:rxdart/rxdart.dart';

class TileRack {
  final BehaviorSubject<List<Tile>> _tiles;

  TileRack({List<Tile> tiles = const []})
      : _tiles = BehaviorSubject.seeded(tiles);

  ValueStream<List<Tile>> get stream {
    return _tiles.stream;
  }

  setTiles(List<Tile> tiles) {
    _tiles.add(tiles);
  }

  addTiles(List<Tile> tiles) {
    _tiles.add([..._tiles.value, ...tiles]);
  }

  moveTile(Tile tile, int to) {
    List<Tile> tiles = _tiles.value;
    int from = tiles.indexOf(tile);

    if (from < 0) throw Exception("Cannot move tile: Tile is not in list");

    if (from > to) to = to + 1;

    if (from < to) {
      tiles.setRange(from, to, tiles, from + 1);
    } else {
      tiles.setRange(to + 1, from + 1, tiles, to);
    }
    tiles[to] = tile;

    setTiles(tiles);
  }
}
