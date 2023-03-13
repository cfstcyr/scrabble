import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/components/game/game_info.dart';
import 'package:mobile/components/timer.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/utils/round-utils.dart';
import 'package:rxdart/rxdart.dart';

class GameTimer extends StatefulWidget {
  @override
  State<GameTimer> createState() => _GameTimerState();
}

class _GameTimerState extends State<GameTimer> {
  final RoundService _roundService = getIt.get<RoundService>();

  Timer? _timer;
  BehaviorSubject<int> _timeLeft = BehaviorSubject.seeded(60);
  bool _isStopped = false;

  late StreamSubscription startRoundSubscription;

  @override
  void initState() {
    startRoundSubscription =
        _roundService.startRoundEvent.listen((Duration duration) {
      _startTimer(duration);
    });

    if (_timer == null) {
      _startTimer(getIt.get<GameService>().game.roundDuration);
    }

    super.initState();
  }

  @override
  void dispose() {
    _timer?.cancel();
    startRoundSubscription.cancel();
    super.dispose();
  }

  void _startTimer(Duration duration) {
    _timer?.cancel();

    _timeLeft.add(duration.inSeconds);
    const oneSec = Duration(seconds: 1);
    _timer = Timer.periodic(
      oneSec,
      (Timer timer) {
        if (_timeLeft.value == 0) {
          timer.cancel();
          _isStopped = true;
        } else {
          _timeLeft.add(--_timeLeft.value);
        }
      },
    );
    _isStopped = false;
  }

  @override
  Widget build(BuildContext context) {
    return GameInfo(
        value: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
          StreamBuilder<int>(
              stream: _timeLeft,
              builder: (context, snapshot) {
                return TimerWidget(
                  duration: roundTimeToRoundDuration(
                      snapshot.hasData ? snapshot.data! : 0),
                  style: TextStyle(
                      fontSize: 32, fontWeight: FontWeight.w600, height: 1),
                  stopped: _isStopped,
                );
              }),
        ]),
        name: "Restant",
        icon: Icons.hourglass_bottom_rounded);
  }
}
