import 'package:mobile/classes/rounds/round.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/action-service.dart';
import 'package:rxdart/rxdart.dart';

import 'game-event.service.dart';

class RoundService {
  final Subject<Duration> _startRound$ = PublishSubject();
  final Subject _endRound$ = PublishSubject();
  final Subject _roundTimeout$ = PublishSubject();
  BehaviorSubject<Round?> currentRound$ = BehaviorSubject.seeded(null);

  RoundService._privateConstructor();

  Stream<Duration> get startRoundEvent => _startRound$.stream;
  Stream<void> get endRoundEvent => _endRound$.stream;
  Stream<void> get roundTimeoutStream => _roundTimeout$.stream;
  ValueStream<Round?> get currentRoundStream => currentRound$.stream;

  Round get currentRound {
    if (currentRound$.value == null) throw Exception('No current round');

    return currentRoundStream.value!;
  }

  static final RoundService _instance = RoundService._privateConstructor();

  factory RoundService() {
    return _instance;
  }

  Stream<String> getActivePlayerId() {
    return Stream.value(currentRound.socketIdOfActivePlayer);
  }

  bool isActivePlayer(String currentActivePlayerSocketId, String socketId) {
    return currentActivePlayerSocketId == socketId;
  }

  void startRound(Round round, Function timerExpiresCallback) {
    currentRound$.add(round);

    roundTimeoutStream.listen((event) {
      timerExpiresCallback();
    });

    _startRound$.add(round.duration);
  }

  void endRound() {
    _endRound$.add(null);
  }

  void roundTimeout() {
    _roundTimeout$.add(null);
  }

  void updateRoundData(Round round, Function timerExpiresCallback) {
    endRound();
    startRound(round, timerExpiresCallback);
  }
}
