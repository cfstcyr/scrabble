import 'package:mobile/constants/create-game.constants.dart';

import '../game/player.dart';

class Round {
  final String socketIdOfActivePlayer;
  late final Duration duration;

  Round({required this.socketIdOfActivePlayer, this.duration = DEFAULT_TIME});

  factory Round.fromJson(Map<String, dynamic> json) {
    return Round(
        socketIdOfActivePlayer: Player.fromJson(json['playerData']).socketId,
        duration:
            _parseDurationFromDates(json['startTime'], json['limitTime']));
  }

  static Duration _parseDurationFromDates(
      DateTime startTime, DateTime endTime) {
    print(startTime);
    print(endTime);
    print(endTime.difference(startTime));
    return endTime.difference(startTime);
  }
}
