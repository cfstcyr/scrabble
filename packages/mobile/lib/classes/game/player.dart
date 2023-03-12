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
              ? (json['tiles'] as List<dynamic>)
                  .map((dynamic tile) => Tile.fromJson(tile))
                  .toList()
              : List<Tile>.empty(),
    );
  }

  void updatePlayerData(PlayerUpdateData playerData) {
    socketId = playerData.newId ?? socketId;
    user = playerData.publicUser ?? user;
    score = playerData.score ?? score;
    tiles = playerData.tiles ?? tiles;
  }

  Map<String, dynamic> toJson() => {
        'id': socketId,
        'publicUser': user,
        'score': score,
      };
}
