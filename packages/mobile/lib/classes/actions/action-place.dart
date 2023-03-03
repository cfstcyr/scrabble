import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/tile.dart';

class ActionPlacePayload extends ActionPayload {
  late List<Tile> tiles;
  late Position position;
  late Orientation orientation;

  ActionPlacePayload(
      {required this.tiles, required this.position, required this.orientation});

  ActionPlacePayload.fromJson(Map<String, dynamic> json)
      : super.fromJson(json) {
    tiles = (json['tiles'] as List<Map<String, dynamic>>)
        .map((tile) => Tile(
            letter: tile['letter'],
            value: tile['value'],
            isWildcard: tile['isBlank'],
            playedLetter: tile['playedLetter']))
        .toList();
    position =
        Position(json['startPosition']['column'], json['startPosition']['row']);
    orientation = orientationFromInt(json['orientation']);
  }

  @override
  Map toJson() {
    return {
      'tiles': tiles.map((tile) => {
            'letter': tile.letter,
            'value': tile.value,
            'isBlank': tile.isWildcard,
            'playedLetter': tile.playedLetter,
          }),
      'startPosition': {
        'column': position.column,
        'row': position.row,
      },
      'orientation': orientation.toInt(),
    };
  }
}
