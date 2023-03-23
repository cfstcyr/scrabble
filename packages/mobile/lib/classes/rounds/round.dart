
import 'package:mobile/constants/create-game.constants.dart';

import '../game/player.dart';

class Round {
  final String socketIdOfActivePlayer;
  late final Duration duration;

  Round({required this.socketIdOfActivePlayer, this.duration = DEFAULT_TIME});

  factory Round.fromJson(Map<String, dynamic> json) {
    return Round(socketIdOfActivePlayer: Player.fromJson(json['playerData']).socketId);
  }

  Round withDuration(Duration roundDuration) {
    duration = roundDuration;
    return this;
  }
}
