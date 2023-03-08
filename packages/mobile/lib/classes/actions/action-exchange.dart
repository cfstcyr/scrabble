import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/tile.dart';

class ActionPlacePayload extends ActionPayload {
  late List<Tile> tiles;

  ActionPlacePayload(
      {required this.tiles});

  ActionPlacePayload.fromJson(Map<String, dynamic> json)
      : super.fromJson(json) {
    tiles = (json['tiles'] as List<Map<String, dynamic>>)
        .map((tile) => Tile(
            letter: tile['letter'],
            value: tile['value'],
            isWildcard: tile['isBlank'],
            playedLetter: tile['playedLetter']))
        .toList();
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
    };
  }
}
