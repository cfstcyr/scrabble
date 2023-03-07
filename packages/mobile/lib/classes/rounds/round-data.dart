import 'package:mobile/classes/player/player.dart';

class RoundData {
  PlayerData playerData;
  DateTime startTime;
  DateTime limitTime;
  DateTime? completedTime;

  RoundData(
      {required this.playerData,
      required this.startTime,
      required this.limitTime,
      this.completedTime});
}
