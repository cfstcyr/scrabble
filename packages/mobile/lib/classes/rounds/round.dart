
import '../game/player.dart';

class Round {
  final String socketIdOfActivePlayer;

  Round({required this.socketIdOfActivePlayer});

  factory Round.fromJson(Map<String, dynamic> json) {
    return Round(socketIdOfActivePlayer: Player.fromJson(json['playerData']).socketId);
  }
}
