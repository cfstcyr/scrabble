
import '../game/player.dart';

class Round {
  final String idOfActiveUser;

  Round({required this.idOfActiveUser});

  factory Round.fromJson(Map<String, dynamic> json) {
    return Round(idOfActiveUser: Player.fromJson(json['playerData']).socketId);
  }
}
