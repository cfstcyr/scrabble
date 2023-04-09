import 'package:mobile/classes/board/position.dart';

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

class HintMessagePayload extends PlacementMessage {
  final String position;

  HintMessagePayload({
    required super.letters,
    required super.points,
    required this.position,
  });
}

class HintMessage {
  final List<HintMessagePayload> hints;

  HintMessage(this.hints);
}
