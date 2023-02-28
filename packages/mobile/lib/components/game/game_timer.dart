import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/components/game/game_info.dart';
import 'package:mobile/components/timer.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/round-service.dart';

class GameTimer extends StatefulWidget {
  Timer? timer;
  int timeLeft = 0;
  bool isStopped = false;

  @override
  State<GameTimer> createState() => _GameTimerState();
}

class _GameTimerState extends State<GameTimer> {
  RoundService roundService = getIt.get<RoundService>();

  @override
  void initState() {
    listenToRoundStartEvent();

    super.initState();
  }

  void listenToRoundStartEvent() {
    roundService.startRound$.listen((Duration roundDuration) {
      widget.timeLeft = roundDuration.inSeconds;
    });
  }

  void startTimer() {
    widget.isStopped = false;
    const oneSec = Duration(seconds: 1);
    widget.timer = Timer.periodic(
      oneSec,
          (Timer timer) {
        if (widget.timeLeft == 0) {
          setState(() {
            timerExpired();
          });
        } else {
          setState(() {
            widget.timeLeft--;
          });
        }
      },
    );
  }

  void timerExpired() {
    widget.timer!.cancel();
    widget.timeLeft = 0;
    widget.isStopped = true;
  }

  Duration timeLeftToDuration() {
    return Duration(seconds: widget.timeLeft);
  }

  @override
  Widget build(BuildContext context) {
    return GameInfo(
        value: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
          TimerWidget(
            duration: timeLeftToDuration(),
            style:
                TextStyle(fontSize: 32, fontWeight: FontWeight.w600, height: 1),
            stopped: widget.isStopped,
          )
        ]),
        name: "Restant",
        icon: Icons.hourglass_bottom_rounded);
  }
}
