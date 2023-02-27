import 'package:flutter/material.dart';
import 'package:mobile/components/game/game_info.dart';
import 'package:mobile/components/timer.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';

class GameTimer extends StatelessWidget {
  GameService _gameService = getIt.get<GameService>();

  @override
  Widget build(BuildContext context) {
    return GameInfo(
        value: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
          Timer(
            duration: _gameService.game?.timeLeft ?? Duration(),
            style:
                TextStyle(fontSize: 32, fontWeight: FontWeight.w600, height: 1),
          )
        ]),
        name: "Restant",
        icon: Icons.hourglass_bottom_rounded);
  }
}
