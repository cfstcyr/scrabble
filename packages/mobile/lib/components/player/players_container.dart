import 'package:flutter/material.dart';
import 'package:mobile/components/player/main_player.dart';
import 'package:mobile/components/player/player.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/theme-color-service.dart';

class PlayersContainer extends StatelessWidget {
  ThemeColorService _themeColorService = getIt.get<ThemeColorService>();
  GameService _gameService = getIt.get<GameService>();

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
        child: Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(child: MainPlayer(player: _gameService.game!.players.player1)),
        Expanded(
          child: Column(
            children: [
              Player(player: _gameService.game!.players.player2),
              Player(
                player: _gameService.game!.players.player3,
                isPlaying: true,
              ),
              Player(player: _gameService.game!.players.player4),
            ],
          ),
        )
      ],
    ));
  }
}
