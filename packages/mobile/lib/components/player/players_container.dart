import 'package:flutter/material.dart';
import 'package:mobile/classes/game/game.dart';
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
    return StreamBuilder<Game?>(
      stream: _gameService.gameStream,
      builder: (context, snapshot) {
        return snapshot.data != null
            ? IntrinsicHeight(
                child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                      child:
                          MainPlayer(player: snapshot.data!.players.player1)),
                  Expanded(
                    child: Column(
                      children: [
                        Player(player: snapshot.data!.players.player2),
                        Player(
                          player: snapshot.data!.players.player3,
                          isPlaying: true,
                        ),
                        Player(player: snapshot.data!.players.player4),
                      ],
                    ),
                  )
                ],
              ))
            : Container();
      },
    );
  }
}
