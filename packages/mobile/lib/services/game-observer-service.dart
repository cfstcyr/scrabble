import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/tile/tile.dart';
import '../locator.dart';
import 'game.service.dart';

class GameObserverService {
  GameObserverService._() : _tileRack = TileRack() {}
  final TileRack _tileRack;

  static final GameObserverService _instance = GameObserverService._();

  factory GameObserverService() {
    return _instance;
  }

  ValueStream<List<Tile>> get tilesStream => _tileRack.stream;

  TileRack getPlayerTileRack(int playerNumber) {
    return getIt.get<GameService>().getPlayerTileRack(playerNumber);
  }
}
