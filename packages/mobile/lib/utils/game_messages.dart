import 'package:mobile/classes/game/game_messages.dart';

final RegExp _placementRegex =
    RegExp(r'Vous avez placé (?<letters>[A-Z]+) pour (?<points>[0-9]+) points');
final RegExp _opponentPlacementRegex = RegExp(
    r'(?<name>.+) a placé (?<letters>[A-Z]+) pour (?<points>[0-9]+) points');

PlacementMessage? getPlacementMessage(String message) {
  OpponentPlacementMessage? opponent = _getOpponentPlacementMessage(message);

  if (opponent != null) return opponent;

  RegExpMatch? match = _placementRegex.firstMatch(message);

  if (match != null) {
    return PlacementMessage(
        letters: match.namedGroup("letters")!,
        points: int.parse(match.namedGroup("points")!));
  }

  return null;
}

OpponentPlacementMessage? _getOpponentPlacementMessage(String message) {
  RegExpMatch? match = _opponentPlacementRegex.firstMatch(message);

  if (match != null) {
    return OpponentPlacementMessage(
        name: match.namedGroup("name")!,
        letters: match.namedGroup("letters")!,
        points: int.parse(match.namedGroup("points")!));
  }

  return null;
}
