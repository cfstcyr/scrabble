import 'package:mobile/classes/actions/action-place.dart';
import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/tile-parser.dart';

class WordPlacement {
  final ActionPlacePayload actionPlacePayload;

  WordPlacement({required this.actionPlacePayload});

  Map<String, dynamic> toJson() =>
      {
        'wordPlacement': {
          'tilesToPlace': actionPlacePayload.toJson()['tiles'],
          'orientation': actionPlacePayload.toJson()['orientation'],
          'startPosition': actionPlacePayload.toJson()['startPosition'],
        },
      };
}


class ScoredWordPlacement extends ActionPlacePayload {
  final int score;

  ScoredWordPlacement(
      {required super.tiles, required super.position, required super.orientation, required this.score});

  factory ScoredWordPlacement.fromJson(Map<String, dynamic> json) {
    ActionPlacePayload wordPlacement = ActionPlacePayload.fromJson(json);
    return ScoredWordPlacement(
        tiles: wordPlacement.tiles,
        position: wordPlacement.position,
        orientation: wordPlacement.orientation,
        score: json['score'] as int);
  }
}
