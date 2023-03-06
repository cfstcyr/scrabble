import 'package:mobile/classes/game/player.dart';

import '../../components/tile/tile.dart';
import '../rounds/round.dart';

class StartGameData {
  final Player player1;
  final Player player2;
  final Player player3;
  final Player player4;
  final int maxRoundTime;
  final String gameId;
  final List<Tile> localPlayerTiles;
  final Round firstRound;

  StartGameData({
    required this.player1,
    required this.player2,
    required this.player3,
    required this.player4,
    required this.maxRoundTime,
    required this.gameId,
    required this.localPlayerTiles,
    required this.firstRound,
  });

  factory StartGameData.fromJson(Map<String, dynamic> json) {
    return StartGameData(player1: Player.fromJson(json['player1']), player2: Player.fromJson(json['player2']), player3: Player.fromJson(json['player3']), player4: Player.fromJson(json['player4']), maxRoundTime: json['maxRoundTime'], gameId: gameId, localPlayerTiles: localPlayerTiles, firstRound: firstRound)
  }
}
