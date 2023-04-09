import 'package:mobile/classes/actions/action-place.dart';
import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';

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

  ActionPlacePayload toActionPayload(TileRack tileRack) {
    var tiles = letters.split('').map((letter) {
      if (letter == letter.toUpperCase()) {
        Tile tile = tileRack.getTileByLetter('*');
        tile.playedLetter = letter;
        return tile;
      }

      return tileRack.getTileByLetter(letter.toUpperCase());
    }).toList();

    Position pos = Position.fromString(position);

    String lastLetter = position.substring(position.length - 1);

    Orientation orientation =
        lastLetter == 'h' ? Orientation.horizontal : Orientation.vertical;


    return ActionPlacePayload(
        tiles: tiles, position: pos, orientation: orientation);
  }
}

class HintMessage {
  final List<HintMessagePayload> hints;

  HintMessage(this.hints);
}
