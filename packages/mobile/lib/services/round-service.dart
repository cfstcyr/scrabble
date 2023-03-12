import 'package:async/async.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/rounds/round-data.dart';
import 'package:mobile/classes/rounds/round.dart';
import 'package:mobile/locator.dart';
import 'package:rxdart/rxdart.dart';

import '../constants/erros/game-errors.dart';
import 'game.service.dart';

class RoundService {
  final Subject<Duration> _startRound$ = BehaviorSubject();
  final Subject _endRound$ = BehaviorSubject();
  Round? currentRound;
  CancelableOperation? roundTimeout;

  RoundService._privateConstructor();

  Stream<Duration> get startRoundEvent => _startRound$.stream;
  Stream<void> get endRoundEvent => _endRound$.stream;

  static final RoundService _instance = RoundService._privateConstructor();

  factory RoundService() {
    return _instance;
  }

  String getActivePlayerId() {
    if (currentRound == null) throw Exception(NO_ROUND_AT_THE_MOMENT);
    return currentRound!.socketIdOfActivePlayer;
  }

  void startRound(Round round) {
    if (roundTimeout != null) roundTimeout!.cancel();

    currentRound = round;

    Duration roundDuration = getIt.get<GameService>().game.roundDuration;
    roundTimeout = CancelableOperation.fromFuture(
        Future.delayed(roundDuration, () => _onTimerExpires()));

    _startRound$.add(roundDuration);
  }

  void endRound() {
    _endRound$.add(null);
  }

  void _onTimerExpires() {
    if (getIt.get<GameService>().isLocalPlayerActivePlayer()) {
      // TODO: Send pass action when pass is implemented
    }
  }

  void updateRoundData(Round round) {
    endRound();
    startRound(round);
  }
}
