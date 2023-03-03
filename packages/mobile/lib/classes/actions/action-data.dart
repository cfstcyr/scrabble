import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/tile.dart';

import '../../constants/erros/action-errors.dart';

enum ActionType {
  place,
  exchange,
  pass,
  hint;

  String get name {
    switch (this) {
      case ActionType.place:
        return 'placer';
      case ActionType.exchange:
        return 'échanger';
      case ActionType.pass:
        return 'passer';
      case ActionType.hint:
        return 'indice';
    }
  }

  static ActionType fromString(String value) {
    return ActionType.values.firstWhere(
        (ActionType type) => type.name.toLowerCase() == value.toLowerCase());
  }

  static ActionType fromInteger(int value) {
    return ActionType.values[value];
  }

  static ActionType parse(dynamic value) {
    if (value is String) {
      return ActionType.fromString(value);
    } else if (value is int) {
      return ActionType.fromInteger(value);
    }
    throw Exception(NO_JSON_VALUE_MATCH);
  }
}

abstract class ActionPayload {
  ActionPayload();

  ActionPayload.fromJson(Map<String, dynamic> json);

  Map toJson();
}

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

class ActionData<T extends ActionPayload> {
  final ActionType type;
  final T? payload;

  ActionData({
    required this.type,
    required this.payload,
  });

  factory ActionData.fromJson(Map<String, dynamic> json) {
    return ActionData(
        type: ActionType.parse(json['type']),
        payload: json['payload'] ? json['payload'] as T : null);
  }

  Map<String, dynamic> toJson() => {
        'type': type,
        'payload': payload != null ? payload!.toJson() : null,
      };
}
