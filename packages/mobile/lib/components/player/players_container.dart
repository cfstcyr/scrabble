import 'package:flutter/material.dart';
import 'package:mobile/components/player/player.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/theme-color-service.dart';

class PlayersContainer extends StatelessWidget {
  ThemeColorService _themeColorService = getIt.get<ThemeColorService>();
  GameService _gameService = getIt.get<GameService>();

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        Row(
          children: [
            Expanded(
                child: Column(children: [
              Player(
                  player: _gameService.game!.players.player1, isPlaying: true),
              Player(player: _gameService.game!.players.player3)
            ])),
            Expanded(
                child: Column(children: [
              Player(
                  player: _gameService.game!.players.player2,
                  invertedLayout: true),
              Player(
                player: _gameService.game!.players.player4,
                invertedLayout: true,
              )
            ])),
          ],
        ),
        Card(
          color: _themeColorService.themeColor,
          elevation: 3,
          child: Container(
            height: 28,
            width: 28,
            alignment: Alignment.center,
            child: Text(
              "vs",
              style: TextStyle(
                  color: Colors.white, height: 1, fontWeight: FontWeight.w700),
            ),
          ),
        )
      ],
    );
  }
}
