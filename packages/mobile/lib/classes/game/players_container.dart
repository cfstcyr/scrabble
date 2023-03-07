import 'package:mobile/classes/game/player.dart';
import 'package:mobile/constants/game.constants.dart';

import '../../constants/erros/game-errors.dart';

class PlayersContainer {
  Player player1;
  Player player2;
  Player player3;
  Player player4;
  String? localPlayerId;

  PlayersContainer.fromPlayers(
      {required this.player1,
      required this.player2,
      required this.player3,
      required this.player4});

  PlayersContainer.fromList(List<Player> players)
      : this.fromPlayers(
            player1: players[0],
            player2: players[1],
            player3: players[2],
            player4: players[3]);

  Player getPlayer(int index) {
    switch (index) {
      case 1:
        return player1;
      case 2:
        return player2;
      case 3:
        return player3;
      case 4:
        return player4;
    }

    throw Exception(INVALID_PLAYER_INDEX);
  }

  List<Player> get players => [player1, player2, player3, player4];

  Player getLocalPlayer() {
    if (localPlayerId == null) throw Exception(NO_LOCAL_PLAYER_DEFINED);
    return players.firstWhere((Player player) => player.socketId == localPlayerId);
  }
}
