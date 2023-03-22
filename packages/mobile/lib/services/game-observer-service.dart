import 'package:rxdart/rxdart.dart';

import '../classes/game/players_container.dart';
import '../classes/tile/tile.dart';

class GameObserverService {
  late BehaviorSubject<List<Tile>> _tiles =
      BehaviorSubject<List<Tile>>.seeded([]);
  late BehaviorSubject<int> _observedPlayerIndex =
      BehaviorSubject<int>.seeded(1);
  late BehaviorSubject<PlayersContainer> playersContainer =
      BehaviorSubject<PlayersContainer>();

  GameObserverService._()
      : _tiles = BehaviorSubject<List<Tile>>.seeded([]),
        _observedPlayerIndex = BehaviorSubject<int>.seeded(1) {
    setPlayerTileRack(_observedPlayerIndex.value);
    playersContainer.stream.listen((_) {
      setPlayerTileRack(_observedPlayerIndex.value);
    });
  }

  static final GameObserverService _instance = GameObserverService._();

  factory GameObserverService() {
    return _instance;
  }

  ValueStream<List<Tile>> get tilesStream => _tiles.stream;
  ValueStream<int> get observedPlayerIndexStream => _observedPlayerIndex.stream;

  void setPlayerTileRack(int playerNumber) {
    if (!playersContainer.hasValue) return;
    _tiles.add([...playersContainer.value.getPlayer(playerNumber).tiles]);
    _observedPlayerIndex.add(playerNumber);
  }
}
