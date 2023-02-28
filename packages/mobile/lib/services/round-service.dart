import 'package:mobile/locator.dart';
import 'package:rxdart/rxdart.dart';
import 'package:async/async.dart';

import 'game.service.dart';

class RoundService {
  final Subject<Duration> _startRound$ = BehaviorSubject();
  final Subject _endRound$ = BehaviorSubject();
  CancelableOperation? roundTimeout;

  RoundService._privateConstructor();

  Stream<Duration> get startRoundEvent => _startRound$.stream;
  Stream<void> get endRoundEvent => _endRound$.stream;

  static final RoundService _instance = RoundService._privateConstructor();
  static final GameService gameService = getIt.get<GameService>();

  factory RoundService() {
    return _instance;
  }

  void startRound() {
    if (roundTimeout != null) roundTimeout!.cancel();

    Duration roundDuration = gameService.getGame().roundDuration;
    roundTimeout = CancelableOperation.fromFuture(Future.delayed(roundDuration, () => _onTimerExpires()));

    _startRound$.add(roundDuration);
  }

  void endRound() {
    _endRound$.add(null);
  }

  void _onTimerExpires() {
    // If local player is active player, send pass
  }
}
