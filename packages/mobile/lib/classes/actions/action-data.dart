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
    return ActionType.values.firstWhere((ActionType type) =>
    type.name.toLowerCase() == value.toLowerCase());
  }

  static ActionType fromInteger(int value) {
    return ActionType.values[value];
  }

  static ActionType fromJson(dynamic value) {
    if (value is String) {
      return ActionType.fromString(value);
    } else if (value is int) {
      return ActionType.fromInteger(value);
    }
    throw Exception(NO_JSON_VALUE_MATCH);
  }
}

class ActionPayload {
  ActionPayload();

  factory ActionPayload.fromJson(Map<String, dynamic> json) => ActionPayload();

  Map toJson() => {};
}

class ActionData<T extends ActionPayload> {
  final ActionType type;
  final T payload;

  ActionData({
    required this.type,
    required this.payload,
  });

  factory ActionData.fromJson(Map<String, dynamic> json) {
    return ActionData(type: ActionType.fromJson(json['type']), payload: json['payload'] as T);
  }

  Map<String, dynamic> toJson() => {
    'type': type,
    'payload': payload.toJson(),
  };
}
