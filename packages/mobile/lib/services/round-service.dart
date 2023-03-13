import 'package:async/async.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/rounds/round.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/action-service.dart';
import 'package:rxdart/rxdart.dart';

import 'game.service.dart';

class RoundService {
  final ActionService _actionService = getIt.get<ActionService>();
  final Subject<Duration> _startRound$ = PublishSubject();
  final Subject _endRound$ = PublishSubject();
  BehaviorSubject<Round?> currentRound$ = BehaviorSubject.seeded(null);
  CancelableOperation? roundTimeout;

  RoundService._privateConstructor();

  Stream<Duration> get startRoundEvent => _startRound$.stream;
  Stream<void> get endRoundEvent => _endRound$.stream;
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

  void startRound(Round round) {
    if (roundTimeout != null) roundTimeout!.cancel();

    currentRound$.add(round);

    Duration roundDuration = getIt.get<GameService>().game.roundDuration;
    roundTimeout = CancelableOperation.fromFuture(
        Future.delayed(roundDuration, () => _onTimerExpires()));

    _startRound$.add(roundDuration);
  }

  void endRound() {
    _endRound$.add(null);
  }

  void _onTimerExpires() {
    if (currentRound.socketIdOfActivePlayer ==
        getIt.get<GameService>().game.players.getLocalPlayer().socketId) {
      endRound();
      _actionService.sendAction(ActionType.pass);
    }
  }

  void updateRoundData(Round round) {
    endRound();
    startRound(round);
  }
}
