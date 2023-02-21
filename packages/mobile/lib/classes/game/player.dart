class Player {
  String name;
  int points;
  bool isLocalPlayer;

  Player({
    required this.name,
    required this.points,
    this.isLocalPlayer = false,
  });
}