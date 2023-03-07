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
      tiles: json['tiles'] != null ? List<Tile>.from(json['tiles']).map((dynamic tile) => Tile.fromJson(tile)).toList() : List<Tile>.empty(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': socketId,
    'publicUser': user,
    'score': score,
  };
}
