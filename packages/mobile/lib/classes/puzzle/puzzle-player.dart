import 'package:mobile/classes/user.dart';

class PuzzlePlayer {
  final PublicUser user;
  int streakPoints;
  int streakMaxPoints;

  PuzzlePlayer(
      {required this.user,
      required this.streakPoints,
      required this.streakMaxPoints});
}
