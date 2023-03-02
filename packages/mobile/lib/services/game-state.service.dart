import 'dart:async';

import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:rxdart/rxdart.dart';

class GameStateService {
  final Map<String, BehaviorSubject> _states;

  static final GameStateService _instance = GameStateService._();

  factory GameStateService() {
    return _instance;
  }

  GameStateService._() : _states = {} {
    _states[NON_APPLIED_TILES_ON_BOARD_COUNT] = BehaviorSubject<int>.seeded(0);
  }

  T getValue<T>(String key) {
    return _getSubject<T>(key).value;
  }

  ValueStream<T> getStream<T>(String key) {
    return _getSubject<T>(key).stream;
  }

  StreamSubscription<T> listen<T>(
    String key,
    void Function(T)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    return _getSubject<T>(key).listen(onData,
        onError: onError, onDone: onDone, cancelOnError: cancelOnError);
  }

  void add<T>(String key, T value) {
    _getSubject<T>(key).add(value);
  }

  void update<T>(String key, T Function(T oldValue) callback) {
    _getSubject<T>(key).add(callback(getValue(key)));
  }

  BehaviorSubject<T> _getSubject<T>(String key) {
    var subject = _states[key];

    if (subject == null) {
      throw Exception(
          'Could not get game state: Game state "$key" does not exists');
    }

    return subject as BehaviorSubject<T>;
  }
}
