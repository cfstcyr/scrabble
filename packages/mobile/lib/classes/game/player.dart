import 'package:mobile/classes/player/player-data.dart';
import 'package:mobile/classes/user.dart';

import '../tile/tile.dart';

class Player {
  String socketId;
  PublicUser user;
  int score;
  bool isLocalPlayer;
  List<Tile> tiles;

  Player({
    required this.socketId,
    required this.user,
    required this.score,
    this.isLocalPlayer = false,
    required this.tiles,
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      socketId: json['id'],
      user: PublicUser.fromJson(json['publicUser']),
      score: json['score'] ?? 0,
      tiles:
          json['tiles'] != null && (json['tiles'] as List<dynamic>).isNotEmpty
              ? (json['tiles'] as List<Map<String, dynamic>>)
                  .map((Map<String, dynamic> tile) => Tile.fromJson(tile))
                  .toList()
              : List<Tile>.empty(),
    );
  }

  Player updatePlayerData(PlayerData playerData) {
    return Player(
        socketId: playerData.id,
        user: playerData.publicUser!,
        score: playerData.score ?? 0,
        tiles: playerData.tiles!);
  }

  Map<String, dynamic> toJson() => {
        'id': socketId,
        'publicUser': user,
        'score': score,
      };
}
