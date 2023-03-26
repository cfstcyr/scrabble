import 'package:mobile/classes/actions/action-place.dart';

class WordPlacement {
  final ActionPlacePayload actionPlacePayload;

  WordPlacement({required this.actionPlacePayload});

  Map<String, dynamic> toJson() => {
    'wordPlacement': {
      'tilesToPlace': actionPlacePayload.toJson()['tiles'],
      'orientation': actionPlacePayload.toJson()['orientation'],
      'startPosition': actionPlacePayload.toJson()['startPosition'],
    },
  };
}
