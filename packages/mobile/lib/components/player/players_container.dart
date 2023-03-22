import 'package:flutter/material.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/game/player.dart' as c;
import 'package:mobile/classes/game/players_container.dart' as p;
import 'package:mobile/components/player/main_player.dart';
import 'package:mobile/components/player/player.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:rxdart/rxdart.dart';

import '../../services/game-observer-service.dart';
import '../../services/user.service.dart';

class PlayersContainer extends StatelessWidget {
  GameService _gameService = getIt.get<GameService>();
  RoundService _roundService = getIt.get<RoundService>();
  GameObserverService _gameObserverService = getIt.get<GameObserverService>();

  List<c.Player> generateOrderedPlayerList(
      p.PlayersContainer playersContainer) {
    List<c.Player> playerList = List.of([playersContainer.getLocalPlayer()]);

    c.Player lastPlayerPushed = playerList.last;
    do {
      playerList.add(playersContainer.getNextPlayerInList(playerList.last));
      lastPlayerPushed = playerList.last;
    } while (lastPlayerPushed != playersContainer.getLocalPlayer());

    return playerList;
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: CombineLatestStream.list<dynamic>(
          [_gameService.gameStream, _roundService.getActivePlayerId()]),
      builder: (context, snapshot) {
        if (snapshot.data == null) return Container();

        Game game = snapshot.data![0];
        String activePlayerId = snapshot.data![1];

        List<c.Player> orderedPlayerList =
            generateOrderedPlayerList(game.players);

        return handlePlayersContainer(getIt.get<UserService>().isObserver,
            orderedPlayerList, activePlayerId);
      },
    );
  }

  Widget handlePlayersContainer(bool isObserver,
      List<c.Player> orderedPlayerList, String activePlayerId) {
    if (isObserver) {
      return StreamBuilder(
          stream: _gameObserverService.observedPlayerIndexStream,
          builder: (context, snapshot) {
            int observedIndex = snapshot.data ?? 0;
            return IntrinsicHeight(
                child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: () {
                          _gameObserverService.setPlayerTileRack(1);
                        },
                        child: Player(
                          player: orderedPlayerList[0],
                          isPlaying: _roundService.isActivePlayer(
                              activePlayerId, orderedPlayerList[0].socketId),
                          isObserved: observedIndex == 1,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          _gameObserverService.setPlayerTileRack(2);
                        },
                        child: Player(
                          player: orderedPlayerList[1],
                          isPlaying: _roundService.isActivePlayer(
                              activePlayerId, orderedPlayerList[1].socketId),
                          isObserved: observedIndex == 2,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: () {
                          _gameObserverService.setPlayerTileRack(3);
                        },
                        child: Player(
                          player: orderedPlayerList[2],
                          isPlaying: _roundService.isActivePlayer(
                              activePlayerId, orderedPlayerList[2].socketId),
                          isObserved: observedIndex == 3,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          _gameObserverService.setPlayerTileRack(4);
                        },
                        child: Player(
                          player: orderedPlayerList[3],
                          isPlaying: _roundService.isActivePlayer(
                              activePlayerId, orderedPlayerList[3].socketId),
                          isObserved: observedIndex == 4,
                        ),
                      ),
                    ],
                  ),
                )
              ],
            ));
          });
    }
    return IntrinsicHeight(
        child: Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
            child: MainPlayer(
                player: orderedPlayerList[0],
                isPlaying: _roundService.isActivePlayer(
                    activePlayerId, orderedPlayerList[0].socketId))),
        Expanded(
          child: Column(
            children: [
              Player(
                  player: orderedPlayerList[1],
                  isPlaying: _roundService.isActivePlayer(
                      activePlayerId, orderedPlayerList[1].socketId)),
              Player(
                player: orderedPlayerList[2],
                isPlaying: _roundService.isActivePlayer(
                    activePlayerId, orderedPlayerList[2].socketId),
              ),
              Player(
                player: orderedPlayerList[3],
                isPlaying: _roundService.isActivePlayer(
                    activePlayerId, orderedPlayerList[3].socketId),
              ),
            ],
          ),
        )
      ],
    ));
  }
}
