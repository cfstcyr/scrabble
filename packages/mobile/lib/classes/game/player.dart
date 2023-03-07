import 'package:mobile/classes/user.dart';

class Player {
  String socketId;
  PublicUser user;
  int score;
  bool isLocalPlayer;

  Player({
    required this.socketId,
    required this.user,
    required this.score,
    this.isLocalPlayer = false,
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      socketId: json['id'],
      user: PublicUser.fromJson(json['publicUser']),
      score: json['score'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': socketId,
    'publicUser': user,
    'score': score,
  };
}
