import 'package:flutter/material.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/components/player/main_player.dart';
import 'package:mobile/components/player/player.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/classes/game/player.dart' as c;
import 'package:mobile/classes/game/players_container.dart' as p;

class PlayersContainer extends StatelessWidget {
  ThemeColorService _themeColorService = getIt.get<ThemeColorService>();
  GameService _gameService = getIt.get<GameService>();

  List<c.Player> generateOrderedPlayerList(
      p.PlayersContainer playersContainer) {
    List<c.Player> playerList = List.of([playersContainer.getLocalPlayer()]);

    c.Player lastPlayerPushed = playerList[0];
    while (lastPlayerPushed != playersContainer.getLocalPlayer()) {
      playerList.add(playersContainer.getNextPlayerInList(playerList.last));
    }
    return playerList;
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Game?>(
      stream: _gameService.gameStream,
      builder: (context, snapshot) {
        if (snapshot.data == null) return Container();

        List<c.Player> orderedPlayerList =
            generateOrderedPlayerList(snapshot.data!.players);

        return IntrinsicHeight(
            child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
                child: MainPlayer(
                    player: orderedPlayerList[0],
                    isPlaying: _gameService
                        .isActivePlayer(orderedPlayerList[0].socketId))),
            Expanded(
              child: Column(
                children: [
                  Player(
                      player: orderedPlayerList[1],
                      isPlaying: _gameService
                          .isActivePlayer(orderedPlayerList[1].socketId)),
                  Player(
                    player: orderedPlayerList[2],
                    isPlaying: _gameService
                        .isActivePlayer(orderedPlayerList[2].socketId),
                  ),
                  Player(
                      player: orderedPlayerList[3],
                      isPlaying: _gameService
                          .isActivePlayer(orderedPlayerList[3].socketId)),
                ],
              ),
            )
          ],
        ));
      },
    );
  }
}
