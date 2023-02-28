import 'package:mobile/locator.dart';
import 'package:rxdart/rxdart.dart';

import 'game.service.dart';

class RoundService {
  final Subject<Duration> startRound$ = BehaviorSubject();

  RoundService._privateConstructor();

  static final RoundService _instance = RoundService._privateConstructor();
  static final GameService gameService = getIt.get<GameService>();

  factory RoundService() {
    return _instance;
  }

  void startRound() {
    Duration roundDuration = gameService.getGame().roundDuration;

    Future.delayed(roundDuration, () => onTimerExpires());
    startRound$.add(roundDuration);
  }

  void onTimerExpires() {
    // If local player is active player, send pass
  }
}
