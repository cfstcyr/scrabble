class PlacementMessage {
  final String letters;
  final int points;

  PlacementMessage({
    required this.letters,
    required this.points,
  });
}

class OpponentPlacementMessage extends PlacementMessage {
  final String name;

  OpponentPlacementMessage({
    required this.name,
    required super.letters,
    required super.points,
  });
}
