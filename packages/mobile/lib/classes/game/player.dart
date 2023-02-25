import 'package:mobile/classes/user.dart';

class Player {
  PublicUser user;
  int points;
  bool isLocalPlayer;

  Player({
    required this.user,
    required this.points,
    this.isLocalPlayer = false,
  });
}
